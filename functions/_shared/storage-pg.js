// PostgreSQL PERSISTENT STORAGE - Unified adapter
import pkg from 'pg';
const { Pool } = pkg;

let pool = null;
let initialized = false;

async function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not set - PostgreSQL connection required');
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }
  return pool;
}

async function init() {
  if (initialized) return;
  
  const p = await getPool();
  
  // Create tables if they don't exist
  await p.query(`
    CREATE TABLE IF NOT EXISTS users (
      email VARCHAR(255) PRIMARY KEY,
      password_hash VARCHAR(255) NOT NULL,
      credits INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      credits_spent INTEGER DEFAULT 10,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS redeemed_codes (
      email VARCHAR(255) NOT NULL,
      code VARCHAR(50) NOT NULL,
      redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (email, code)
    );
  `);

  initialized = true;
}

// Users storage
export async function getUser(email, env) {
  await init();
  const p = await getPool();
  const result = await p.query(
    'SELECT email, password_hash as "passwordHash", credits, created_at FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}

export async function saveUser(email, userData, env) {
  await init();
  const p = await getPool();
  await p.query(
    `INSERT INTO users (email, password_hash, credits) 
     VALUES ($1, $2, $3) 
     ON CONFLICT (email) 
     DO UPDATE SET password_hash = $2, credits = $3`,
    [email, userData.passwordHash, userData.credits || 0]
  );
}

// Tasks storage
export async function getUserTasks(email, env) {
  await init();
  const p = await getPool();
  const result = await p.query(
    'SELECT id, email, description, status, credits_spent, created_at FROM tasks WHERE email = $1 ORDER BY created_at DESC',
    [email]
  );
  return result.rows || [];
}

export async function addUserTask(email, task, env) {
  await init();
  const p = await getPool();
  await p.query(
    'INSERT INTO tasks (email, description, status, credits_spent) VALUES ($1, $2, $3, $4)',
    [email, task.description, task.status || 'pending', task.creditsSpent || 10]
  );
}

// Redeemed codes tracking
export async function hasRedeemedCode(email, code, env) {
  await init();
  const p = await getPool();
  const result = await p.query(
    'SELECT 1 FROM redeemed_codes WHERE email = $1 AND code = $2',
    [email, code]
  );
  return result.rows.length > 0;
}

export async function markCodeRedeemed(email, code, env) {
  await init();
  const p = await getPool();
  await p.query(
    'INSERT INTO redeemed_codes (email, code) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [email, code]
  );
}

// Credit operations
export async function addCredits(email, amount, env) {
  await init();
  const p = await getPool();
  const result = await p.query(
    'UPDATE users SET credits = credits + $1 WHERE email = $2 RETURNING credits',
    [amount, email]
  );
  return result.rows[0]?.credits || null;
}

export async function deductCredits(email, amount, env) {
  await init();
  const p = await getPool();
  const result = await p.query(
    'UPDATE users SET credits = credits - $1 WHERE email = $2 AND credits >= $1 RETURNING credits',
    [amount, email]
  );
  return result.rowCount > 0;
}

// Token utilities
export function getUserFromToken(token) {
  try {
    const decoded = atob(token);
    const [email] = decoded.split(':');
    return email;
  } catch {
    return null;
  }
}

export function generateToken(email) {
  return btoa(`${email}:${Date.now()}:${Math.random()}`);
}

// Password utilities
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

export async function verifyPassword(password, hash) {
  const testHash = await hashPassword(password);
  return testHash === hash;
}
