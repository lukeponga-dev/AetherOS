import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse, AppId } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are the kernel of "Aether OS", a futuristic AI-first operating system.
Your job is to interpret user natural language inputs and translate them into JSON system commands.

The OS has the following Apps/Modules available:
1. "omni" (AppId: 'omni') - The main assistant, chat, and dashboard.
2. "memories" (AppId: 'memories') - A semantic file system/explorer.
3. "flow" (AppId: 'flow') - Automation and settings center.
4. "notepad" (AppId: 'notepad') - A text editor.

You must return a JSON object that strictly adheres to the schema provided.
- If the user wants to find a file, use intent "SEARCH_FILES" and put the search terms in payload.query.
- If the user wants to open an app, use intent "OPEN_APP".
- If the user wants to write something, use intent "CREATE_NOTE".
- If the user just wants to chat, use intent "CHAT".

Maintain a helpful, futuristic, and concise persona in the "message" field.
`;

export const processUserIntent = async (input: string): Promise<AIResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: input,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: {
              type: Type.STRING,
              enum: ['OPEN_APP', 'SEARCH_FILES', 'CREATE_NOTE', 'TOGGLE_SETTING', 'CHAT']
            },
            appId: {
              type: Type.STRING,
              enum: ['omni', 'memories', 'flow', 'notepad'],
              nullable: true
            },
            payload: {
              type: Type.OBJECT,
              properties: {
                query: { type: Type.STRING, nullable: true },
                content: { type: Type.STRING, nullable: true },
                setting: { type: Type.STRING, nullable: true }
              },
              nullable: true
            },
            message: {
              type: Type.STRING,
              description: "A short, system-style confirmation message for the user."
            }
          },
          required: ["intent", "message"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI Kernel");
    
    return JSON.parse(text) as AIResponse;

  } catch (error) {
    console.error("AI Kernel Panic:", error);
    return {
      intent: 'CHAT',
      message: "I'm having trouble connecting to the neural core. Please try again."
    };
  }
};