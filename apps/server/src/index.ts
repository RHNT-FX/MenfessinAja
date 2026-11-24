import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

import { ENV } from './config/env.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { adminRouter } from './routes/admin.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { healthRouter } from './routes/health.routes.js';
import { postsRouter } from './routes/posts.routes.js';
import { transactionsRouter } from './routes/transactions.routes.js';

const app = new Hono();

// Global Middlewares
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors({
  origin: '*', // Di production dapat dibatasi ke domain web client
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Error Handling
app.onError(errorHandler);

// Route Registration (Sesuai SDD 1.2 & 6 Design Arsitektur)
// Daftarkan baik dengan prefix /api maupun tanpa prefix
// agar kompatibel di Vercel rewrites (apapun format URL yang diteruskan)
const registerRoutes = (prefix: string) => {
  app.route(`${prefix}/health`, healthRouter);
  app.route(`${prefix}/auth`, authRouter);
  app.route(`${prefix}/posts`, postsRouter);
  app.route(`${prefix}/transaction`, transactionsRouter);
  app.route(`${prefix}/transactions`, transactionsRouter);
  app.route(`${prefix}/admin`, adminRouter);
};

registerRoutes('/api');
registerRoutes('');

// Fallback 404
app.notFound((c) => {
  return c.json({
    success: false,
    message: `Rute API [${c.req.method} ${c.req.url}] tidak ditemukan`
  }, 404);
});

// Start Server (Hanya dijalankan jika bukan lingkungan serverless seperti Vercel)
if (!process.env.VERCEL) {
  console.log(`🚀 [Menfessin Aja API] Menjalankan peladen Hono pada port ${ENV.PORT}...`);
  serve({
    fetch: app.fetch,
    port: ENV.PORT
  });
}

export { app };
export default app;
