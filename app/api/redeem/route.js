import { getUserFromToken, getUser, addCredits, hasRedeemedCode, markCodeRedeemed } from '@/lib/storage-pg.mjs';

const VALID_CODES = {
  'BETA10K': 10000,
  'BETA5K': 5000,
  'WELCOME': 1000
};

export async function POST(request) {
  try {
    const { code } = await request.json();

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const email = getUserFromToken(token);
    
    if (!email) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (!code) {
      return Response.json({ error: 'Code required' }, { status: 400 });
    }

    const codeUpper = code.toUpperCase();
    const creditsToAdd = VALID_CODES[codeUpper];
    
    if (!creditsToAdd) {
      return Response.json({ error: 'Invalid code' }, { status: 400 });
    }

    // Check if code already redeemed
    const alreadyRedeemed = await hasRedeemedCode(email, codeUpper);
    if (alreadyRedeemed) {
      return Response.json({ error: 'Code already redeemed' }, { status: 400 });
    }

    // Add credits using PostgreSQL
    const newTotal = await addCredits(email, creditsToAdd);
    
    // Mark code as redeemed
    await markCodeRedeemed(email, codeUpper);
    
    console.log(`Code redeemed: ${email} - ${codeUpper} (+${creditsToAdd} credits, new total: ${newTotal})`);
    
    return Response.json({ 
      success: true,
      credits: newTotal,
      message: `Successfully redeemed ${creditsToAdd} credits!`
    }, { status: 200 });

  } catch (error) {
    console.error('Redeem error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
