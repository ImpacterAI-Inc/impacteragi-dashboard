# OpenClaw Integration Guide

## Overview

This dashboard needs to communicate with OpenClaw to spawn agents and execute tasks. This guide explains how to integrate the two systems.

## Architecture

```
User Request → Dashboard API → Agent Spawner → OpenClaw → Task Execution → Result → Dashboard
```

## Integration Points

### 1. Agent Spawner (`/src/lib/agent-spawner.ts`)

**Current Status:** Mock implementation  
**Needs:** Real OpenClaw API calls

**Key Functions:**

```typescript
// Spawn an agent to handle a task
spawnAgent(taskId, userId, requestText)

// Determine which agent type to use
determineAgentType(requestText) 

// Call OpenClaw API
callOpenClawAgent(agentType, requestText)
```

### 2. OpenClaw API Requirements

The dashboard expects OpenClaw to provide:

**Endpoint:** `POST /agent/spawn` (or whatever your API uses)

**Request:**
```json
{
  "type": "lead-generation",
  "task": "Find me 100 real estate investors in Miami",
  "userId": "user-id",
  "taskId": "task-id"
}
```

**Response:**
```json
{
  "status": "success",
  "agentId": "agent-123",
  "result": {
    "message": "Found 103 real estate investors",
    "summary": "...",
    "details": {...}
  },
  "fileData": "base64-encoded-file-data",
  "fileName": "leads.csv"
}
```

### 3. Agent Types

The system recognizes these agent types:

- `lead-generation` - Find leads, compile lists
- `email-campaign` - Send emails
- `web-scraping` - Extract data from websites
- `social-media` - Post to social platforms
- `content-creation` - Create websites, documents
- `research` - Research and analysis
- `general` - Catch-all

**Mapping Logic:**

```typescript
// Keywords in user request → agent type
"find leads" → lead-generation
"send email" → email-campaign
"scrape data" → web-scraping
"post to twitter" → social-media
"create website" → content-creation
"research" → research
```

## Implementation Options

### Option 1: OpenClaw REST API

**Best for:** OpenClaw already has an HTTP API

1. Update `OPENCLAW_API_URL` in `.env`
2. Implement `callOpenClawAgent()`:

```typescript
async function callOpenClawAgent(agentType, requestText) {
  const response = await axios.post(`${OPENCLAW_API_URL}/agent/spawn`, {
    type: agentType,
    task: requestText,
  }, {
    headers: {
      'Authorization': `Bearer ${OPENCLAW_API_KEY}`,
    },
  })
  
  return {
    status: 'success',
    result: response.data.result,
    fileData: response.data.file ? Buffer.from(response.data.file, 'base64') : null,
    fileName: response.data.fileName,
  }
}
```

### Option 2: Direct OpenClaw SDK

**Best for:** OpenClaw provides a Node.js SDK

```typescript
import { OpenClaw } from '@openclaw/sdk'

const openclaw = new OpenClaw({
  apiKey: process.env.OPENCLAW_API_KEY,
})

async function callOpenClawAgent(agentType, requestText) {
  const agent = await openclaw.spawn({
    type: agentType,
    task: requestText,
  })
  
  const result = await agent.execute()
  
  return {
    status: result.success ? 'success' : 'error',
    result: result.data,
    error: result.error,
  }
}
```

### Option 3: Message Queue (Async)

**Best for:** Long-running tasks, high volume

1. Dashboard publishes task to queue (SQS, RabbitMQ)
2. OpenClaw worker picks up task
3. Worker updates task status via callback URL
4. Dashboard polls for completion

```typescript
import { SQS } from 'aws-sdk'

const sqs = new SQS()

async function callOpenClawAgent(agentType, requestText) {
  // Publish to queue
  await sqs.sendMessage({
    QueueUrl: process.env.OPENCLAW_QUEUE_URL,
    MessageBody: JSON.stringify({
      taskId,
      type: agentType,
      task: requestText,
      callbackUrl: `${APP_URL}/api/tasks/${taskId}/callback`,
    }),
  }).promise()
  
  // Return immediately - worker will update status
  return { status: 'queued' }
}
```

### Option 4: Direct Process Spawn (Same Server)

**Best for:** OpenClaw runs on same server

```typescript
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

async function callOpenClawAgent(agentType, requestText) {
  const command = `openclaw agent run --type ${agentType} --task "${requestText}"`
  
  const { stdout, stderr } = await execAsync(command)
  
  if (stderr) {
    return { status: 'error', error: stderr }
  }
  
  return {
    status: 'success',
    result: JSON.parse(stdout),
  }
}
```

## Recommended Approach

**For MVP:** Option 1 (REST API) or Option 4 (Direct Spawn)
**For Production:** Option 3 (Message Queue) for scalability

## Task Status Updates

Dashboard polls for task status every 2 seconds:

```
GET /api/tasks/{taskId}
```

OpenClaw should update task record when:
- Agent starts processing
- Agent completes successfully
- Agent fails

## File Handling

When agent produces a file (CSV, PDF, etc.):

1. Agent returns file as base64 or Buffer
2. Dashboard uploads to S3
3. Dashboard generates signed URL (7-day expiry)
4. User can download from chat interface

## Error Handling

**Agent Errors:**
- Set task status to `failed`
- Store error message
- Don't deduct credits
- Show user-friendly error in chat

**Timeout:**
- If task takes >5 minutes, show warning
- Continue running in background
- User can check task history

## Testing Integration

### Test 1: Simple Task
```
User: "Find me 10 leads in Miami"
Expected: Agent returns list of 10 leads
```

### Test 2: File Output
```
User: "Find 100 real estate investors and export to CSV"
Expected: Agent returns CSV file, user can download
```

### Test 3: Error Handling
```
User: "Do something impossible"
Expected: Agent returns error, user sees friendly message
```

### Test 4: Credit Deduction
```
User: Has 100 credits, makes 50-credit request
Expected: Task completes, user has 50 credits left
```

## Monitoring

Add logging for:
- Agent spawn requests
- Agent responses
- Task completion time
- Error rates
- Credit usage

## Security

- ✅ Validate user has enough credits before spawning
- ✅ Rate limit requests per user
- ✅ Sanitize user input before passing to agent
- ✅ Secure API keys (environment variables)
- ✅ Use HTTPS for all API calls

## Sample Integration (Real Code)

Replace the mock in `/src/lib/agent-spawner.ts`:

```typescript
async function callOpenClawAgent(agentType, requestText) {
  try {
    // YOUR IMPLEMENTATION HERE
    // Example: HTTP API call
    
    const response = await axios.post(
      `${OPENCLAW_API_URL}/v1/agents/execute`,
      {
        agent_type: agentType,
        prompt: requestText,
        max_tokens: 4000,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENCLAW_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 300000, // 5 minutes
      }
    )

    // Parse response
    const result = response.data
    
    // Handle file output if present
    let fileData = null
    let fileName = null
    
    if (result.output_file) {
      fileData = Buffer.from(result.output_file.data, 'base64')
      fileName = result.output_file.name
    }

    return {
      status: result.success ? 'success' : 'error',
      result: {
        message: result.message,
        summary: result.summary,
        details: result.data,
      },
      fileData,
      fileName,
      error: result.error,
    }

  } catch (error) {
    console.error('OpenClaw API error:', error)
    
    return {
      status: 'error',
      error: error.response?.data?.message || error.message,
    }
  }
}
```

## Next Steps

1. Decide which integration approach to use
2. Update `callOpenClawAgent()` in `agent-spawner.ts`
3. Test with real OpenClaw instance
4. Monitor logs for errors
5. Adjust credit estimates based on actual usage
6. Scale as needed

---

**Questions?** Check the dashboard logs and OpenClaw logs for debugging.
