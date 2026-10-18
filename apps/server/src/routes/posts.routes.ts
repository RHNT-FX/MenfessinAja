import { Hono } from 'hono';

export const postsRouter = new Hono();

postsRouter.get('/', (c) => {
  return c.json({ message: 'Posts feed list endpoint siap untuk Sprint 2 & 3' });
});

postsRouter.post('/create', (c) => {
  return c.json({ message: 'Create post endpoint siap untuk Sprint 2 & 3' });
});

postsRouter.get('/:id', (c) => {
  return c.json({ message: 'Post detail endpoint siap untuk Sprint 2 & 3' });
});
