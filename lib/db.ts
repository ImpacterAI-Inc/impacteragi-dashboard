import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

export interface User {
  email: string;
  password_hash: string;
  credits_balance: number;
  created_at: string;
  stripe_customer_id?: string;
}

export interface Transaction {
  transaction_id: string;
  user_email: string;
  type: 'purchase' | 'spend';
  amount: number;
  timestamp: string;
  description?: string;
  stripe_payment_intent?: string;
}

export interface Task {
  task_id: string;
  user_email: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  credits_spent: number;
  created_at: string;
  updated_at: string;
}

const USERS_TABLE = 'ImpacterAGI_Users';
const TRANSACTIONS_TABLE = 'ImpacterAGI_Transactions';
const TASKS_TABLE = 'ImpacterAGI_Tasks';

export const db = {
  // Users
  async getUser(email: string): Promise<User | null> {
    const result = await docClient.send(new GetCommand({
      TableName: USERS_TABLE,
      Key: { email }
    }));
    return result.Item as User || null;
  },

  async createUser(user: User): Promise<void> {
    await docClient.send(new PutCommand({
      TableName: USERS_TABLE,
      Item: user,
      ConditionExpression: 'attribute_not_exists(email)'
    }));
  },

  async updateUserCredits(email: string, credits: number): Promise<void> {
    await docClient.send(new UpdateCommand({
      TableName: USERS_TABLE,
      Key: { email },
      UpdateExpression: 'SET credits_balance = :credits',
      ExpressionAttributeValues: {
        ':credits': credits
      }
    }));
  },

  async incrementUserCredits(email: string, amount: number): Promise<void> {
    await docClient.send(new UpdateCommand({
      TableName: USERS_TABLE,
      Key: { email },
      UpdateExpression: 'SET credits_balance = credits_balance + :amount',
      ExpressionAttributeValues: {
        ':amount': amount
      }
    }));
  },

  // Transactions
  async createTransaction(transaction: Transaction): Promise<void> {
    await docClient.send(new PutCommand({
      TableName: TRANSACTIONS_TABLE,
      Item: transaction
    }));
  },

  async getUserTransactions(email: string, limit: number = 50): Promise<Transaction[]> {
    const result = await docClient.send(new QueryCommand({
      TableName: TRANSACTIONS_TABLE,
      IndexName: 'user_email-timestamp-index',
      KeyConditionExpression: 'user_email = :email',
      ExpressionAttributeValues: {
        ':email': email
      },
      ScanIndexForward: false,
      Limit: limit
    }));
    return result.Items as Transaction[];
  },

  // Tasks
  async createTask(task: Task): Promise<void> {
    await docClient.send(new PutCommand({
      TableName: TASKS_TABLE,
      Item: task
    }));
  },

  async getUserTasks(email: string, limit: number = 50): Promise<Task[]> {
    const result = await docClient.send(new QueryCommand({
      TableName: TASKS_TABLE,
      IndexName: 'user_email-created_at-index',
      KeyConditionExpression: 'user_email = :email',
      ExpressionAttributeValues: {
        ':email': email
      },
      ScanIndexForward: false,
      Limit: limit
    }));
    return result.Items as Task[];
  },

  async updateTaskStatus(taskId: string, status: Task['status']): Promise<void> {
    await docClient.send(new UpdateCommand({
      TableName: TASKS_TABLE,
      Key: { task_id: taskId },
      UpdateExpression: 'SET #status = :status, updated_at = :updated_at',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': status,
        ':updated_at': new Date().toISOString()
      }
    }));
  }
};
