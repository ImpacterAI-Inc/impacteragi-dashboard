#!/usr/bin/env node

const { DynamoDBClient, CreateTableCommand, ListTablesCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1' });

async function createTables() {
  console.log('Creating DynamoDB tables...\n');

  // Check existing tables
  const listResult = await client.send(new ListTablesCommand({}));
  const existingTables = listResult.TableNames || [];

  // Users table
  if (!existingTables.includes('ImpacterAGI_Users')) {
    console.log('Creating ImpacterAGI_Users table...');
    await client.send(new CreateTableCommand({
      TableName: 'ImpacterAGI_Users',
      KeySchema: [
        { AttributeName: 'email', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'email', AttributeType: 'S' }
      ],
      BillingMode: 'PAY_PER_REQUEST'
    }));
    console.log('✓ ImpacterAGI_Users created\n');
  } else {
    console.log('✓ ImpacterAGI_Users already exists\n');
  }

  // Transactions table
  if (!existingTables.includes('ImpacterAGI_Transactions')) {
    console.log('Creating ImpacterAGI_Transactions table...');
    await client.send(new CreateTableCommand({
      TableName: 'ImpacterAGI_Transactions',
      KeySchema: [
        { AttributeName: 'transaction_id', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'transaction_id', AttributeType: 'S' },
        { AttributeName: 'user_email', AttributeType: 'S' },
        { AttributeName: 'timestamp', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'user_email-timestamp-index',
          KeySchema: [
            { AttributeName: 'user_email', KeyType: 'HASH' },
            { AttributeName: 'timestamp', KeyType: 'RANGE' }
          ],
          Projection: { ProjectionType: 'ALL' }
        }
      ],
      BillingMode: 'PAY_PER_REQUEST'
    }));
    console.log('✓ ImpacterAGI_Transactions created\n');
  } else {
    console.log('✓ ImpacterAGI_Transactions already exists\n');
  }

  // Tasks table
  if (!existingTables.includes('ImpacterAGI_Tasks')) {
    console.log('Creating ImpacterAGI_Tasks table...');
    await client.send(new CreateTableCommand({
      TableName: 'ImpacterAGI_Tasks',
      KeySchema: [
        { AttributeName: 'task_id', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'task_id', AttributeType: 'S' },
        { AttributeName: 'user_email', AttributeType: 'S' },
        { AttributeName: 'created_at', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'user_email-created_at-index',
          KeySchema: [
            { AttributeName: 'user_email', KeyType: 'HASH' },
            { AttributeName: 'created_at', KeyType: 'RANGE' }
          ],
          Projection: { ProjectionType: 'ALL' }
        }
      ],
      BillingMode: 'PAY_PER_REQUEST'
    }));
    console.log('✓ ImpacterAGI_Tasks created\n');
  } else {
    console.log('✓ ImpacterAGI_Tasks already exists\n');
  }

  console.log('All tables ready!');
}

createTables().catch(console.error);
