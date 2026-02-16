'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  email: string;
  credits: number;
  created_at: string;
}

interface Task {
  task_id: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  credits_spent: number;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskDescription, setTaskDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // NEW: Code redemption state
  const [redeemCode, setRedeemCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState('');
  const [redeemSuccess, setRedeemSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      // Load user data
      const userResponse = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!userResponse.ok) {
        throw new Error('Failed to load user');
      }

      const userData = await userResponse.json();
      setUser(userData);

      // Load tasks
      const tasksResponse = await fetch('/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        setTasks(tasksData.tasks || []);
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      localStorage.removeItem('token');
      router.push('/login');
    }
  };

  // NEW: Handle code redemption
  const handleRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setRedeemError('');
    setRedeemSuccess('');
    setRedeeming(true);

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('/api/redeem', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: redeemCode.trim().toUpperCase() })
      });

      const data = await response.json();

      if (!response.ok) {
        setRedeemError(data.error || 'Invalid code');
        setRedeeming(false);
        return;
      }

      setRedeemSuccess(data.message || `Successfully redeemed ${data.credits} credits!`);
      setRedeemCode('');
      
      // Reload user data to show new credits
      await loadData();
      
      setRedeeming(false);
    } catch (err) {
      setRedeemError('An error occurred. Please try again.');
      setRedeeming(false);
    }
  };

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ description: taskDescription })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to submit task');
        setSubmitting(false);
        return;
      }

      setSuccess('Task submitted successfully!');
      setTaskDescription('');
      
      // Reload data
      await loadData();
      
      setSubmitting(false);
    } catch (err) {
      setError('An error occurred. Please try again.');
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">ImpacterAGI Dashboard</h1>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Credits Balance */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-medium text-gray-600">Available Credits</h2>
              <p className="text-4xl font-bold text-indigo-600">{user?.credits || 0}</p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>Account: {user?.email}</p>
              <p>Member since: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* NEW: Code Redemption */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow p-6 mb-8 text-white">
          <h2 className="text-xl font-semibold mb-4">🎁 Have a Credit Code?</h2>
          <form onSubmit={handleRedeemCode} className="flex gap-3">
            <input
              type="text"
              className="flex-1 px-4 py-2 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="Enter code (e.g. BETA10K)"
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={redeeming}
              className="px-6 py-2 bg-white text-indigo-600 font-medium rounded-md hover:bg-gray-100 disabled:opacity-50"
            >
              {redeeming ? 'Redeeming...' : 'Redeem'}
            </button>
          </form>
          {redeemError && (
            <div className="mt-3 text-sm bg-red-500 bg-opacity-20 rounded p-2">
              {redeemError}
            </div>
          )}
          {redeemSuccess && (
            <div className="mt-3 text-sm bg-white bg-opacity-20 rounded p-2">
              ✅ {redeemSuccess}
            </div>
          )}
        </div>

        {/* Submit Task Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Submit New Task</h2>
          <form onSubmit={handleSubmitTask}>
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-800">{error}</div>
              </div>
            )}
            {success && (
              <div className="mb-4 rounded-md bg-green-50 p-4">
                <div className="text-sm text-green-800">{success}</div>
              </div>
            )}
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              rows={4}
              placeholder="Describe the task you'd like us to complete... (Cost: 10 credits)"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              required
            />
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-gray-600">Cost: 10 credits per task</p>
              <button
                type="submit"
                disabled={submitting || (user?.credits || 0) < 10}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Task'}
              </button>
            </div>
            {(user?.credits || 0) < 10 && (
              <p className="mt-2 text-sm text-red-600">Need more credits? Redeem a code above!</p>
            )}
          </form>
        </div>

        {/* Task History */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Task History</h2>
          {tasks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No tasks yet. Submit your first task above!</p>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.task_id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                    <span className="text-sm text-gray-500">{formatDate(task.created_at)}</span>
                  </div>
                  <p className="text-gray-900 mb-2">{task.description}</p>
                  <p className="text-xs text-gray-500">Cost: {task.credits_spent} credits</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
