import { Hono } from 'hono';

export const transactionsRouter = new Hono();

transactionsRouter.post('/checkout', (c) => {
  return c.json({ message: 'Transaction checkout endpoint siap untuk Sprint 4' });
});

transactionsRouter.post('/webhook', (c) => {
  return c.json({ message: 'Midtrans webhook handler siap untuk Sprint 4' });
});
