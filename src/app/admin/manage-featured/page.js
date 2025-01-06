'use client';
import { useState, useEffect } from 'react';
import { useSession } from '@/components/SessionProvider';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-xs text-red-600 p-4 rounded-lg">
          {error}
          <button 
            onClick={fetchContents}
            className="ml-2 text-red-600 hover:text-red-700 underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-sm font-medium text-gray-600 mb-1">Featured Content</h1>
          <p className="text-xs text-gray-500">Manage featured and trending content</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="grid divide-y divide-gray-200">
          {contents.map((content) => (
            <div key={content.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-12 h-12 relative rounded overflow-hidden">
                  <Image
                    src={content.thumbnail_url}
                    alt={content.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700">{content.title}</h3>
                  <p className="text-xs text-gray-500 capitalize">{content.type}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => updateContentStatus(content.id, 'featured')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                    content.status === 'featured' 
                      ? 'bg-red-50 text-red-600' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Featured
                </button>
                <button
                  onClick={() => updateContentStatus(content.id, 'trending')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                    content.status === 'trending' 
                      ? 'bg-red-50 text-red-600' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Trending
                </button>
                <button
                  onClick={() => updateContentStatus(content.id, 'normal')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                    content.status === 'normal' 
                      ? 'bg-red-50 text-red-600' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Normal
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 