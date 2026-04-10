import axios from 'axios';
import * as reminderService from '../reminders/reminder.service.js';
import * as dashboardService from '../dashboard/dashboard.service.js';
import prisma from '../../config/database.js';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const getChatHistory = async (studentId) => {
  return await prisma.aiChatMessage.findMany({
    where: { studentId },
    orderBy: { createdAt: 'asc' },
    take: 50 // Keep the last 50 messages to prevent payload bloat
  });
};

export const processChatMessage = async (userId, studentId, message) => {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  
  if (!OPENROUTER_API_KEY) {
    return handleMockResponse(studentId, message);
  }

  try {
    const dashboardData = await dashboardService.getStudentDashboardData(userId);
    const feeBalance = (dashboardData.fees?.balance || 0).toLocaleString();
    const classesToday = dashboardData.timetable.length > 0 
      ? dashboardData.timetable.map(t => `${t.startTime}: ${t.subject.name}`).join(', ')
      : 'No classes scheduled for today.';

    // 1. Save user message to database
    await prisma.aiChatMessage.create({
      data: { studentId, role: 'user', content: message }
    });

    // 2. Fetch history Context
    const history = await getChatHistory(studentId);

    const systemPrompt = `
      You are KyamaBot, a helpful AI assistant for Kyamatu Primary School students.
      The current date and time is ${new Date().toLocaleString()}.
      
      STUDENT CONTEXT:
      - Name: ${dashboardData.student.firstName}
      - Fee Balance: KES ${feeBalance}
      - Today's Classes: ${classesToday}
      
      Always use the STUDENT CONTEXT above when answering questions about the student's fees, classes, or schedule. Be extremely helpful and friendly. Keep answers brief unless details are requested.
      
      If the student wants to set a reminder or plan a task, you CANNOT access their physical phone calendar or Google Calendar. You ONLY have access to the Kyamatu School Dashboard. If they explicitly ask you to sync to their phone, politely inform them that you can only save it to their student dashboard.
      
      To create a student dashboard reminder, respond with a JSON object in the following format:
      {
        "type": "REMINDER",
        "reply": "Sure! I've set a reminder for [task] on your student dashboard.",
        "data": {
          "title": "[Short Task Title]",
          "description": "[Optional Details]",
          "remindAt": "[ISO Date String]"
        }
      }
      
      If it's just a general chat, question, or clarification, respond with:
      {
        "type": "CHAT",
        "reply": "[Your friendly response]"
      }
    `;

    // Map history to OpenRouter array, excluding the very last one which is the current message we just pushed
    const messagesPayload = [
      { role: 'system', content: systemPrompt },
      ...history.slice(0, -1).map(msg => ({ 
        role: msg.role === 'bot' ? 'assistant' : 'user', 
        content: msg.content 
      })),
      { role: 'user', content: message }
    ];

    const response = await axios.post(OPENROUTER_API_URL, {
      model: 'openai/gpt-3.5-turbo',
      messages: messagesPayload,
      response_format: { type: 'json_object' }
    }, {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://kyamatu.ac.ke',
        'X-Title': 'Kyamatu SMS'
      }
    });

    const aiResponseText = response.data.choices[0].message.content;
    
    // Attempt to parse JSON from AI response
    try {
      const jsonStart = aiResponseText.indexOf('{');
      const jsonEnd = aiResponseText.lastIndexOf('}') + 1;
      const jsonStr = aiResponseText.substring(jsonStart, jsonEnd);
      const result = JSON.parse(jsonStr);

      if (result.type === 'REMINDER' && result.data) {
        await reminderService.createReminder({
          ...result.data,
          studentId,
        });
      }

      await prisma.aiChatMessage.create({
        data: { studentId, role: 'bot', content: result.reply }
      });

      return result.reply;
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', aiResponseText);
      await prisma.aiChatMessage.create({
        data: { studentId, role: 'bot', content: aiResponseText }
      });
      return aiResponseText; // Return raw text if JSON parsing fails
    }
  } catch (error) {
    console.error('AI Service Error:', error.message);
    return "I'm sorry, I'm having trouble thinking right now. Could you try again later?";
  }
};

const handleMockResponse = async (studentId, message) => {
  const lowercaseMsg = message.toLowerCase();
  
  if (lowercaseMsg.includes('remind') || lowercaseMsg.includes('set a task')) {
    // Simple mock parser for demo purposes
    const title = message.replace(/remind me to/i, '').split('at')[0].trim();
    const remindAt = new Date();
    remindAt.setHours(remindAt.getHours() + 24); // Default to tomorrow

    await reminderService.createReminder({
      title: title || 'New Task',
      description: 'Set via KyamaBot (Mock Mode)',
      remindAt,
      studentId,
    });

    return `(Mock Mode) I've set a reminder for "${title || 'New Task'}" for tomorrow. (Note: Please set GEMINI_API_KEY for real AI behavior)`;
  }

  return "Hello! I'm KyamaBot. I'm currently in mock mode because no API key was found, but I can still help you set simple reminders if you say 'Remind me to [task]'.";
};
