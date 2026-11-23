/**
 * Resilient In-Memory Mock Backend for Offline/Demo Mode
 * Digunakan secara mulus saat backend Vercel sedang cold-start atau offline
 */

export interface MockPost {
  id: string;
  user_id: string;
  kategori: string;
  teks_konten: string;
  media_url?: string | null;
  ai_score: number;
  status: string;
  is_boosted: boolean;
  upvotes_count: number;
  comments_count: number;
  user_vote?: 'up' | 'down' | null;
  extra_meta?: {
    category_pill?: string;
    is_superchat?: boolean;
    [key: string]: unknown;
  };
  created_at: string;
}

const STORAGE_KEY_POSTS = 'menfessinaja_mock_posts';

const initialPosts: MockPost[] = [
  {
    id: 'post-demo-1',
    user_id: '00000000-0000-0000-0000-000000000002',
    kategori: 'menfess',
    teks_konten: 'Bismillah, semoga revisi bab 4 lancar dan bisa lulus tepat waktu semester ini bareng temen-temen seangkatan! Semangat buat yang lagi berjuang di lab sampai larut malam 🙏✨',
    ai_score: 0.05,
    status: 'approved',
    is_boosted: true,
    upvotes_count: 42,
    comments_count: 5,
    user_vote: null,
    extra_meta: {
      category_pill: '#curhat',
      is_superchat: true
    },
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: 'post-demo-2',
    user_id: '00000000-0000-0000-0000-000000000003',
    kategori: 'menfess',
    teks_konten: 'Tadi siang ketinggalan binder catatan kalkulus warna biru di lantai 2 perpustakaan pusat meja nomor 14. Ada yang lihat atau amankan ga ya? Hubungi saya ya terima kasih banyak.',
    ai_score: 0.02,
    status: 'approved',
    is_boosted: false,
    upvotes_count: 18,
    comments_count: 2,
    user_vote: null,
    extra_meta: {
      category_pill: '#tanya'
    },
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString()
  },
  {
    id: 'post-demo-3',
    user_id: '00000000-0000-0000-0000-000000000004',
    kategori: 'menfess',
    teks_konten: 'Apresiasi setinggi-tingginya buat panitia Dies Natalis kemarin acaranya keren banget dan tertib! Sound system mantul dan guest star nya pecah abis!',
    ai_score: 0.01,
    status: 'approved',
    is_boosted: false,
    upvotes_count: 31,
    comments_count: 4,
    user_vote: null,
    extra_meta: {
      category_pill: '#apresiasi'
    },
    created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString()
  },
  {
    id: 'mkt-demo-1',
    user_id: '00000000-0000-0000-0000-000000000002',
    kategori: 'marketplace',
    teks_konten: 'Kondisi mulus 90%, tidak ada coretan pulpen di bagian materi inti. Cocok untuk mahasiswa TPB atau Teknik semester 1-2.',
    media_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    ai_score: 0.01,
    status: 'approved',
    is_boosted: true,
    upvotes_count: 5,
    comments_count: 1,
    user_vote: null,
    extra_meta: {
      judul: 'Buku Kalkulus Purcell Edisi 9',
      harga: 75000,
      kategori_barang: 'Buku',
      kondisi: 'bekas',
      lokasi: 'Gedung Kuliah Bersama / Perpustakaan',
      whatsapp: '081234567890',
      status_barang: 'Tersedia'
    },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 'mkt-demo-2',
    user_id: '00000000-0000-0000-0000-000000000003',
    kategori: 'marketplace',
    teks_konten: 'Dijual karena mau pindah kos luar kota. Lampu belajar LED 3 mode warna (putih, warm, natural) lengkap dengan kabel USB type-C.',
    media_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80',
    ai_score: 0.02,
    status: 'approved',
    is_boosted: false,
    upvotes_count: 3,
    comments_count: 0,
    user_vote: null,
    extra_meta: {
      judul: 'Lampu Belajar Meja Minimalis LED',
      harga: 45000,
      kategori_barang: 'Elektronik',
      kondisi: 'bekas',
      lokasi: 'Kantin Fakultas Teknik',
      whatsapp: '085234567891',
      status_barang: 'Tersedia'
    },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
  },
  {
    id: 'lf-demo-1',
    user_id: '00000000-0000-0000-0000-000000000002',
    kategori: 'lost_found',
    teks_konten: 'Ditemukan dompet lipat kulit warna cokelat tua di deretan kursi tribun tengah lapangan futsal kampus. Sudah diamankan di pos satpam gerbang utama.',
    media_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
    ai_score: 0.01,
    status: 'approved',
    is_boosted: false,
    upvotes_count: 12,
    comments_count: 1,
    user_vote: null,
    extra_meta: {
      judul: 'Dompet Cokelat Kulit',
      lokasi: 'Tribun Lapangan Futsal',
      tipe_laporan: 'ditemukan',
      whatsapp: '081234567890',
      is_resolved: false
    },
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString()
  },
  {
    id: 'lf-demo-2',
    user_id: '00000000-0000-0000-0000-000000000004',
    kategori: 'lost_found',
    teks_konten: 'Tolong bantuannya, kunci motor Honda Vario dengan gantungan boneka kecil hitam jatuh di sekitar parkiran motor barat sekitar jam 10 pagi.',
    media_url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80',
    ai_score: 0.01,
    status: 'approved',
    is_boosted: false,
    upvotes_count: 8,
    comments_count: 3,
    user_vote: null,
    extra_meta: {
      judul: 'Kunci Motor Honda Vario',
      lokasi: 'Parkiran Barat Kampus',
      tipe_laporan: 'hilang',
      whatsapp: '089876543210',
      is_resolved: false
    },
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString()
  }
];

function getStoredPosts(): MockPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_POSTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: any) => {
          if (item && item.post && item.post.id) {
            return { ...item.post, ...item };
          }
          return item;
        }).filter((item: any) => item && item.id && item.teks_konten);
      }
    }
  } catch {}
  localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(initialPosts));
  return [...initialPosts];
}

function savePosts(posts: MockPost[]) {
  try {
    localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(posts));
  } catch {}
}

export function handleMockRequest(endpoint: string, options: any = {}): any {
  const method = (options.method || 'GET').toUpperCase();
  const path = endpoint.split('?')[0];

  // 0. POST /api/auth/login
  if (path === '/api/auth/login' && method === 'POST') {
    const body = options.body ? JSON.parse(options.body) : {};
    const email = (body.email || '').toLowerCase().trim();
    const isAdmin = email.includes('admin');
    const user = {
      id: isAdmin ? '00000000-0000-0000-0000-000000000001' : '00000000-0000-0000-0000-000000000002',
      email: email || 'student@menfessinaja.ac.id',
      role: isAdmin ? 'admin' : 'member',
      status: 'active',
      created_at: new Date().toISOString()
    };
    return {
      success: true,
      message: 'Login berhasil',
      data: {
        user,
        token: 'demo-token-' + (isAdmin ? 'admin' : 'member')
      }
    };
  }

  // 0.1 POST /api/auth/register
  if (path === '/api/auth/register' && method === 'POST') {
    const body = options.body ? JSON.parse(options.body) : {};
    const email = (body.email || '').toLowerCase().trim();
    const user = {
      id: 'user-' + Date.now(),
      email: email || 'student@menfessinaja.ac.id',
      role: 'member',
      status: 'active',
      created_at: new Date().toISOString()
    };
    return {
      success: true,
      message: 'Registrasi berhasil',
      data: {
        user,
        token: 'demo-token-member'
      }
    };
  }

  // 0.2 GET /api/auth/me
  if (path === '/api/auth/me' && method === 'GET') {
    let user = {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'student@menfessinaja.ac.id',
      role: 'member',
      status: 'active'
    };
    try {
      const raw = localStorage.getItem('user');
      if (raw) user = JSON.parse(raw);
    } catch {}
    return {
      success: true,
      data: { user }
    };
  }

  // 1. GET /api/posts
  if (path === '/api/posts' && method === 'GET') {
    let posts = getStoredPosts();
    // Support category filter (e.g. ?kategori=marketplace or ?kategori=lost_found or ?kategori=menfess)
    const urlParams = endpoint.includes('?') ? new URLSearchParams(endpoint.split('?')[1]) : null;
    const kategori = urlParams?.get('kategori') || options.params?.kategori;
    if (kategori) {
      posts = posts.filter(p => p.kategori === kategori);
    }
    return {
      success: true,
      data: {
        items: posts,
        total: posts.length
      }
    };
  }

  // 1.1 POST /api/posts/marketplace
  if (path === '/api/posts/marketplace' && method === 'POST') {
    const body = options.body ? JSON.parse(options.body) : {};
    const posts = getStoredPosts();
    const newPost: MockPost = {
      id: 'mkt-' + Date.now(),
      user_id: '00000000-0000-0000-0000-000000000002',
      kategori: 'marketplace',
      teks_konten: body.deskripsi || body.teks_konten || '',
      media_url: body.media_url || null,
      ai_score: 0.01,
      status: 'approved',
      is_boosted: false,
      upvotes_count: 0,
      comments_count: 0,
      user_vote: null,
      extra_meta: {
        judul: body.judul,
        harga: Number(body.harga) || 0,
        kondisi: body.kondisi || 'bekas',
        kategori_barang: body.kategori_barang || 'Umum',
        lokasi: body.lokasi || 'Sekitar kampus',
        whatsapp: body.whatsapp || '081234567890',
        status_barang: 'Tersedia'
      },
      created_at: new Date().toISOString()
    };
    posts.unshift(newPost);
    savePosts(posts);
    return {
      success: true,
      message: 'Barang marketplace berhasil dipasang',
      data: {
        ...newPost,
        post: newPost
      }
    };
  }

  // 1.2 POST /api/posts/lost_found
  if (path === '/api/posts/lost_found' && method === 'POST') {
    const body = options.body ? JSON.parse(options.body) : {};
    const posts = getStoredPosts();
    const newPost: MockPost = {
      id: 'lf-' + Date.now(),
      user_id: '00000000-0000-0000-0000-000000000002',
      kategori: 'lost_found',
      teks_konten: body.deskripsi || body.teks_konten || '',
      media_url: body.media_url || null,
      ai_score: 0.01,
      status: 'approved',
      is_boosted: false,
      upvotes_count: 0,
      comments_count: 0,
      user_vote: null,
      extra_meta: {
        judul: body.judul,
        lokasi: body.lokasi || 'Kampus',
        tipe_laporan: body.tipe_laporan || 'ditemukan',
        whatsapp: body.whatsapp || '081234567890',
        is_resolved: false
      },
      created_at: new Date().toISOString()
    };
    posts.unshift(newPost);
    savePosts(posts);
    return {
      success: true,
      message: 'Laporan Lost & Found berhasil dipublikasikan',
      data: {
        ...newPost,
        post: newPost
      }
    };
  }

  // 1.3 PUT /api/posts/:id/resolve
  if (path.includes('/resolve') && (method === 'PUT' || method === 'POST')) {
    const postId = path.split('/')[3];
    const posts = getStoredPosts();
    const target = posts.find(p => p.id === postId);
    if (target) {
      target.status = 'resolved';
      if (target.extra_meta) {
        target.extra_meta.is_resolved = true;
        target.extra_meta.status_barang = 'Terjual';
      }
      savePosts(posts);
    }
    return {
      success: true,
      message: 'Status berhasil diperbarui'
    };
  }

  // 2. POST /api/posts/preview-moderation
  if (path === '/api/posts/preview-moderation' && method === 'POST') {
    const body = options.body ? JSON.parse(options.body) : {};
    const text = body.teks_konten || body.content || '';
    
    // Mask NIM and phone
    const nimMatches = text.match(/\b(1124\d{4})\b/g) || [];
    const phoneMatches = text.match(/\b(08\d{8,11})\b/g) || [];
    let sanitizedText = text.replace(/\b(1124\d{4})\b/g, '1124****');
    sanitizedText = sanitizedText.replace(/\b(08\d{8,11})\b/g, '0812****09');

    // Toxicity check
    const toxicWords = ['anjing', 'bangsat', 'kontol', 'tolol', 'hajar', 'bunuh', 'bajingan', 'kampret'];
    const isToxic = toxicWords.some((w: string) => text.toLowerCase().includes(w));
    const aiScore = isToxic ? 0.88 : 0.05;
    const isSafe = aiScore < 0.70;

    return {
      success: true,
      data: {
        originalText: text,
        sanitizedText,
        nimMaskedCount: nimMatches.length,
        phoneMaskedCount: phoneMatches.length,
        aiScore,
        ai_score: aiScore,
        isSafe,
        status: isSafe ? 'approved' : 'flagged',
        flags: isToxic ? ['Kekerasan / Ujaran Makian'] : [],
        reason: isToxic ? 'Terdeteksi kata makian atau ancaman agresif' : 'Teks wajar dan aman dipublikasikan'
      }
    };
  }

  // 3. POST /api/posts/menfess
  if (path === '/api/posts/menfess' && method === 'POST') {
    const body = options.body ? JSON.parse(options.body) : {};
    const posts = getStoredPosts();
    const newPost: MockPost = {
      id: 'post-' + Date.now(),
      user_id: '00000000-0000-0000-0000-000000000002',
      kategori: 'menfess',
      teks_konten: body.teks_konten || body.content || '',
      media_url: body.media_url || null,
      ai_score: 0.05,
      status: 'approved',
      is_boosted: Boolean(body.extra_meta?.is_superchat),
      upvotes_count: 0,
      comments_count: 0,
      user_vote: null,
      extra_meta: body.extra_meta || { category_pill: '#curhat' },
      created_at: new Date().toISOString()
    };
    posts.unshift(newPost);
    savePosts(posts);
    return {
      success: true,
      message: 'Menfess berhasil diterbitkan',
      data: {
        ...newPost,
        post: newPost
      }
    };
  }

  // 4. POST /api/posts/:id/vote
  if (path.includes('/vote') && method === 'POST') {
    const postId = path.split('/')[3];
    const body = options.body ? JSON.parse(options.body) : {};
    const direction = body.type === 'down' ? 'down' : 'up';
    const posts = getStoredPosts();
    const target = posts.find(p => p.id === postId);
    if (target) {
      if (target.user_vote === direction) {
        // Undo vote
        if (direction === 'up') target.upvotes_count = Math.max(0, target.upvotes_count - 1);
        target.user_vote = null;
      } else {
        if (direction === 'up') {
          target.upvotes_count += (target.user_vote === 'down' ? 2 : 1);
        } else {
          target.upvotes_count = Math.max(0, target.upvotes_count - (target.user_vote === 'up' ? 2 : 1));
        }
        target.user_vote = direction;
      }
      savePosts(posts);
      return {
        success: true,
        data: {
          upvotes: target.upvotes_count,
          upvotes_count: target.upvotes_count,
          user_vote: target.user_vote
        }
      };
    }
    return {
      success: true,
      data: {
        upvotes: direction === 'up' ? 1 : 0,
        upvotes_count: direction === 'up' ? 1 : 0,
        user_vote: direction
      }
    };
  }

  // 5. GET /api/posts/:id/comments
  if (path.includes('/comments') && method === 'GET') {
    const postId = path.split('/')[3];
    let commentsList: any[] = [];
    try {
      const raw = localStorage.getItem('menfessinaja_comments_' + postId);
      if (raw) commentsList = JSON.parse(raw);
    } catch {}
    if (commentsList.length === 0) {
      commentsList = [
        {
          id: 'c-default-1',
          post_id: postId,
          user_id: '00000000-0000-0000-0000-000000000003',
          isi_komentar: 'Setuju banget! Tetap semangat ya buat semuanya!',
          created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString()
        }
      ];
      try {
        localStorage.setItem('menfessinaja_comments_' + postId, JSON.stringify(commentsList));
      } catch {}
    }
    return {
      success: true,
      data: commentsList
    };
  }

  // 6. POST /api/posts/:id/comments
  if (path.includes('/comments') && method === 'POST') {
    const postId = path.split('/')[3];
    const body = options.body ? JSON.parse(options.body) : {};
    const text = body.isi_komentar || body.konten || '';
    let commentsList: any[] = [];
    try {
      const raw = localStorage.getItem('menfessinaja_comments_' + postId);
      if (raw) commentsList = JSON.parse(raw);
    } catch {}
    const newComment = {
      id: 'c-' + Date.now(),
      post_id: postId,
      user_id: '00000000-0000-0000-0000-000000000002',
      isi_komentar: text,
      created_at: new Date().toISOString()
    };
    commentsList.push(newComment);
    try {
      localStorage.setItem('menfessinaja_comments_' + postId, JSON.stringify(commentsList));
    } catch {}

    // Update post comments_count
    const posts = getStoredPosts();
    const target = posts.find(p => p.id === postId);
    if (target) {
      target.comments_count = commentsList.length;
      savePosts(posts);
    }

    return {
      success: true,
      message: 'Komentar berhasil dikirim',
      data: newComment
    };
  }

  // 7. POST /api/transactions/checkout
  if (path === '/api/transactions/checkout' && method === 'POST') {
    const body = options.body ? JSON.parse(options.body) : {};
    const orderId = 'ORD-' + Date.now();
    return {
      success: true,
      data: {
        orderId,
        amount: body.amount || 15000,
        snapToken: 'snap-mock-token-' + Date.now(),
        qrString: '00020101021226600016ID.CO.QRIS.WWW01189360050300000889980215000000000000000520458125802ID5913Menfessin Aja6007BANDUNG61054011562070703A016304E07B',
        paymentUrl: '#'
      }
    };
  }

  // 8. POST /api/transactions/:orderId/simulate
  if (path.includes('/simulate') && method === 'POST') {
    const orderId = path.split('/')[3];
    return {
      success: true,
      message: 'Pembayaran berhasil disimulasikan sebagai SETTLEMENT',
      data: {
        orderId,
        status: 'settlement'
      }
    };
  }

  // 9. GET /api/transactions (Admin)
  if (path === '/api/transactions' && method === 'GET') {
    return {
      success: true,
      data: {
        transactions: [
          {
            order_id: 'ORD-1732400001',
            user_id: '00000000-0000-0000-0000-000000000002',
            amount: 15000,
            status: 'settlement',
            created_at: new Date(Date.now() - 3600000).toISOString()
          }
        ]
      }
    };
  }

  // 10. GET /api/admin/posts/flagged
  if (path === '/api/admin/posts/flagged' && method === 'GET') {
    return {
      success: true,
      data: { items: [] }
    };
  }

  // 11. GET /api/admin/logs
  if (path === '/api/admin/logs' && method === 'GET') {
    return {
      success: true,
      data: { logs: [] }
    };
  }

  // 12. Fallback default
  return {
    success: true,
    data: {}
  };
}
