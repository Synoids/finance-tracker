import { getRawFinancialData } from "./service";
import { generateIntelligence, IntelligenceState } from "./intelligence-core";
import { selectNarrativeStyle, detectRedundancy } from "./narrative-engine";
import { getResilientModel } from "./gemini-config";
import { formatCurrency } from "@/lib/utils";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function getChatResponse(message: string, history: ChatMessage[] = []): Promise<string> {
  const rawData = await getRawFinancialData();
  
  if (!rawData) {
    return "Maaf, saya tidak dapat mengakses data keuangan Anda saat ini. Silakan pastikan Anda sudah masuk ke akun Anda.";
  }

  const intel = generateIntelligence(rawData);
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("[Gemini] API Key missing. Falling back to deterministic response.");
    return getFallbackResponse(message, intel);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Resilient Model Resolution
    const { model, name: modelName } = await getResilientModel(genAI);
    console.log(`[Gemini] Using model: ${modelName}`);

    const compressedHistory = history.slice(-6);
    const historyText = compressedHistory.map(m => `${m.role === 'user' ? 'Pengguna' : 'Asisten'}: ${m.content}`).join('\n');

    const narrativeStyle = selectNarrativeStyle(intel);
    const redundancy = detectRedundancy(history);
    const isGeneralAdvice = /saran|rekomendasi|gimana|bagaimana|kondisi|status/i.test(message);

    const intelligenceContext = `
STYLE NARRATIVE: ${narrativeStyle}
REDUNDANCY DETECTED: Balance=${redundancy.balanceRepeated}, DailyLimit=${redundancy.limitRepeated}

REKOMENDASI PRIORITAS:
${intel.recommendations.map(r => `[${r.priority.toUpperCase()}] ${r.title}: ${r.advice} -> Langkah: ${r.action}`).join('\n')}

DATA FINANSIAL INTI:
- Skor Kesehatan: ${intel.health.total}/100
- Saldo Total: ${formatCurrency(intel.deterministicMetrics.totalBalance)}
- Batas Belanja Harian: ${formatCurrency(intel.deterministicMetrics.safeDailyLimit)}/hari
- Runway: ${intel.deterministicMetrics.projectedDepletionDate || 'N/A'}
    `;

    const prompt = `
Anda adalah "Finance Assistant", penasihat keuangan profesional yang tenang dan observant.

INSTRUKSI SUSTAINABILITY:
1. CONTINUITY AWARENESS: Jika pengguna bertanya hal yang mirip dengan riwayat sebelumnya, akuilah keterlanjutan tersebut.
2. REDUNDANCY SUPPRESSION: Jika riwayat menunjukkan Anda baru saja menyebutkan saldo atau batas harian, jangan sebutkan lagi secara eksplisit kecuali ditanya.
3. PROGRESSIVE DISCLOSURE: Jika kondisi kritis, berikan HANYA 1 saran terpenting.
4. VARIASI NARASI: Gunakan variasi kata pembuka yang natural.
5. TONE STABILITY: Tetap tenang dan praktis.

${isGeneralAdvice ? "PENGGUNA MEMINTA STATUS/SARAN. Berikan 1 observasi (fakta), 1 prediksi (jika berlanjut), dan 1 langkah nyata." : ""}

KONTEKS DATA:
${intelligenceContext}

RIWAYAT PERCAKAPAN:
${historyText}

PERTANYAAN PENGGUNA:
"${message}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();

  } catch (error: any) {
    const errorMsg = error?.message || "Unknown error";
    const statusCode = error?.status || "Unknown";
    console.error(`[Gemini] AI Narrative Error (Status: ${statusCode}): ${errorMsg}`);
    
    // Differentiate between Quota and other errors
    if (statusCode === 429) {
      return "Maaf, kuota harian asisten AI sedang penuh. Namun, saya tetap bisa membantu dengan data sistem berikut:\n" + getFallbackResponse(message, intel);
    }

    return getFallbackResponse(message, intel);
  }
}

function getFallbackResponse(message: string, intel: IntelligenceState): string {
  const balance = formatCurrency(intel.deterministicMetrics.totalBalance);
  const dailyLimit = formatCurrency(intel.deterministicMetrics.safeDailyLimit);
  
  const topRec = intel.recommendations[0];
  const advicePart = topRec 
    ? `\n\nSaran utama: **${topRec.title}**\n${topRec.advice}\nLangkah: ${topRec.action}`
    : "";

  return `Layanan analisis AI sedang tidak tersedia sementara. Saldo total Anda saat ini ${balance} dengan batas aman pengeluaran harian ${dailyLimit}.${advicePart}`;
}





