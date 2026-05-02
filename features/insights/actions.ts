'use server';

import { getChatResponse } from "./ai-chat-service";

export async function sendChatMessage(message: string) {
  try {
    const response = await getChatResponse(message);
    return { success: true, response };
  } catch (error) {
    console.error("AI Chat Error:", error);
    return { success: false, error: "Gagal mendapatkan respon dari AI." };
  }
}
