import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Load .env from root or local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config();

export const ENV = {
  PORT: Number(process.env.PORT) || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000',

  SUPABASE_URL: process.env.SUPABASE_URL || 'https://demo-placeholder.supabase.co',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'demo-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'demo-service-key',
  SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET || 'posts-media',

  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-key-menfessin-aja-2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  CLOUDFLARE_TURNSTILE_SITE_KEY: process.env.CLOUDFLARE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA',
  CLOUDFLARE_TURNSTILE_SECRET_KEY: process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA',

  MIDTRANS_SERVER_KEY: process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-demo',
  MIDTRANS_CLIENT_KEY: process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-demo',
  MIDTRANS_IS_PRODUCTION: process.env.MIDTRANS_IS_PRODUCTION === 'true',

  JUAN_ROUTER_API_KEY: process.env.JUAN_ROUTER_API_KEY || 'mock-juan-router-key',
  JUAN_ROUTER_BASE_URL: process.env.JUAN_ROUTER_BASE_URL || 'https://api.juanrouter.com/v1',
  JUAN_ROUTER_TEXT_MODEL: process.env.JUAN_ROUTER_TEXT_MODEL || 'llm-text-moderator',
  JUAN_ROUTER_VISION_MODEL: process.env.JUAN_ROUTER_VISION_MODEL || 'cv-prohibited-detector',
};
