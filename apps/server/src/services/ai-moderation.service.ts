// =====================================================================
// AI MODERATION SERVICE (Juan Router NLP AI Integration)
// Sesuai SRS FR-003, NFR-002, dan SDD 4.3 (Sequence Diagram Moderasi)
// =====================================================================

import { ENV } from '../config/env.js';

export interface ModerationResult {
  isSafe: boolean;
  aiScore: number; // 0.0 (sangat aman) hingga 1.0 (sangat berbahaya)
  flags: string[];
  status: 'approved' | 'flagged';
  reason?: string;
}

// Daftar kata/pola berbahaya untuk evaluasi lokal / fallback heuristic
const TOXIC_PATTERNS = [
  { pattern: /\b(mati|bunuh|hajar|bakar|serang|pukul)\s+(kau|kamu|dia|mereka|kalian)\b/i, category: 'threat', score: 0.95 },
  { pattern: /\b(lonte|perek|bajingan|bangsat|kontol|memek|anjing|babi|pantek|ngentot)\b/i, category: 'profanity', score: 0.85 },
  { pattern: /\b(bocorin|doxx|sebarin|bocorkan)\s+(ktp|foto|alamat|nomor|rahasia)\b/i, category: 'doxxing', score: 0.90 },
  { pattern: /\b(tolol|goblok|idiot|cacat|bego)\s+(banget|lu|kamu|dosen|dekan)\b/i, category: 'harassment', score: 0.78 },
  { pattern: /\b(jual|beli)\s+(narkoba|ganja|sabu|miras|bokep)\b/i, category: 'prohibited_items', score: 0.98 },
];

export class AiModerationService {
  /**
   * Menilai kelayakan konten teks menfess/komentar
   * Threshold: aiScore >= 0.7 akan berstatus 'flagged', < 0.7 berstatus 'approved'
   */
  static async evaluateText(text: string): Promise<ModerationResult> {
    if (!text || text.trim().length === 0) {
      return {
        isSafe: true,
        aiScore: 0.0,
        flags: [],
        status: 'approved',
      };
    }

    // 1. Coba panggil Juan Router API jika bukan mock key
    const isMockKey = !ENV.JUAN_ROUTER_API_KEY || ENV.JUAN_ROUTER_API_KEY.includes('mock') || ENV.JUAN_ROUTER_API_KEY.includes('demo');

    if (!isMockKey) {
      try {
        const response = await this.callJuanRouterApi(text);
        if (response) {
          return response;
        }
      } catch (err) {
        console.warn('[AiModerationService] Juan Router API unreachable, falling back to local heuristic:', err);
      }
    }

    // 2. Local Fallback / Heuristic NLP Evaluator
    return this.evaluateHeuristic(text);
  }

  /**
   * Evaluasi Heuristik Cerdas (Lokal / Mock / Offline)
   */
  private static evaluateHeuristic(text: string): ModerationResult {
    const flags: string[] = [];
    let maxScore = 0.02; // Base baseline score aman

    for (const item of TOXIC_PATTERNS) {
      if (item.pattern.test(text)) {
        flags.push(item.category);
        if (item.score > maxScore) {
          maxScore = item.score;
        }
      }
    }

    // Normalisasi desimal 2 angka
    const roundedScore = Math.round(maxScore * 100) / 100;
    const isSafe = roundedScore < 0.70;

    return {
      isSafe,
      aiScore: roundedScore,
      flags,
      status: isSafe ? 'approved' : 'flagged',
      reason: !isSafe 
        ? `Konten mengandung indikasi ${flags.join(', ')} dengan skor AI ${roundedScore}` 
        : undefined,
    };
  }

  /**
   * Integrasi langsung HTTP ke endpoint Juan Router OpenAI-compatible
   */
  private static async callJuanRouterApi(text: string): Promise<ModerationResult | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000); // 4 detik timeout

    try {
      const prompt = `Anda adalah sistem moderasi konten otomatis untuk forum komunitas kampus "Menfessin Aja".
Evaluasi teks berikut dan kembalikan JSON valid saja dengan format persis:
{"is_safe": boolean, "ai_score": float (0.00-1.00), "flags": string[], "reason": string}

Aturan:
- Nilai ai_score >= 0.70 untuk ujaran kebencian, makian kotor/vulgar, pelecehan, ancaman fisik, atau doxxing.
- Nilai ai_score < 0.70 untuk curhat biasa, opini akademik, asmara wajar, atau kritik sopan.

Teks yang dievaluasi:
"""${text}"""`;

      const res = await fetch(`${ENV.JUAN_ROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ENV.JUAN_ROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: ENV.JUAN_ROUTER_TEXT_MODEL,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          response_format: { type: 'json_object' },
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        return null;
      }

      const data = await res.json() as any;
      const content = data?.choices?.[0]?.message?.content;
      if (!content) return null;

      const parsed = JSON.parse(content);
      const aiScore = typeof parsed.ai_score === 'number' ? parsed.ai_score : 0.1;
      const isSafe = aiScore < 0.70;

      return {
        isSafe,
        aiScore: Math.round(aiScore * 100) / 100,
        flags: Array.isArray(parsed.flags) ? parsed.flags : [],
        status: isSafe ? 'approved' : 'flagged',
        reason: parsed.reason,
      };
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }
}
