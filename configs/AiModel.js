import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro-latest",  // Changed to more reliable model
});

const generationConfig = {
  temperature: 0.7,
  topP: 0.8,
  topK: 40,
  maxOutputTokens: 8192,
};

// Main session instance used in other parts of your project
export const AiSession = model.startChat({
  generationConfig,
  history: [],
});

// Helper function to send a message and get a response
export async function sendChatMessage(userInput, noteTitle, noteContent) {
  try {
    console.log("Starting chat with input:", { userInput, noteTitle, noteContent });
    
    const chat = model.startChat({
      generationConfig,
      history: [],
    });

    const prompt = `
Context: You are an AI assistant helping to analyze and answer questions about a note.
Note Title: ${noteTitle}
Note Content: ${noteContent}

User Question: ${userInput}

Please provide a clear and concise response based solely on the information contained in the note. If the information needed to answer the question is not present in the note, please state that clearly.
`;

    console.log("Sending prompt to model:", prompt);

    const result = await chat.sendMessage(prompt);
    console.log("Raw API response:", result);

    // Correctly access the response text
    const responseText = result.response.candidates[0]?.content?.parts?.[0]?.text;
    console.log("Extracted response text:", responseText);

    if (responseText) {
      return { content: responseText };
    } else {
      throw new Error("No response text received");
    }
  } catch (error) {
    console.error("Error in sendChatMessage:", error);
    throw error;
  }
}