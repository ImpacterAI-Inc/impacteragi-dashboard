import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface TokenPayload {
  email: string;
  iat?: number;
  exp?: number;
}

export const auth = {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  },

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },

  generateToken(email: string): string {
    return jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' });
  },

  verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch {
      return null;
    }
  },

  getTokenFromRequest(request: Request): string | null {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  },

  async getUserFromRequest(request: Request): Promise<string | null> {
    const token = this.getTokenFromRequest(request);
    if (!token) return null;
    
    const payload = this.verifyToken(token);
    return payload?.email || null;
  }
};
