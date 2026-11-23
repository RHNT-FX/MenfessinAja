// =====================================================================
// MODERATION LOG REPOSITORY (SRS 2.5: Log Audit Moderasi Permanen)
// Mendukung Supabase DDL & In-Memory Fallback
// =====================================================================

import type { ModerationLog } from '@menfessin-aja/shared';
import crypto from 'node:crypto';
import { isSupabaseConfigured, supabase } from '../config/supabase.js';

export interface ModerationLogEntity extends ModerationLog {
  admin_email?: string;
  post_snippet?: string;
}

const mockModerationLogs: ModerationLogEntity[] = [];

export class ModerationRepository {
  /**
   * Menyimpan log keputusan moderasi secara permanen
   */
  static async createLog(payload: {
    adminId: string;
    postId: string;
    keputusan: 'approve' | 'reject';
    alasan?: string;
    adminEmail?: string;
    postSnippet?: string;
  }): Promise<ModerationLogEntity> {
    const log: ModerationLogEntity = {
      id: crypto.randomUUID(),
      admin_id: payload.adminId,
      post_id: payload.postId,
      keputusan: payload.keputusan,
      alasan: payload.alasan || (payload.keputusan === 'approve' ? 'Konten memenuhi pedoman' : 'Konten melanggar pedoman komunitas'),
      created_at: new Date().toISOString(),
      admin_email: payload.adminEmail || 'admin@menfessinaja.ac.id',
      post_snippet: payload.postSnippet
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('moderation_logs')
        .insert({
          id: log.id,
          admin_id: log.admin_id,
          post_id: log.post_id,
          keputusan: log.keputusan,
          alasan: log.alasan,
          created_at: log.created_at
        })
        .select()
        .single();

      if (error) {
        console.error('[ModerationRepository] Error saving moderation log in Supabase:', error);
      } else if (data) {
        return {
          ...data,
          admin_email: log.admin_email,
          post_snippet: log.post_snippet
        } as ModerationLogEntity;
      }
    }

    mockModerationLogs.unshift(log);
    return log;
  }

  /**
   * Mengambil riwayat log audit moderasi
   */
  static async getLogs(limit: number = 20): Promise<ModerationLogEntity[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('moderation_logs')
        .select('*, users(email), posts(teks_konten)')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!error && data) {
        return data.map((item: any) => ({
          id: item.id,
          admin_id: item.admin_id,
          post_id: item.post_id,
          keputusan: item.keputusan,
          alasan: item.alasan,
          created_at: item.created_at,
          admin_email: item.users?.email || 'admin@menfessinaja.ac.id',
          post_snippet: item.posts?.teks_konten?.slice(0, 60)
        }));
      }
    }

    return mockModerationLogs.slice(0, limit);
  }
}
