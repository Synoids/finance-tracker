'use server';

import { getChatResponse, ChatMessage } from "./ai-chat-service";

export async function sendChatMessage(message: string, history: ChatMessage[] = []) {
  try {
    const response = await getChatResponse(message, history);
    return { success: true, response };
  } catch (error) {
    console.error("AI Chat Error:", error);
    return { success: false, error: "Gagal mendapatkan respon dari AI." };
  }
}

