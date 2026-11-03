import { describe, expect, it } from 'vitest';
import { AiModerationService } from '../services/ai-moderation.service.js';

describe('Sprint 2: Juan Router AI NLP Moderation Tests (FR-003 & SDD 4.3)', () => {
  it('menyetujui (approved) curhatan menfess wajar mahasiswa', async () => {
    const safeText = 'Semangat semuanya yang lagi ngerjain tugas kalkulus 2 di perpus pusat!';
    const result = await AiModerationService.evaluateText(safeText);

    expect(result.isSafe).toBe(true);
    expect(result.status).toBe('approved');
    expect(result.aiScore).toBeLessThan(0.70);
  });

  it('menandai (flagged) konten ancaman kekerasan fisik (ai_score >= 0.7)', async () => {
    const violentText = 'Awas aja besok lu, mati kau kalau ketemu di parkiran fakultas!';
    const result = await AiModerationService.evaluateText(violentText);

    expect(result.isSafe).toBe(false);
    expect(result.status).toBe('flagged');
    expect(result.aiScore).toBeGreaterThanOrEqual(0.70);
    expect(result.flags).toContain('threat');
  });

  it('menandai (flagged) konten kata makian vulgar dan kasar (ai_score >= 0.7)', async () => {
    const abusiveText = 'Dasar bajingan bangsat lu!';
    const result = await AiModerationService.evaluateText(abusiveText);

    expect(result.isSafe).toBe(false);
    expect(result.status).toBe('flagged');
    expect(result.aiScore).toBeGreaterThanOrEqual(0.70);
    expect(result.flags).toContain('profanity');
  });

  it('menandai (flagged) upaya doxxing atau penyebaran data rahasia', async () => {
    const doxxingText = 'Gue bocorin ktp dan data pribadi lu sekarang.';
    const result = await AiModerationService.evaluateText(doxxingText);

    expect(result.isSafe).toBe(false);
    expect(result.status).toBe('flagged');
    expect(result.aiScore).toBeGreaterThanOrEqual(0.70);
    expect(result.flags).toContain('doxxing');
  });
});
