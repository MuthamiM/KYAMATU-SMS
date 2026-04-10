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

    // 2. FETCH STATUS OF INTEGRATIONS (Awareness)
    const studentIntegrations = await prisma.student.findUnique({
      where: { id: studentId },
      select: { googleRefreshToken: true, microsoftRefreshToken: true }
    });

    const isGoogleLinked = !!studentIntegrations?.googleRefreshToken;
    const isMicrosoftLinked = !!studentIntegrations?.microsoftRefreshToken;

    // 3. Fetch history Context
    const history = await getChatHistory(studentId);

    const systemPrompt = `
      You are KyamaBot, a helpful AI assistant for Kyamatu Primary School students.
      The current date and time is ${new Date().toLocaleString()}.
      
      STUDENT CONTEXT:
      - Name: ${dashboardData.student.firstName}
      - Fee Balance: KES ${feeBalance}
      - Today's Classes: ${classesToday}
      - SYNC STATUS: Google Calendar: ${isGoogleLinked ? 'CONNECTED' : 'NOT LINKED'}, Microsoft To-Do: ${isMicrosoftLinked ? 'CONNECTED' : 'NOT LINKED'}
      
      Always use the STUDENT CONTEXT above when answering questions about the student's fees, classes, or schedule. Be extremely helpful and friendly. Keep answers brief unless details are requested.
      
      SYNC INSTRUCTIONS:
      1. If the student asks to sync to their phone or an external calendar:
         - If BOTH are NOT LINKED: Inform them they must first click the "Link" button in the "Services & Sync" card on their dashboard.
         - If at least one is LINKED: Proceed with creating the reminder; it will sync automatically.
      2. NEVER claim you can directly access their physical phone hardware. You only sync via the cloud services if they are LINKED.
      3. If they ask to sync but are NOT LINKED, do NOT set the REMINDER type yet; just use CHAT to explain the Link step.
      
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
      console.error('Failed to parse AI response as JSON:', aiResponseText, parseError.message);
      await prisma.aiChatMessage.create({
        data: { studentId, role: 'bot', content: aiResponseText }
      });
      return aiResponseText; // Return raw text if JSON parsing fails
    }
  } catch (error) {
    console.error('AI Service Error stack:', error.stack || error);
    console.error('AI Service Error message:', error.message);
    
    // Check for specific error types to provide better feedback
    if (error.response?.status === 429) return "I'm a bit overwhelmed with requests right now. Could you wait a moment and try again?";
    if (error.response?.status === 401) return "I'm having trouble accessing my AI intelligence right now. Please check my API configuration.";
    
    return "I'm sorry, I'm having trouble processing that request right now. It might be a bit too complex or something went wrong on my end. Could you try a simpler question?";
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
