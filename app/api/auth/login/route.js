// Next.js API Route for user login
import { getUser, verifyPassword, generateToken } from '@/lib/storage-pg.mjs';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return Response.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Get user from storage
    const user = await getUser(email);
    
    if (!user) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    
    if (!isValid) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Generate new token
    const token = generateToken(email);
    
    console.log(`User logged in: ${email}, credits: ${user.credits || 0}`);
    
    return Response.json({ 
      success: true, 
      token,
      email,
      credits: user.credits || 0
    }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  }
}
