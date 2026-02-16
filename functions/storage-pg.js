// PostgreSQL PERSISTENT STORAGE
import pkg from 'pg';
const { Pool } = pkg;

class PostgresStorage {
  constructor() {
    this.pool = null;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    // Check for DATABASE_URL environment variable
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not set - PostgreSQL connection required');
    }

    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    // Create tables if they don't exist
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        email VARCHAR(255) PRIMARY KEY,
        password VARCHAR(255) NOT NULL,
        credits INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        credits_spent INTEGER DEFAULT 10,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (email) REFERENCES users(email)
      );
    `);

    this.initialized = true;
  }

  async getUser(email) {
    await this.init();
    const result = await this.pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  async createUser(email, password) {
    await this.init();
    const result = await this.pool.query(
      'INSERT INTO users (email, password, credits) VALUES ($1, $2, 0) RETURNING *',
      [email, password]
    );
    return result.rows[0];
  }

  async updateUserCredits(email, credits) {
    await this.init();
    const result = await this.pool.query(
      'UPDATE users SET credits = $1 WHERE email = $2 RETURNING *',
      [credits, email]
    );
    return result.rowCount > 0;
  }

  async addCredits(email, amount) {
    await this.init();
    const result = await this.pool.query(
      'UPDATE users SET credits = credits + $1 WHERE email = $2 RETURNING credits',
      [amount, email]
    );
    return result.rows[0]?.credits || null;
  }

  async deductCredits(email, amount) {
    await this.init();
    const result = await this.pool.query(
      'UPDATE users SET credits = credits - $1 WHERE email = $2 AND credits >= $1 RETURNING credits',
      [amount, email]
    );
    return result.rowCount > 0;
  }

  async addTask(email, task) {
    await this.init();
    const result = await this.pool.query(
      'INSERT INTO tasks (email, description, status, credits_spent) VALUES ($1, $2, $3, $4) RETURNING *',
      [email, task.description, task.status || 'pending', task.credits_spent || 10]
    );
    return result.rowCount > 0;
  }

  async getUserTasks(email) {
    await this.init();
    const result = await this.pool.query(
      'SELECT * FROM tasks WHERE email = $1 ORDER BY created_at DESC',
      [email]
    );
    return result.rows || [];
  }
}

// Global singleton
if (!globalThis.__pg_storage) {
  globalThis.__pg_storage = new PostgresStorage();
}

export const storage = globalThis.__pg_storage;
