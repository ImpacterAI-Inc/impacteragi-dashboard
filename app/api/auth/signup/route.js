// Next.js API Route for user signup
import { getUser, saveUser, generateToken, hashPassword } from '@/lib/storage-pg.mjs';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return Response.json({ error: 'Email and password required' }, { status: 400 });
    }

    if (password.length < 8) {
      return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await getUser(email);
    if (existingUser) {
      return Response.json({ error: 'User already exists' }, { status: 409 });
    }

    // Create new user
    const token = generateToken(email);
    const userData = {
      email,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
      credits: 0,
      token
    };

    // Save user to storage
    await saveUser(email, userData);
    
    console.log(`User created: ${email} with 0 credits`);
    
    return Response.json({ 
      success: true, 
      token,
      email,
      credits: 0
    }, { status: 200 });

  } catch (error) {
    console.error('Signup error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
