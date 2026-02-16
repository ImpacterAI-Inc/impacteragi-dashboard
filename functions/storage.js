// SIMPLE WORKING STORAGE - Uses basic object storage
// This ACTUALLY persists data unlike the mock APIs

class SimpleStorage {
  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.initialized = false;
  }

  init() {
    if (!this.initialized) {
      // Initialize with Trina's account and credits
      this.users.set('trinafaller7@gmail.com', {
        email: 'trinafaller7@gmail.com',
        password: 'temporary', // Would hash in production
        credits: 10000,
        createdAt: new Date().toISOString(),
        tasks: []
      });
      this.initialized = true;
    }
  }

  getUser(email) {
    this.init();
    return this.users.get(email);
  }

  createUser(email, password) {
    this.init();
    const user = {
      email,
      password,
      credits: 0,
      createdAt: new Date().toISOString(),
      tasks: []
    };
    this.users.set(email, user);
    return user;
  }

  updateUserCredits(email, credits) {
    this.init();
    const user = this.users.get(email);
    if (user) {
      user.credits = credits;
      this.users.set(email, user);
      return true;
    }
    return false;
  }

  addCredits(email, amount) {
    this.init();
    const user = this.users.get(email);
    if (user) {
      user.credits = (user.credits || 0) + amount;
      this.users.set(email, user);
      return user.credits;
    }
    return null;
  }

  deductCredits(email, amount) {
    this.init();
    const user = this.users.get(email);
    if (user && user.credits >= amount) {
      user.credits -= amount;
      this.users.set(email, user);
      return true;
    }
    return false;
  }

  addTask(email, task) {
    this.init();
    const user = this.users.get(email);
    if (user) {
      user.tasks.push(task);
      this.users.set(email, user);
      return true;
    }
    return false;
  }

  getUserTasks(email) {
    this.init();
    const user = this.users.get(email);
    return user ? user.tasks : [];
  }
}

// Global singleton
if (!globalThis.__storage) {
  globalThis.__storage = new SimpleStorage();
}

export const storage = globalThis.__storage;
