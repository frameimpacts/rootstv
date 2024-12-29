'use client';
import { useState, useEffect } from 'react';
import { useSession } from '@/components/SessionProvider';
import { useRouter } from 'next/navigation';

export default function ManageFeatured() {
  const { session } = useSession();
  const router = useRouter();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!session?.token) {
      router.push('/auth/login');
      return;
    }
    fetchContents();
  }, [session]);

  const fetchContents = async () => {
    try {
      const response = await fetch('/api/content', {
        headers: {
          'Authorization': `Bearer ${session.token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch contents');
      
      const data = await response.json();
      setContents(data);
    } catch (error) {
      console.error('Failed to fetch contents:', error);
      setError('Failed to load contents');
    } finally {
      setLoading(false);
    }
  };

  const updateContentStatus = async (contentId, status) => {
    try {
      const response = await fetch(`/api/admin/content/${contentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update content status');
      }

      // Refresh the content list
      await fetchContents();
      
      // Show success message
      alert('Content status updated successfully');
    } catch (error) {
      console.error('Error updating content status:', error);
      alert(error.message || 'Failed to update content status');
    }
  };

  if (!session) {
    return <div>Please log in to access this page.</div>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={fetchContents}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Manage Featured Content</h1>
      
      <div className="grid gap-6">
        {contents.map((content) => (
          <div key={content.id} className="bg-gray-800 p-6 rounded-lg flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">{content.title}</h3>
              <p className="text-gray-400 text-sm">{content.type}</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => updateContentStatus(content.id, 'featured')}
                className={`px-4 py-2 rounded ${
                  content.status === 'featured' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                Featured
              </button>
              <button
                onClick={() => updateContentStatus(content.id, 'trending')}
                className={`px-4 py-2 rounded ${
                  content.status === 'trending' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                Trending
              </button>
              <button
                onClick={() => updateContentStatus(content.id, 'normal')}
                className={`px-4 py-2 rounded ${
                  content.status === 'normal' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                Normal
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 