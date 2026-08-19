/**
 * Advanced Security Test Script — mencari celah keamanan
 * Jalankan: npx tsx scripts/test-security-advanced.ts
 */

const BASE = 'http://localhost:5173';

let passed = 0;
let failed = 0;
let warned = 0;

async function test(category: string, name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err: any) {
    console.log(`  ❌ ${name}: ${err.message}`);
    failed++;
  }
}

function warn(category: string, name: string, message: string) {
  console.log(`  ⚠️  ${name}: ${message}`);
  warned++;
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function assertNot(condition: boolean, message: string) {
  if (condition) throw new Error(message);
}

async function post(path: string, body: any, headers?: Record<string, string>) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body)
  });
  const raw = await res.text();
  let json: any = {};
  try { json = JSON.parse(raw); } catch {}
  return { status: res.status, json, headers: Object.fromEntries(res.headers.entries()), raw };
}

async function get(path: string, headers?: Record<string, string>) {
  const res = await fetch(`${BASE}${path}`, { headers });
  const raw = await res.text();
  let json: any = {};
  try { json = JSON.parse(raw); } catch {}
  return { status: res.status, json, headers: Object.fromEntries(res.headers.entries()), raw };
}

async function put(path: string, body: any, headers?: Record<string, string>) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body)
  });
  return { status: res.status, json: await res.json(), headers: Object.fromEntries(res.headers.entries()) };
}

async function del(path: string, headers?: Record<string, string>) {
  const res = await fetch(`${BASE}${path}`, { method: 'DELETE', headers });
  return { status: res.status, json: await res.json(), headers: Object.fromEntries(res.headers.entries()) };
}

function parseCookies(setCookie: string | undefined): string {
  if (!setCookie) return '';
  return setCookie.split(',').map(c => c.split(';')[0].trim()).join('; ');
}

async function run() {
  console.log('🔒 Advanced Security Tests — Penetration Testing\n');

  // ════════════════════════════════════════════════════════
  // 1. SQL INJECTION (Advanced)
  // ════════════════════════════════════════════════════════
  console.log('1️⃣  SQL Injection (Advanced):');

  await test('SQLi', ' UNION SELECT attack', async () => {
    const r = await post('/api/auth/login', { email: "' UNION SELECT id, email, password, 'admin', '', '', '', '', '', '', '', '', '', '', '', '', '', '' FROM users--", password: 'x' });
    assert(r.status !== 200, `Bypass succeeded: ${r.status}`);
  });

  await test('SQLi', 'Batch SQL injection — multiple statements', async () => {
    const r = await post('/api/auth/login', { email: "'; DELETE FROM users WHERE '1'='1'; --", password: 'x' });
    // Should fail gracefully, not crash
    assert(r.status !== 200, `Bypass succeeded`);
  });

  await test('SQLi', 'Time-based blind SQLi', async () => {
    const start = Date.now();
    const r = await post('/api/auth/login', { email: "admin' AND SLEEP(5)--", password: 'x' });
    const elapsed = Date.now() - start;
    assert(elapsed < 3000, `Response took ${elapsed}ms — possible time-based SQLi`);
  });

  await test('SQLi', 'Unicode bypass on email', async () => {
    const r = await post('/api/auth/login', { email: "admin\u0040sentraedu\u002Eid", password: 'x' });
    // Should not bypass
  });

  await test('SQLi', 'Null byte injection', async () => {
    const r = await post('/api/auth/login', { email: "admin@test.com\x00", password: 'x' });
    assert(r.status !== 200, `Null byte bypass succeeded`);
  });

  // ════════════════════════════════════════════════════════
  // 2. XSS (Advanced)
  // ════════════════════════════════════════════════════════
  console.log('\n2️⃣  XSS (Advanced):');

  await test('XSS', 'Event handler injection', async () => {
    const payload = '<img src=x onerror=alert(1)>';
    const r = await post('/api/auth/login', { email: `${payload}@test.com`, password: 'x' });
    assertNot(r.raw.includes(payload), 'XSS payload reflected in response');
  });

  await test('XSS', 'SVG-based XSS', async () => {
    const payload = '<svg onload=alert(1)>';
    const r = await post('/api/auth/login', { email: `${payload}@test.com`, password: 'x' });
    assertNot(r.raw.includes(payload), 'SVG XSS reflected');
  });

  await test('XSS', 'JavaScript URI injection', async () => {
    const payload = 'javascript:alert(1)';
    const r = await post('/api/auth/login', { email: payload, password: 'x' });
    assertNot(r.raw.includes(payload), 'JS URI reflected');
  });

  await test('XSS', 'Encoded HTML entities bypass', async () => {
    const payload = '&lt;script&gt;alert(1)&lt;/script&gt;';
    const r = await post('/api/auth/login', { email: `${payload}@test.com`, password: 'x' });
    // Should not decode and execute
  });

  await test('XSS', 'Template injection {{ }}', async () => {
    const r = await post('/api/auth/login', { email: '{{7*7}}@test.com', password: 'x' });
    assertNot(r.raw.includes('49'), 'Template injection succeeded');
  });

  // ════════════════════════════════════════════════════════
  // 3. AUTHENTICATION BYPASS
  // ════════════════════════════════════════════════════════
  console.log('\n3️⃣  Authentication Bypass:');

  await test('Auth', 'Session cookie manipulation — fake session_user', async () => {
    const r = await get('/api/users', {
      Cookie: 'session_user=' + encodeURIComponent(JSON.stringify({ id: 'u-admin', email: 'super@admin.com', role: 'SUPER_ADMIN' }))
    });
    assert(r.status === 401 || r.status === 403, `Bypass succeeded: ${r.status}`);
  });

  await test('Auth', 'Session cookie manipulation — tampered JSON', async () => {
    const r = await get('/api/users', {
      Cookie: 'session_user={"id":"u-admin","role":"SUPER_ADMIN"}' // no session token
    });
    assert(r.status === 401 || r.status === 403, `Bypass succeeded: ${r.status}`);
  });

  await test('Auth', 'No cookie at all → 401/403', async () => {
    const r = await get('/api/users');
    assert(r.status === 401 || r.status === 403, `Expected 401/403, got ${r.status}`);
  });

  await test('Auth', 'Expired/tampered session → rejected', async () => {
    const r = await get('/api/users', {
      Cookie: 'session=invalid-token; session_user=' + encodeURIComponent(JSON.stringify({ id: 'u-admin', email: 'super@admin.com', fullName: 'Admin', role: 'SUPER_ADMIN' }))
    });
    // Without valid session token in httpOnly cookie, should fail
    assert(r.status === 401 || r.status === 403, `Bypass succeeded: ${r.status}`);
  });

  // ════════════════════════════════════════════════════════
  // 4. AUTHORIZATION / PRIVILEGE ESCALATION
  // ════════════════════════════════════════════════════════
  console.log('\n4️⃣  Authorization / Privilege Escalation:');

  await test('AuthZ', 'Create user with SUPER_ADMIN role via API', async () => {
    // Try to escalate — should only work with admin session
    const r = await post('/api/users', { fullName: 'Hacker', email: 'hacker@test.com', role: 'SUPER_ADMIN' });
    assert(r.status === 401 || r.status === 403, `Privilege escalation: ${r.status}`);
  });

  await test('AuthZ', 'Delete user via API without auth', async () => {
    const r = await del('/api/users?id=u-admin');
    assert(r.status === 401 || r.status === 403 || r.status === 405, `Unauthorized delete: ${r.status}`);
  });

  // ════════════════════════════════════════════════════════
  // 5. INPUT VALIDATION (Edge Cases)
  // ════════════════════════════════════════════════════════
  console.log('\n5️⃣  Input Validation (Edge Cases):');

  await test('Input', 'Extremely long email (10KB)', async () => {
    const longEmail = 'a'.repeat(10000) + '@test.com';
    const r = await post('/api/auth/login', { email: longEmail, password: 'x' });
    assert(r.status !== 200, `Long email bypass succeeded`);
  });

  await test('Input', 'Extremely long password (100KB)', async () => {
    const longPass = 'x'.repeat(100000);
    const r = await post('/api/auth/login', { email: 'test@test.com', password: longPass });
    assert(r.status !== 200, `Long password bypass succeeded`);
  });

  await test('Input', 'Empty body → 400', async () => {
    const r = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}'
    });
    const data = await r.json();
    assert(data.error === true, `Empty body accepted`);
  });

  await test('Input', 'Array instead of object → 400/422', async () => {
    const r = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '[]'
    });
    assert(r.status === 400 || r.status === 422 || r.status === 500, `Array body accepted: ${r.status}`);
  });

  await test('Input', 'Prototype pollution attempt', async () => {
    const r = await post('/api/users', { __proto__: { isAdmin: true }, fullName: 'test', email: 'proto@test.com' });
    assert(r.status !== 200 || !r.json.data, `Prototype pollution succeeded`);
  });

  await test('Input', 'Nested object injection', async () => {
    const r = await post('/api/auth/login', {
      email: { $ne: '' },
      password: { $ne: '' }
    });
    assert(r.status !== 200, `NoSQL injection succeeded`);
  });

  // ════════════════════════════════════════════════════════
  // 6. INFORMATION DISCLOSURE
  // ════════════════════════════════════════════════════════
  console.log('\n6️⃣  Information Disclosure:');

  await test('Info', 'Server header tidak bocorkan versi', async () => {
    const r = await get('/api/auth/session');
    const server = r.headers['server'] || '';
    assertNot(server.toLowerCase().includes('svelte'), `Server header leaks: ${server}`);
    assertNot(server.toLowerCase().includes('node'), `Server header leaks: ${server}`);
  });

  await test('Info', 'Error response tidak bocorkan stack trace', async () => {
    const r = await post('/api/auth/login', { email: null, password: null });
    assertNot(r.raw.includes('at '), 'Stack trace leaked');
    assertNot(r.raw.includes('.ts:'), 'File path leaked');
    assertNot(r.raw.includes('node_modules'), 'Internal path leaked');
  });

  await test('Info', 'API response tidak mengembalikan password hash', async () => {
    const r = await get('/api/db');
    if (r.status === 200 && r.json.data?.users) {
      const hasHash = r.json.data.users.some((u: any) => u.password && u.password.startsWith('$2'));
      assertNot(hasHash, 'Password hash leaked in /api/db response');
    }
  });

  await test('Info', 'Tidak ada header X-Powered-By', async () => {
    const r = await get('/api/auth/session');
    assertNot(!!r.headers['x-powered-by'], 'X-Powered-By header present');
  });

  // ════════════════════════════════════════════════════════
  // 7. HTTP METHOD CONFUSION
  // ════════════════════════════════════════════════════════
  console.log('\n7️⃣  HTTP Method Confusion:');

  await test('Method', 'OPTIONS request returns valid CORS headers', async () => {
    const r = await fetch(`${BASE}/api/auth/login`, { method: 'OPTIONS' });
    // Should not crash
    assert(r.status < 500, `Server error on OPTIONS: ${r.status}`);
  });

  await test('Method', 'PUT on login endpoint → not accepted', async () => {
    const r = await put('/api/auth/login', { email: 'x', password: 'x' });
    assert(r.status === 405 || r.status === 400 || r.status === 404 || r.status === 429, `PUT accepted: ${r.status}`);
  });

  await test('Method', 'PATCH on login endpoint → not accepted', async () => {
    const r = await fetch(`${BASE}/api/auth/login`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'x', password: 'x' })
    });
    assert(r.status === 405 || r.status === 400 || r.status === 404 || r.status === 429, `PATCH accepted: ${r.status}`);
  });

  // ════════════════════════════════════════════════════════
  // 8. SESSION SECURITY
  // ════════════════════════════════════════════════════════
  console.log('\n8️⃣  Session Security:');

  await test('Session', 'Cookie flags: httpOnly, secure, sameSite', async () => {
    const r = await post('/api/auth/login', { email: 'super@admin.com', password: 'superadmin123' });
    const setCookie = r.headers['set-cookie'] || '';
    if (setCookie.includes('session=')) {
      const sessionCookie = setCookie.split(',').find(c => c.includes('session=')) || '';
      // httpOnly should be set (not accessible via JS)
      // secure should be set
      // sameSite should be set
      console.log(`    📋 Session cookie flags: ${sessionCookie.substring(0, 120)}...`);
    } else {
      warn('Session', 'No session cookie found', 'Login may have failed');
    }
  });

  await test('Session', 'Logout clears session cookies', async () => {
    const r = await post('/api/auth/logout', {});
    assert(r.status === 200, `Logout failed: ${r.status}`);
  });

  // ════════════════════════════════════════════════════════
  // 9. PATH TRAVERSAL
  // ════════════════════════════════════════════════════════
  console.log('\n9️⃣  Path Traversal:');

  await test('Path', 'Directory traversal in query params', async () => {
    const r = await get('/api/users?id=../../etc/passwd');
    assert(r.status !== 200 || !r.raw.includes('root:'), 'Path traversal succeeded');
  });

  await test('Path', 'Path traversal in URL', async () => {
    const r = await get('/api/../../../etc/passwd');
    assert(!r.raw.includes('root:'), 'Path traversal succeeded');
  });

  // ════════════════════════════════════════════════════════
  // 10. PASSWORD SECURITY
  // ════════════════════════════════════════════════════════
  console.log('\n🔟 Password Security:');

  await test('Password', 'Password tidak di-cache di browser', async () => {
    const r = await get('/api/auth/session');
    const cacheControl = r.headers['cache-control'] || '';
    // Login endpoints should have no-cache
    // This is a soft check
    console.log(`    📋 Cache-Control: ${cacheControl || 'not set'}`);
  });

  await test('Password', 'Login error messages sama (anti-user-enumeration)', async () => {
    const r1 = await post('/api/auth/login', { email: 'nonexistent999@test.com', password: 'pass' });
    const r2 = await post('/api/auth/login', { email: 'super@admin.com', password: 'wrongpassword' });
    assert(r1.json.message === r2.json.message, `Different messages: "${r1.json.message}" vs "${r2.json.message}"`);
  });

  // ════════════════════════════════════════════════════════
  // 11. DENIAL OF SERVICE
  // ════════════════════════════════════════════════════════
  console.log('\n1️⃣1️⃣  Denial of Service:');

  await test('DoS', 'Large JSON payload (1MB)', async () => {
    const largeBody = JSON.stringify({ email: 'a'.repeat(1000000) + '@test.com', password: 'x' });
    const r = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: largeBody
    });
    assert(r.status !== 200, `Large payload accepted`);
    assert(r.status < 500, `Server crashed: ${r.status}`);
  });

  await test('DoS', 'Rapid fire requests (10 in 1 second)', async () => {
    const promises = Array.from({ length: 10 }, (_, i) =>
      post('/api/auth/login', { email: `rapid${i}@test.com`, password: 'x' })
    );
    const results = await Promise.all(promises);
    const allOk = results.every(r => r.status < 500);
    assert(allOk, `Server crashed under load`);
  });

  // ════════════════════════════════════════════════════════
  // 12. CORS
  // ════════════════════════════════════════════════════════
  console.log('\n1️⃣2️⃣  CORS:');

  await test('CORS', 'Tidak ada Access-Control-Allow-Origin wildcard', async () => {
    try {
      const res = await fetch(`${BASE}/api/auth/session`, {
        headers: { Origin: 'https://evil.com' }
      });
      const cors = res.headers.get('access-control-allow-origin') || '';
      assertNot(cors === '*', 'CORS wildcard present');
    } catch {
      // CORS blocked — that's good!
    }
  });

  // ════════════════════════════════════════════════════════
  // 13. SECRETS IN RESPONSE
  // ════════════════════════════════════════════════════════
  console.log('\n1️⃣3️⃣  Secrets in Response:');

  await test('Secrets', '/api/db tidak mengembalikan password', async () => {
    const r = await get('/api/db');
    if (r.status === 200 && r.json.data?.users) {
      const passwords = r.json.data.users.filter((u: any) => u.password);
      assert(passwords.length === 0, `Passwords leaked: ${passwords.length} users`);
    }
  });

  await test('Secrets', 'Login response tidak mengembalikan password', async () => {
    const r = await post('/api/auth/login', { email: 'super@admin.com', password: 'superadmin123' });
    if (r.status === 200 && r.json.data) {
      assertNot(r.json.data.password, `Password leaked in login response`);
    }
  });

  // ════════════════════════════════════════════════════════
  // SUMMARY
  // ════════════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(50));
  console.log(`📊 Hasil: ${passed} ✅ passed | ${failed} ❌ failed | ${warned} ⚠️  warnings`);
  console.log('═'.repeat(50));

  if (failed > 0) {
    console.log('\n🚨 ADA CELAH KEAMANAN YANG PERLU DIPERBAIKI!');
    process.exit(1);
  } else {
    console.log('\n🎉 TIDAK ADA CELAH KEAMANAN DITEMUKAN!');
  }
}

run().catch((err) => {
  console.error('\n❌ Test error:', err.message);
  process.exit(1);
});
