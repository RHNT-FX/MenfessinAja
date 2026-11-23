// =====================================================================
// ADMIN ROUTES - MENFESSIN AJA
// Rute khusus Administrator (SDD 1.2 & SRS FR-006, FR-007)
// =====================================================================

import { Hono } from 'hono';
import { AdminController } from '../controllers/admin.controller.js';
import { requireAdmin, requireAuth } from '../middlewares/auth.middleware.js';

export const adminRouter = new Hono();

// Seluruh rute admin wajib otentikasi JWT dan ber-role admin
adminRouter.use('*', requireAuth, requireAdmin);

// Antrean konten mencurigakan / flagged
adminRouter.get('/posts/flagged', AdminController.getFlaggedPosts);

// Aksi moderasi (Setujui / Tolak) & penulisan audit log
adminRouter.post('/posts/moderate', AdminController.moderatePost);

// Log audit moderasi permanen
adminRouter.get('/logs', AdminController.getAuditLogs);

// Pemblokiran akun pengguna (User Ban)
adminRouter.post('/users/ban', AdminController.banUser);

// Ringkasan metrik statistik dasbor
adminRouter.get('/stats', AdminController.getStats);
