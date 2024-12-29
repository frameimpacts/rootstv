'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ContentForm({ initialData = null }) {
  const router = useRouter();
  const [formData, setFormData] = useState(initialData || {
    title: '',
    description: '',
    type: 'movie',
    price: '',
    thumbnail_url: '',
    content_url: '',
    genre: '',
    duration: '',
    release_year: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = initialData 
        ? `/api/admin/content/${initialData.id}`
        : '/api/admin/content';
      
      const method = initialData ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save content');
      }

      router.push('/admin/dashboard');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {error && (
        <div className="bg-red-500 text-white p-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows="4"
          className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Type</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({...formData, type: e.target.value})}
          className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
          required
        >
          <option value="movie">Movie</option>
          <option value="show">TV Show</option>
          <option value="short">Short Film</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Price ($)</label>
        <input
          type="number"
          step="0.01"
          value={formData.price}
          onChange={(e) => setFormData({...formData, price: e.target.value})}
          className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Thumbnail URL</label>
        <input
          type="url"
          value={formData.thumbnail_url}
          onChange={(e) => setFormData({...formData, thumbnail_url: e.target.value})}
          className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Content URL</label>
        <input
          type="url"
          value={formData.content_url}
          onChange={(e) => setFormData({...formData, content_url: e.target.value})}
          className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
          required
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : (initialData ? 'Update' : 'Add Content')}
        </button>
      </div>
    </form>
  );
}