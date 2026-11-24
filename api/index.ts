import app from '../apps/server/dist/index.js';
import { handle as nodeHandle } from '@hono/node-server/vercel';
import { handle as edgeHandle } from 'hono/vercel';

const nodeHandler = nodeHandle(app);
const edgeHandler = edgeHandle(app);

export default async function handler(req: any, res?: any) {
  if (res && typeof res.setHeader === 'function') {
    return nodeHandler(req, res);
  }
  return edgeHandler(req);
}

handler.fetch = app.fetch.bind(app);
