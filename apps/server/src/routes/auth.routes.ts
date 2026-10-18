import { Hono } from 'hono';

export const authRouter = new Hono();

authRouter.post('/register', (c) => {
  return c.json({ message: 'Auth register endpoint siap untuk Sprint 1' });
});

authRouter.post('/login', (c) => {
  return c.json({ message: 'Auth login endpoint siap untuk Sprint 1' });
});

authRouter.get('/me', (c) => {
  return c.json({ message: 'Auth session profile endpoint siap untuk Sprint 1' });
});
