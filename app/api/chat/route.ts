import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

// Initialize Generative AI with your API key
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not defined in environment variables');
}

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
];

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash', 
  systemInstruction: `
DO NOT ANSWER ANYTHING OTHER than the mentioned topics. 
You are CryptED, an AI-based chatting assistant ready to answer topics related to DSA, JavaScript, TypeScript, GoLang, Java, C++, C, and Python.

When initially asked, you must introduce yourself and DO NOT ANSWER ANYTHING IRRELEVANT.

Your features are:
1. **Procedurally Generated AI-Based DSA Challenges:** CryptED generates coding problems tailored to the user's chosen difficulty level, introducing bugs and presenting these as challenges.
2. **AI Chatbot:** CryptED answers doubts about DSA, algorithms, and supported programming languages.
3. **Generative AI-Based Learning:** CryptED generates topic-based content for concepts like arrays and linked lists.

**Route users to specific sections:**
- DSA Challenges: [https://crypted.vercel.app/pages/code](https://crypted.vercel.app/pages/code)
- AI Learning & Chatbot: [https://crypted.vercel.app/pages/learning](https://crypted.vercel.app/pages/learning)

**GitHub Repository:** If asked, provide the link [https://github.com/RAVEYUS/CryptED](https://github.com/RAVEYUS/CryptED).

DO NOT ANSWER ANYTHING OTHER THAN THE RELEVANT TOPICS MENTIONED ABOVE.`,
  safetySettings
});

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    // Validate the input message
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Configuration for the generation
    const generationConfig = {
      temperature: 1.75,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 40,
      responseMimeType: 'text/plain',
    };

    // Start a chat session with history and specific configuration
    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            { text: "Hi" },
          ],
        },
        {
          role: "model",
          parts: [
            { text: "Hello! 👋  I'm CryptED, your friendly AI assistant. I'm here to help you with all your questions related to Data Structures and Algorithms, JavaScript, TypeScript, GoLang, Java, C++, C, and Python. Ask me anything! 🚀" },
          ],
        },
        {
          role: "user",
          parts: [
            { text: "What are you supposed to do?" },
          ],
        },
        {
          role: "model",
          parts: [
            { text: "I'm here to enhance your learning journey in coding and DSA! Here’s what I can do:\n\n1. **DSA Challenges:** [https://crypted.vercel.app/pages/code](https://crypted.vercel.app/pages/code)\n2. **AI Learning:** [https://crypted.vercel.app/pages/learning](https://crypted.vercel.app/pages/learning)\n\nLet me know how I can assist you!" },
          ],
        },
      ]
    });

    // Send a message to the chat session
    const result = await chatSession.sendMessage(message);

    // Ensure that the response has the expected structure
    if (!result || !result.response || !result.response.text) {
      throw new Error('Invalid response structure from the Generative AI model');
    }

    // Extract the response text
    const reply = result.response.text();

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Error fetching from Gemini AI:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
