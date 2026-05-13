import { IntelligenceState } from "./intelligence-core";
import { ChatMessage } from "./ai-chat-service";

export type NarrativeStyle = 'FOCUSED' | 'ANALYTICAL' | 'ENCOURAGING' | 'CAUTIOUS';

export interface NarrativeVariation {
  style: NarrativeStyle;
  templates: string[];
}

const OBSERVATION_TEMPLATES: Record<NarrativeStyle, string[]> = {
  FOCUSED: [
    "Saya mencatat adanya hal mendesak: {insight}",
    "Perhatian utama saat ini: {insight}",
    "Data menunjukkan isu prioritas pada {insight}"
  ],
  ANALYTICAL: [
    "Berdasarkan analisis data terbaru, {insight}",
    "Jika kita melihat detail transaksi, {insight}",
    "Analisis saya menunjukkan bahwa {insight}"
  ],
  ENCOURAGING: [
    "Kabar baik! Saya melihat {insight}",
    "Ada progres positif: {insight}",
    "Kondisi Anda cukup stabil, terutama pada {insight}"
  ],
  CAUTIOUS: [
    "Data saat ini masih terbatas, namun saya melihat {insight}",
    "Berdasarkan pola awal yang terdeteksi, {insight}",
    "Ada indikasi awal mengenai {insight}"
  ]
};

export function selectNarrativeStyle(intel: IntelligenceState): NarrativeStyle {
  if (intel.health.dimensions.runway < 30 || intel.activeEvents.some(e => e.priority > 0.8)) {
    return 'FOCUSED';
  }
  if (intel.health.total > 80) {
    return 'ENCOURAGING';
  }
  if (intel.behavior.confidence < 0.6) {
    return 'CAUTIOUS';
  }
  return 'ANALYTICAL';
}

export function getVariedTemplate(style: NarrativeStyle, type: 'observation' | 'recommendation'): string {
  const templates = OBSERVATION_TEMPLATES[style];
  return templates[Math.floor(Math.random() * templates.length)];
}

export function detectRedundancy(history: ChatMessage[]): { balanceRepeated: boolean; limitRepeated: boolean } {
  const lastMessages = history.slice(-3).map(m => m.content.toLowerCase());
  return {
    balanceRepeated: lastMessages.some(m => m.includes('saldo total') || m.includes('uang anda')),
    limitRepeated: lastMessages.some(m => m.includes('batas harian') || m.includes('belanja aman'))
  };
}
