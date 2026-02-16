import { getUserFromToken, getUser, addCredits, hasRedeemedCode, markCodeRedeemed } from '../_shared/storage-pg.js';

const VALID_CODES = {
  'BETA10K': 10000,
  'BETA5K': 5000,
  'WELCOME': 1000
};

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { code } = await request.json();

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.substring(7);
    const email = getUserFromToken(token);
    
    if (!email) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!code) {
      return new Response(JSON.stringify({ error: 'Code required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const codeUpper = code.toUpperCase();
    const creditsToAdd = VALID_CODES[codeUpper];
    
    if (!creditsToAdd) {
      return new Response(JSON.stringify({ error: 'Invalid code' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if code already redeemed
    const alreadyRedeemed = await hasRedeemedCode(email, codeUpper, env);
    if (alreadyRedeemed) {
      return new Response(JSON.stringify({ error: 'Code already redeemed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Add credits using PostgreSQL
    const newTotal = await addCredits(email, creditsToAdd, env);
    
    if (newTotal === null) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Mark code as redeemed
    await markCodeRedeemed(email, codeUpper, env);
    
    console.log(`Code redeemed: ${email} redeemed ${codeUpper} for ${creditsToAdd} credits, new total: ${newTotal}`);
    
    return new Response(JSON.stringify({ 
      success: true,
      credits: newTotal,
      message: `Successfully redeemed ${creditsToAdd} credits! Total: ${newTotal}`
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Redeem error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    }
  });
}
