import { getFinancialInsights } from "./service";
import { formatCurrency } from "@/lib/utils";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function getChatResponse(message: string): Promise<string> {
  const insights = await getFinancialInsights();
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

  if (!apiKey) {
    return getFallbackResponse(message, insights);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Prepare context from insights
    const context = insights.map(i => `- ${i.title}: ${i.description}`).join('\n');
    
    const prompt = `
      Anda adalah asisten keuangan pribadi yang cerdas dan ramah bernama "Finance Assistant". 
      Tugas Anda adalah membantu pengguna menganalisis kondisi keuangan mereka berdasarkan data asli berikut:
      
      KONTEKS KEUANGAN PENGGUNA SAAT INI:
      ${context}
      
      INSTRUKSI PENTING:
      1. Gunakan gaya bahasa yang santai, menyemangati, dan profesional (seperti teman yang pintar keuangan).
      2. Berikan saran yang konkret berdasarkan data di atas.
      3. Jika ada data "Pengeluaran Menurun 100%" atau sejenisnya, sadari bahwa ini mungkin karena data transaksi bulan lalu masih kosong (akun baru). Jangan terlalu dramatis memuji jika datanya memang belum ada; sampaikan dengan lebih realistis.
      4. Jika pengguna bertanya hal di luar keuangan, ingatkan dengan sopan bahwa fokus Anda adalah membantu mengelola keuangan.
      5. Gunakan format Markdown (bold, list) agar mudah dibaca. Jawab dalam Bahasa Indonesia.
      
      PERTANYAAN PENGGUNA:
      "${message}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return getFallbackResponse(message, insights);
  }
}

function getFallbackResponse(message: string, insights: any[]): string {
  const msg = message.toLowerCase();

  if (msg.includes('halo') || msg.includes('hi')) {
    return "Halo! Saya asisten keuangan Anda. Ada yang bisa saya bantu analisis hari ini?";
  }

  if (msg.includes('bulan ini') || msg.includes('analisis')) {
    const summary = insights.map(i => `• **${i.title}**: ${i.description}`).join('\n');
    return `Berikut ringkasan keuanganmu bulan ini:\n\n${summary}`;
  }

  return "Maaf, saya sedang sulit terhubung ke sistem utama. Namun saya sarankan untuk tetap memantau anggaran bulanan Anda agar keuangan tetap sehat.";
}
