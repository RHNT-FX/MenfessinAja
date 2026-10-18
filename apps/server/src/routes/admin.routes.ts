import { Hono } from 'hono';

export const adminRouter = new Hono();

adminRouter.get('/posts/flagged', (c) => {
  return c.json({ message: 'Admin flagged queue endpoint siap untuk Sprint 5' });
});

adminRouter.post('/posts/moderate', (c) => {
  return c.json({ message: 'Admin moderate post endpoint siap untuk Sprint 5' });
});

adminRouter.get('/transactions', (c) => {
  return c.json({ message: 'Admin transaction logs endpoint siap untuk Sprint 5' });
});

adminRouter.post('/users/ban', (c) => {
  return c.json({ message: 'Admin ban user endpoint siap untuk Sprint 5' });
});
