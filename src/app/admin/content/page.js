'use client';
import { useState, useEffect } from 'react';
import { useSession } from '@/components/SessionProvider';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ContentManagement() {
  const { session } = useSession();
  const router = useRouter();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (session?.token) {
      fetchContents();
    }
  }, [session, filter]);

  const fetchContents = async () => {
    try {
      const response = await fetch(`/api/admin/content${filter !== 'all' ? `?type=${filter}` : ''}`, {
        headers: { 'Authorization': `Bearer ${session.token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch contents');
      const data = await response.json();
      setContents(data);
    } catch (error) {
      setError('Failed to load contents');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (contentId) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      const response = await fetch(`/api/admin/content/${contentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.token}` }
      });

      if (!response.ok) throw new Error('Failed to delete content');
      
      await fetchContents(); // Refresh the list
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Failed to delete content');
    }
  };

  const filteredContents = contents.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filter === 'all' || content.type === filter;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-sm font-medium text-gray-600">Content Management</h1>
        <button 
          onClick={() => router.push('/admin/content/add')}
          className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-md font-medium hover:bg-red-100"
        >
          Add New Content
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Search content..."
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
          <option value="all">All Types</option>
          <option value="movie">Movies</option>
          <option value="show">TV Shows</option>
          <option value="short">Shorts</option>
        </select>
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Title</th>
              <th className="px-4 py-3 text-left font-medium">Type</th>
              <th className="px-4 py-3 text-left font-medium">Views</th>
              <th className="px-4 py-3 text-left font-medium">Rating</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredContents.map((content) => (
              <tr key={content.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 relative rounded overflow-hidden">
                      <Image
                        src={content.thumbnail_url}
                        alt={content.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">{content.title}</p>
                      <p className="text-gray-400">{content.release_year}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600 capitalize">{content.type}</td>
                <td className="px-4 py-3 text-gray-600">{content.views?.toLocaleString() || 0}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-600">
                      {Number(content.rating).toFixed(1)}
                    </span>
                    <span className="text-gray-400">
                      ({content.total_ratings})
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    content.status === 'featured' ? 'bg-red-100 text-red-800' :
                    content.status === 'trending' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {content.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => router.push(`/admin/content/edit/${content.id}`)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(content.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 