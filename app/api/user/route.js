import { getUser, getUserFromToken } from '@/lib/storage-pg.mjs';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const email = getUserFromToken(token);
    
    if (!email) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await getUser(email);
    
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json({
      success: true,
      email: user.email,
      credits: user.credits,
      createdAt: user.created_at
    }, { status: 200 });

  } catch (error) {
    console.error('User API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
