#!/usr/bin/env node

/**
 * Admin CLI Tool - View and manage tasks
 * Usage: node scripts/admin.js [command] [args]
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, UpdateCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

const TASKS_TABLE = 'ImpacterAGI_Tasks';
const USERS_TABLE = 'ImpacterAGI_Users';

async function listPendingTasks() {
  console.log('📋 Pending Tasks:\n');
  
  const result = await docClient.send(new ScanCommand({
    TableName: TASKS_TABLE,
    FilterExpression: '#status = :status',
    ExpressionAttributeNames: {
      '#status': 'status'
    },
    ExpressionAttributeValues: {
      ':status': 'pending'
    }
  }));

  if (result.Items.length === 0) {
    console.log('No pending tasks.');
    return;
  }

  result.Items.forEach((task, i) => {
    console.log(`${i + 1}. Task ID: ${task.task_id}`);
    console.log(`   User: ${task.user_email}`);
    console.log(`   Created: ${new Date(task.created_at).toLocaleString()}`);
    console.log(`   Description: ${task.description}`);
    console.log(`   Credits: ${task.credits_spent}`);
    console.log('');
  });
}

async function listAllTasks() {
  console.log('📋 All Tasks:\n');
  
  const result = await docClient.send(new ScanCommand({
    TableName: TASKS_TABLE
  }));

  if (result.Items.length === 0) {
    console.log('No tasks yet.');
    return;
  }

  const sorted = result.Items.sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  );

  sorted.forEach((task, i) => {
    const statusColor = task.status === 'pending' ? '🟡' : 
                       task.status === 'in-progress' ? '🔵' : '✅';
    console.log(`${i + 1}. ${statusColor} ${task.status.toUpperCase()}`);
    console.log(`   Task ID: ${task.task_id}`);
    console.log(`   User: ${task.user_email}`);
    console.log(`   Created: ${new Date(task.created_at).toLocaleString()}`);
    console.log(`   Description: ${task.description.substring(0, 100)}${task.description.length > 100 ? '...' : ''}`);
    console.log('');
  });
}

async function updateTaskStatus(taskId, newStatus) {
  await docClient.send(new UpdateCommand({
    TableName: TASKS_TABLE,
    Key: { task_id: taskId },
    UpdateExpression: 'SET #status = :status, updated_at = :updated_at',
    ExpressionAttributeNames: {
      '#status': 'status'
    },
    ExpressionAttributeValues: {
      ':status': newStatus,
      ':updated_at': new Date().toISOString()
    }
  }));

  console.log(`✅ Task ${taskId} updated to: ${newStatus}`);
}

async function getUserInfo(email) {
  const result = await docClient.send(new GetCommand({
    TableName: USERS_TABLE,
    Key: { email }
  }));

  if (!result.Item) {
    console.log(`User ${email} not found.`);
    return;
  }

  const user = result.Item;
  console.log('👤 User Information:\n');
  console.log(`Email: ${user.email}`);
  console.log(`Credits: ${user.credits_balance}`);
  console.log(`Created: ${new Date(user.created_at).toLocaleString()}`);
  if (user.stripe_customer_id) {
    console.log(`Stripe Customer: ${user.stripe_customer_id}`);
  }
}

async function listUsers() {
  console.log('👥 All Users:\n');
  
  const result = await docClient.send(new ScanCommand({
    TableName: USERS_TABLE
  }));

  if (result.Items.length === 0) {
    console.log('No users yet.');
    return;
  }

  const sorted = result.Items.sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  );

  sorted.forEach((user, i) => {
    console.log(`${i + 1}. ${user.email}`);
    console.log(`   Credits: ${user.credits_balance}`);
    console.log(`   Created: ${new Date(user.created_at).toLocaleDateString()}`);
    console.log('');
  });
}

// Main CLI
const command = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];

async function main() {
  switch (command) {
    case 'tasks':
      await listAllTasks();
      break;
    case 'pending':
      await listPendingTasks();
      break;
    case 'update':
      if (!arg1 || !arg2) {
        console.log('Usage: node admin.js update <task_id> <status>');
        console.log('Status: pending | in-progress | completed');
        return;
      }
      await updateTaskStatus(arg1, arg2);
      break;
    case 'user':
      if (!arg1) {
        console.log('Usage: node admin.js user <email>');
        return;
      }
      await getUserInfo(arg1);
      break;
    case 'users':
      await listUsers();
      break;
    default:
      console.log('ImpacterAGI Admin CLI\n');
      console.log('Commands:');
      console.log('  tasks          - List all tasks');
      console.log('  pending        - List pending tasks only');
      console.log('  update <id> <status> - Update task status');
      console.log('  user <email>   - Get user info');
      console.log('  users          - List all users');
      console.log('\nExamples:');
      console.log('  node scripts/admin.js pending');
      console.log('  node scripts/admin.js update task_123 completed');
      console.log('  node scripts/admin.js user test@example.com');
  }
}

main().catch(console.error);
