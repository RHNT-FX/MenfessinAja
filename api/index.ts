import app from '../apps/server/src/index.js';
import { handle } from 'hono/vercel';

export default handle(app);
