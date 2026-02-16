import { getUserFromToken, getUser, getUserTasks, addUserTask, deductCredits } from '@/lib/storage-pg.mjs';

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

    const tasks = await getUserTasks(email);
    
    return Response.json({ 
      success: true,
      tasks
    }, { status: 200 });

  } catch (error) {
    console.error('Tasks fetch error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { description } = await request.json();

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const email = getUserFromToken(token);
    
    if (!email) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (!description || description.trim().length === 0) {
      return Response.json({ error: 'Task description required' }, { status: 400 });
    }

    const user = await getUser(email);
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const taskCost = 10;
    if (user.credits < taskCost) {
      return Response.json({ 
        error: 'Insufficient credits',
        required: taskCost,
        available: user.credits
      }, { status: 400 });
    }

    const task = {
      description: description.trim(),
      status: 'pending',
      creditsSpent: taskCost,
      createdAt: new Date().toISOString()
    };

    await addUserTask(email, task);
    const newCredits = await deductCredits(email, taskCost);
    
    console.log(`Task created for ${email}: ${description.substring(0, 50)}... (-${taskCost} credits, remaining: ${newCredits})`);
    
    return Response.json({ 
      success: true,
      task,
      credits: newCredits,
      message: 'Task submitted successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Task creation error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
