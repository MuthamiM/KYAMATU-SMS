import axios from 'axios';
import * as reminderService from '../reminders/reminder.service.js';
import * as dashboardService from '../dashboard/dashboard.service.js';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

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

    const prompt = `
      You are KyamaBot, a helpful AI assistant for Kyamatu Primary School students.
      The current date and time is ${new Date().toLocaleString()}.
      
      STUDENT CONTEXT:
      - Name: ${dashboardData.student.firstName}
      - Fee Balance: KES ${feeBalance}
      - Today's Classes: ${classesToday}
      
      Always use the STUDENT CONTEXT above when answering questions about the student's fees, classes, or schedule. Be extremely helpful and friendly. Keep answers brief unless details are requested.
      
      If the student wants to set a reminder or plan a task (like "remind me to study math tomorrow at 4pm"), respond with a JSON object in the following format:
      {
        "type": "REMINDER",
        "reply": "Sure! I've set a reminder for [task] at [time].",
        "data": {
          "title": "[Short Task Title]",
          "description": "[Optional Details]",
          "remindAt": "[ISO Date String]"
        }
      }
      
      If it's just a general chat or a question, respond with:
      {
        "type": "CHAT",
        "reply": "[Your friendly response]"
      }
      
      User message: "${message}"
    `;

    const response = await axios.post(OPENROUTER_API_URL, {
      model: 'openai/gpt-3.5-turbo', // Default model, can be changed
      messages: [{ role: 'user', content: prompt }],
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

      return result.reply;
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', aiResponseText);
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
