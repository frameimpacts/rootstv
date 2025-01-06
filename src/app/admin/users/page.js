'use client';
import { useState, useEffect } from 'react';
import { useSession } from '@/components/SessionProvider';
import { useRouter } from 'next/navigation';

export default function UserManagement() {
  const { session } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userRentals, setUserRentals] = useState([]);
  const [showRentalsModal, setShowRentalsModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${session.token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchUserRentals = async (userId) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/rentals`, {
        headers: {
          'Authorization': `Bearer ${session.token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch rentals');
      const data = await response.json();
      setUserRentals(data);
      setShowRentalsModal(true);
    } catch (error) {
      console.error('Failed to fetch user rentals:', error);
      setError('Failed to load rentals');
    }
  };

  const handleBanUser = async (userId) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`
        },
        body: JSON.stringify({
          userId,
          status: 'banned'
        })
      });

      if (!response.ok) throw new Error('Failed to ban user');
      
      // Refresh users list
      await fetchUsers();
      setShowBanModal(false);
    } catch (error) {
      console.error('Failed to ban user:', error);
      setError('Failed to ban user');
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`
        },
        body: JSON.stringify({
          userId,
          status: newStatus
        })
      });

      if (!response.ok) throw new Error('Failed to update user status');
      
      // Refresh users list
      await fetchUsers();
      setShowBanModal(false);
    } catch (error) {
      console.error('Failed to update user status:', error);
      setError('Failed to update user status');
    }
  };

  if (!session) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {error && (
        <div className="bg-red-50 text-xs text-red-600 p-4 rounded-lg mb-6">
          {error}
          <button 
            onClick={fetchUsers}
            className="ml-2 text-red-600 hover:text-red-700 underline"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-sm font-medium text-gray-600">User Management</h1>
        <div className="flex items-center space-x-3">
          <span className="text-xs text-gray-500">Total Users: {users.length}</span>
          <button className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-md font-medium hover:bg-red-100">
            Export Data
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-600 focus:outline-none focus:border-red-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-600"
        >
          <option value="all">All Users</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="premium">Premium</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left font-medium">User</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Joined</th>
              <th className="px-4 py-3 text-left font-medium">Last Login</th>
              <th className="px-4 py-3 text-left font-medium">Rented Movies</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-700">{user.name}</p>
                    <p className="text-gray-400">{user.email}</p>
                    <p className="text-gray-400">{user.phone}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    user.status === 'active' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {user.rented_movies}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => fetchUserRentals(user.id)}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      View Rentals
                    </button>
                    {user.status === 'banned' ? (
                      <button 
                        onClick={() => handleStatusChange(user.id, 'active')}
                        className="text-xs text-green-600 hover:text-green-700"
                      >
                        Unban User
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setShowBanModal(true);
                        }}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Ban User
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showRentalsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-700">User Rentals</h3>
              <button 
                onClick={() => setShowRentalsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(80vh-8rem)]">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Content</th>
                    <th className="px-4 py-3 text-left font-medium">Purchase Date</th>
                    <th className="px-4 py-3 text-left font-medium">Amount</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {userRentals.map((rental) => (
                    <tr key={rental.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-8 h-8 relative rounded overflow-hidden">
                            <img
                              src={rental.thumbnail_url}
                              alt={rental.title}
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">{rental.title}</p>
                            <p className="text-gray-400">{rental.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(rental.purchase_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        INR {rental.amount}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          rental.status === 'active' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {rental.status}
                          {rental.status === 'active' && rental.days_left && (
                            <span className="ml-1">({rental.days_left} days left)</span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full" 
                              style={{ width: `${rental.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">
                            {rental.progress}%
                          </span>
                        </div>
                        {rental.last_watched && (
                          <p className="text-xs text-gray-400 mt-1">
                            Last watched: {new Date(rental.last_watched).toLocaleDateString()}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showBanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Ban User</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to ban this user? They will no longer be able to access the platform.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowBanModal(false)}
                className="text-xs bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBanUser(selectedUserId)}
                className="text-xs bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Ban User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 