// Shared storage utilities for Cloudflare Pages Functions
// Supports both KV storage (production) and in-memory fallback (development)

const USERS_STORAGE_KEY = 'impacteragi_users';
const TASKS_STORAGE_KEY = 'impacteragi_tasks';
const REDEEMED_CODES_KEY = 'impacteragi_redeemed_codes';

// Initialize in-memory storage
if (!globalThis.__impacteragi_users) {
  globalThis.__impacteragi_users = {};
}
if (!globalThis.__impacteragi_tasks) {
  globalThis.__impacteragi_tasks = {};
}
if (!globalThis.__impacteragi_redeemed_codes) {
  globalThis.__impacteragi_redeemed_codes = {};
}

// Users storage
export async function getUsers(env) {
  if (env?.USERS_KV) {
    try {
      const data = await env.USERS_KV.get(USERS_STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error('KV read error, falling back to memory:', e);
    }
  }
  return globalThis.__impacteragi_users;
}

export async function saveUsers(users, env) {
  if (env?.USERS_KV) {
    try {
      await env.USERS_KV.put(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('KV write error, falling back to memory:', e);
    }
  }
  globalThis.__impacteragi_users = users;
}

export async function getUser(email, env) {
  const users = await getUsers(env);
  return users[email] || null;
}

export async function saveUser(email, userData, env) {
  const users = await getUsers(env);
  users[email] = userData;
  await saveUsers(users, env);
}

// Tasks storage
export async function getTasks(env) {
  if (env?.USERS_KV) {
    try {
      const data = await env.USERS_KV.get(TASKS_STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error('KV read error, falling back to memory:', e);
    }
  }
  return globalThis.__impacteragi_tasks;
}

export async function saveTasks(tasks, env) {
  if (env?.USERS_KV) {
    try {
      await env.USERS_KV.put(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('KV write error, falling back to memory:', e);
    }
  }
  globalThis.__impacteragi_tasks = tasks;
}

export async function getUserTasks(email, env) {
  const tasks = await getTasks(env);
  return tasks[email] || [];
}

export async function addUserTask(email, task, env) {
  const tasks = await getTasks(env);
  if (!tasks[email]) {
    tasks[email] = [];
  }
  tasks[email].push(task);
  await saveTasks(tasks, env);
}

// Redeemed codes tracking (to prevent double redemption)
export async function getRedeemedCodes(env) {
  if (env?.USERS_KV) {
    try {
      const data = await env.USERS_KV.get(REDEEMED_CODES_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error('KV read error, falling back to memory:', e);
    }
  }
  return globalThis.__impacteragi_redeemed_codes;
}

export async function saveRedeemedCodes(codes, env) {
  if (env?.USERS_KV) {
    try {
      await env.USERS_KV.put(REDEEMED_CODES_KEY, JSON.stringify(codes));
    } catch (e) {
      console.error('KV write error, falling back to memory:', e);
    }
  }
  globalThis.__impacteragi_redeemed_codes = codes;
}

export async function hasRedeemedCode(email, code, env) {
  const redeemed = await getRedeemedCodes(env);
  const userCodes = redeemed[email] || [];
  return userCodes.includes(code);
}

export async function markCodeRedeemed(email, code, env) {
  const redeemed = await getRedeemedCodes(env);
  if (!redeemed[email]) {
    redeemed[email] = [];
  }
  if (!redeemed[email].includes(code)) {
    redeemed[email].push(code);
  }
  await saveRedeemedCodes(redeemed, env);
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
