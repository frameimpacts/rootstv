'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/components/SessionProvider';
import { useRouter } from 'next/navigation';

export default function AdminOrders() {
  const { session } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!session?.token) {
      router.push('/auth/login');
      return;
    }
    fetchOrders();
  }, [session, filter]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/admin/orders${filter !== 'all' ? `?status=${filter}` : ''}`, {
        headers: {
          'Authorization': `Bearer ${session.token}`
        }
      });
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order =>
    order.content_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.order_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            onClick={fetchOrders}
            className="ml-2 text-red-600 hover:text-red-700 underline"
          >
            Try Again
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-sm font-medium text-gray-600 mb-1">Orders</h1>
          <p className="text-xs text-gray-500">View and manage all orders</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Search orders..."
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
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Order ID</th>
              <th className="px-4 py-3 text-left font-medium">Content</th>
              <th className="px-4 py-3 text-left font-medium">Customer</th>
              <th className="px-4 py-3 text-left font-medium">Amount</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600">{order.order_id}</td>
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium text-gray-700">{order.content_title}</div>
                    <div className="text-gray-500">{order.content_type}</div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{order.user_name}</td>
                <td className="px-4 py-3 text-gray-600">
                  ₹{parseFloat(order.amount).toLocaleString('en-IN')}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    order.status === 'paid' ? 'bg-green-100 text-green-800' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 