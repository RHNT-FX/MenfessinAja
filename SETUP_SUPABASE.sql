-- =====================================================================
-- MENFESSIN AJA - SUPABASE INITIAL SCHEMA SETUP
-- Jalankan seluruh script ini di SQL Editor Supabase kamu!
-- =====================================================================

-- 1. TABEL USERS (Autentikasi & Akun)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'member', -- 'member', 'admin'
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'banned', 'suspended'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABEL POSTS (Menfess, Marketplace, Lost & Found)
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kategori VARCHAR(50) NOT NULL, -- 'menfess', 'marketplace', 'lost_found'
    teks_konten TEXT NOT NULL,
    media_url VARCHAR(500),
    ai_score REAL DEFAULT 0.0,
    status VARCHAR(50) NOT NULL DEFAULT 'approved', -- 'approved', 'flagged', 'rejected', 'resolved', 'sold'
    is_boosted BOOLEAN DEFAULT FALSE,
    upvotes_count INTEGER DEFAULT 0,
    extra_meta JSONB DEFAULT '{}'::jsonb, -- Detail tambahan (harga, whatsapp, status hilang/ditemukan, lokasi)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABEL COMMENTS (Komentar Berutas)
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    isi_komentar TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABEL TRANSACTIONS (QRIS Midtrans Superchat / Boost)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    midtrans_order_id VARCHAR(100) UNIQUE NOT NULL,
    gross_amount DECIMAL(12,2) NOT NULL,
    status_pembayaran VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'settlement', 'expire', 'cancel'
    payment_type VARCHAR(50) DEFAULT 'qris',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABEL MODERATION_LOGS (Audit Trail Admin)
CREATE TABLE IF NOT EXISTS moderation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
    keputusan VARCHAR(50) NOT NULL, -- 'approve', 'reject'
    alasan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================================
-- INDEXING UNTUK QUERY CEPAT
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_posts_kategori_status ON posts(kategori, status);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_is_boosted ON posts(is_boosted);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON transactions(midtrans_order_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_post_id ON moderation_logs(post_id);

-- =====================================================================
-- SEED DATA AWAL (UNTUK TESTING DEMO)
-- Akun demo default: password123
-- =====================================================================
INSERT INTO users (id, email, password_hash, role, status)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'admin@menfessinaja.ac.id', '$2b$10$w4r21bH/N42Yc9iN1HZe1O9F1q3T7f4H5bT8E3Z1k9J5aK7Lm8qGy', 'admin', 'active'),
    ('00000000-0000-0000-0000-000000000002', 'student@menfessinaja.ac.id', '$2b$10$w4r21bH/N42Yc9iN1HZe1O9F1q3T7f4H5bT8E3Z1k9J5aK7Lm8qGy', 'member', 'active')
ON CONFLICT (email) DO NOTHING;

-- Seed Post Menfess Awal
INSERT INTO posts (id, user_id, kategori, teks_konten, ai_score, status, is_boosted, upvotes_count)
VALUES 
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'menfess', 'Selamat datang di Menfessin Aja! Forum anonim resmi civitas kampus. Jaga etika dan hindari penyebaran data pribadi ya!', 0.02, 'approved', true, 5)
ON CONFLICT (id) DO NOTHING;
