// Cloudflare Pages Function to manage tasks
import { getUserFromToken, getUser, getUserTasks, addUserTask, deductCredits } from '../_shared/storage-pg.js';

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    
    // Get token from Authorization header
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

    // Get user's tasks
    const tasks = await getUserTasks(email, env);
    
    return new Response(JSON.stringify({ 
      success: true,
      tasks
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Tasks fetch error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { description } = await request.json();

    // Get token from Authorization header
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

    if (!description) {
      return new Response(JSON.stringify({ error: 'Description required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get user to check credits
    const user = await getUser(email, env);
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const TASK_COST = 10;
    
    if ((user.credits || 0) < TASK_COST) {
      return new Response(JSON.stringify({ error: 'Insufficient credits' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Deduct credits
    const success = await deductCredits(email, TASK_COST, env);
    if (!success) {
      return new Response(JSON.stringify({ error: 'Insufficient credits' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create task
    const task = {
      description,
      status: 'pending',
      creditsSpent: TASK_COST
    };

    // Save task
    await addUserTask(email, task, env);
    
    // Get updated user credits
    const updatedUser = await getUser(email, env);
    
    console.log(`Task created: ${email}, credits: ${updatedUser.credits}`);

    return new Response(JSON.stringify({ 
      success: true,
      task,
      credits: updatedUser.credits
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Task creation error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    }
  });
}
