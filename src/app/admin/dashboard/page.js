'use client';
import { useState, useEffect } from 'react';
import { useSession } from '@/components/SessionProvider';
import Link from 'next/link';

export default function AdminDashboard() {
  const { session } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalShows: 0,
    totalUsers: 0,
    totalRevenue: 0
  });
  const [recentContent, setRecentContent] = useState([]);

  useEffect(() => {
    if (session?.token) {
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      // Fetch recent content
      const contentRes = await fetch('/api/admin/recent-content', {
        headers: {
          'Authorization': `Bearer ${session.token}`
        }
      });
      
      if (!contentRes.ok) {
        throw new Error('Failed to fetch recent content');
      }

      const contentData = await contentRes.json();
      setRecentContent(contentData);

      // You can add stats fetching here later
      setStats({
        totalMovies: contentData.filter(c => c.type === 'movie').length,
        totalShows: contentData.filter(c => c.type === 'show').length,
        totalUsers: 0, // To be implemented
        totalRevenue: 0 // To be implemented
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (contentId) => {
    if (!confirm('Are you sure you want to delete this content?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/content/${contentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete content');
      }

      // Refresh the content list
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to delete content:', error);
      alert('Failed to delete content');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm">Total Movies</h3>
          <p className="text-2xl font-bold">{stats.totalMovies}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm">Total Shows</h3>
          <p className="text-2xl font-bold">{stats.totalShows}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm">Total Users</h3>
          <p className="text-2xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm">Total Revenue</h3>
          <p className="text-2xl font-bold">₹{parseFloat(stats.totalRevenue).toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-8">
        <a
          href="/admin/content/add"
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
        >
          Add New Content
        </a>
        <a
          href="/admin/users"
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
        >
          Manage Users
        </a>
        <Link
          href="/admin/manage-featured"
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Manage Featured Content
        </Link>
      </div>

      {/* Recent Content */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Content</h2>
        {recentContent.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recentContent.map((content) => (
              <div key={content.id} className="bg-gray-900 rounded-lg overflow-hidden">
                <div className="relative aspect-video">
                  <img
                    src={content.thumbnail_url || '/placeholder.jpg'}
                    alt={content.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
                    {content.type}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2 truncate">{content.title}</h3>
                  <p className="text-gray-400 text-sm mb-2">
                    Added {new Date(content.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-lg font-bold mb-3">
                    ₹{parseFloat(content.price).toLocaleString('en-IN')}
                  </p>
                  <div className="flex justify-between">
                    <a
                      href={`/admin/content/edit/${content.id}`}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Edit
                    </a>
                    <button
                      onClick={() => handleDelete(content.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No content available</p>
        )}
      </div>
    </div>
  );
}