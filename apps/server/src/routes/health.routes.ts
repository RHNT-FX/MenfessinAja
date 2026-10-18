import { Hono } from 'hono';

export const healthRouter = new Hono();

healthRouter.get('/', (c) => {
  return c.json({
    status: 'ok',
    service: 'Menfessin Aja API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
