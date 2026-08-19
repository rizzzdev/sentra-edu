/**
 * Security Test Script
 * Jalankan: npx tsx scripts/test-security.ts
 */

const BASE = 'http://localhost:5173';

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  ✅ ${name}`);
  } catch (err: any) {
    console.log(`  ❌ ${name}: ${err.message}`);
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

async function post(path: string, body: any, headers?: Record<string, string>) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body)
  });
  return { status: res.status, json: await res.json(), headers: Object.fromEntries(res.headers.entries()) };
}

async function get(path: string, headers?: Record<string, string>) {
  const res = await fetch(`${BASE}${path}`, { headers });
  return { status: res.status, json: await res.json(), headers: Object.fromEntries(res.headers.entries()) };
}

async function run() {
  console.log('🔒 Security Tests\n');

  // ── 1. SQL Injection ──
  console.log('1️⃣  SQL Injection:');
  await test('Login dengan SQL injection di email → tidak bypass auth', async () => {
    const r = await post('/api/auth/login', { email: "' OR 1=1 --", password: 'anything' });
    assert(r.status !== 200, `Expected not 200, got ${r.status}`);
  });

  await test('Login dengan SQL injection di password → tidak bypass auth', async () => {
    const r = await post('/api/auth/login', { email: 'super@admin.com', password: "' OR '1'='1" });
    assert(r.status !== 200, `Expected not 200, got ${r.status}`);
  });

  await test('User API tanpa auth → blocked (401/403)', async () => {
    const r = await post('/api/users', { id: "'; DROP TABLE users; --", fullName: 'test' });
    assert(r.status === 401 || r.status === 403, `Expected 401/403, got ${r.status}`);
  });

  // ── 2. XSS Prevention ──
  console.log('\n2️⃣  XSS Prevention:');
  await test('Input dengan HTML tag → tidak muncul di response', async () => {
    const r = await post('/api/auth/login', { email: '<script>alert("xss")</script>@test.com', password: 'pass' });
    const msg = r.json.message || '';
    assert(!msg.includes('<script>'), 'XSS payload found in response');
  });

  // ── 3. Rate Limiting ──
  console.log('\n3️⃣  Rate Limiting:');
  await test('Rate limit aktif → 429 setelah 5 percobaan login gagal', async () => {
    let got429 = false;
    for (let i = 0; i < 10; i++) {
      const r = await post('/api/auth/login', { email: `ratelimittest${i}@test.com`, password: 'wrong' });
      if (r.status === 429) { got429 = true; break; }
    }
    assert(got429, 'Expected 429 rate limit response');
  });

  await test('Rate limit response punya Retry-After header', async () => {
    const r = await post('/api/auth/login', { email: 'rate@limit.com', password: 'x' });
    if (r.status === 429) {
      assert(!!r.headers['retry-after'], 'Retry-After header missing');
    }
  });

  // ── 4. Auth Guard ──
  console.log('\n4️⃣  Auth Guard:');
  await test('GET /api/users tanpa session → 401 (unauthorized)', async () => {
    const r = await get('/api/users');
    assert(r.status === 401 || r.status === 403, `Expected 401/403, got ${r.status}`);
  });

  await test('POST /api/users tanpa session → 401 (unauthorized)', async () => {
    const r = await post('/api/users', { fullName: 'test', email: 'test@test.com' });
    assert(r.status === 401 || r.status === 403, `Expected 401/403, got ${r.status}`);
  });

  // ── 5. Input Validation ──
  console.log('\n5️⃣  Input Validation:');
  // Use fresh email to avoid rate limit
  await test('Login tanpa email → 400', async () => {
    const r = await post('/api/auth/login', { password: 'pass' });
    assert(r.status === 400, `Expected 400, got ${r.status}`);
  });

  await test('Login tanpa password → 400', async () => {
    const r = await post('/api/auth/login', { email: 'freshinput1@test.com' });
    assert(r.status === 400, `Expected 400, got ${r.status}`);
  });

  await test('Login dengan email format salah → 400', async () => {
    const r = await post('/api/auth/login', { email: 'not-an-email', password: 'pass' });
    assert(r.status === 400, `Expected 400, got ${r.status}`);
  });

  // ── 6. Security Headers ──
  console.log('\n6️⃣  Security Headers:');
  await test('Content-Security-Policy header ada', async () => {
    const r = await get('/api/auth/session');
    assert(r.headers['content-security-policy']?.includes("default-src 'self'"), 'CSP header missing');
  });

  await test('X-Content-Type-Options = nosniff', async () => {
    const r = await get('/api/auth/session');
    assert(r.headers['x-content-type-options'] === 'nosniff', 'X-Content-Type-Options missing');
  });

  await test('X-Frame-Options = DENY', async () => {
    const r = await get('/api/auth/session');
    assert(r.headers['x-frame-options'] === 'DENY', 'X-Frame-Options missing');
  });

  await test('X-XSS-Protection header ada', async () => {
    const r = await get('/api/auth/session');
    assert(!!r.headers['x-xss-protection'], 'X-XSS-Protection missing');
  });

  await test('Referrer-Policy header ada', async () => {
    const r = await get('/api/auth/session');
    assert(!!r.headers['referrer-policy'], 'Referrer-Policy missing');
  });

  // ── 7. Password Security ──
  console.log('\n7️⃣  Password Security:');
  await test('Password di-hash di Neon (bukan plaintext)', async () => {
    const { neon } = await import('@neondatabase/serverless');
    const dotenv = await import('dotenv');
    dotenv.config();
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`SELECT password FROM users LIMIT 1`;
    if (rows.length > 0) {
      assert(rows[0].password.startsWith('$2'), `Password not hashed: ${rows[0].password.substring(0, 10)}`);
    }
  });

  await test('Login berhasil dengan password benar', async () => {
    const r = await post('/api/auth/login', { email: 'super@admin.com', password: 'superadmin123' });
    assert(r.status === 200, `Expected 200, got ${r.status}: ${r.json.message}`);
  });

  // ── 8. Error Handling ──
  console.log('\n8️⃣  Error Handling:');
  await test('Email tidak ditemukan → pesan generic (anti-enumeration)', async () => {
    const r = await post('/api/auth/login', { email: 'nonexistent999@test.com', password: 'pass' });
    assert(r.json.message === 'Email atau password salah.', `Got: ${r.json.message}`);
  });

  await test('Password salah → pesan sama (anti-enumeration)', async () => {
    const r = await post('/api/auth/login', { email: 'super@admin.com', password: 'wrongpassword123' });
    assert(r.json.message === 'Email atau password salah.', `Got: ${r.json.message}`);
  });

  await test('Server error tidak bocorkan stack trace', async () => {
    const r = await post('/api/auth/login', { email: null, password: null });
    assert(!r.json.message?.includes('stack'), 'Stack trace leaked in error');
  });

  console.log('\n🎉 Semua security tests selesai!');
}

run().catch((err) => {
  console.error('\n❌ Test error:', err.message);
  process.exit(1);
});
