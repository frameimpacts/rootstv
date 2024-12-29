'use client';
import { useState } from 'react';
import { useSession } from '@/components/SessionProvider';
import { getVimeoEmbedUrl } from '@/lib/vimeoHelper';
import VideoPlayer from '@/components/VideoPlayer';
import { GENRES } from '@/lib/constants';

export default function AddContent() {
  const { session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadProgress, setUploadProgress] = useState({ thumbnail: 0, video: 0 });
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'movie',
    price: '',
    thumbnail_url: '',
    content_url: '',
    trailer_url: '',
    genre: '',
    release_year: new Date().getFullYear(),
    duration: ''
  });

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      setUploadProgress(prev => ({ ...prev, [type]: 1 }));
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        [type === 'thumbnail' ? 'thumbnail_url' : 'content_url']: data.url
      }));
      setUploadProgress(prev => ({ ...prev, [type]: 100 }));
    } catch (error) {
      console.error('Upload error:', error);
      setError(`Failed to upload ${type}`);
      setUploadProgress(prev => ({ ...prev, [type]: 0 }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Validate content URL
    if (formData.content_url && !formData.content_url.match(/^(https?:\/\/|<iframe)/)) {
      setError('Invalid video URL or embed code');
      return;
    }
    
    try {
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add content');
      }

      setSuccess('Content added successfully!');
      setFormData({
        title: '',
        description: '',
        type: 'movie',
        price: '',
        thumbnail_url: '',
        content_url: '',
        trailer_url: '', // Add this line
        genre: '',
        release_year: new Date().getFullYear(),
        duration: ''
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUrlPaste = async (e, type = 'content') => {
    const url = e.target.value;
    
    // Handle Vimeo URLs
    if (url.includes('vimeo.com')) {
      try {
        const vimeoData = await getVimeoEmbedUrl(url);
        if (vimeoData.valid) {
          setFormData(prev => ({
            ...prev,
            [type === 'content' ? 'content_url' : 'trailer_url']: vimeoData.embedUrl,
            ...(type === 'content' && { duration: vimeoData.duration })
          }));
        }
      } catch (error) {
        console.error('Failed to validate Vimeo URL:', error);
      }
    }
    // Handle iframe paste
    else if (url.includes('<iframe')) {
      setFormData(prev => ({
        ...prev,
        [type === 'content' ? 'content_url' : 'trailer_url']: url
      }));
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Add New Content</h1>

      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500 text-white p-4 rounded-lg mb-6">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="movie">Movie</option>
              <option value="show">TV Show</option>
              <option value="short">Short Film</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Price (₹)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Genres
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4 bg-gray-800 border border-gray-700 rounded-lg">
              {GENRES.map(genre => (
                <label key={genre} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={genre}
                    checked={formData.genre.split(',').includes(genre)}
                    onChange={(e) => {
                      const currentGenres = formData.genre ? formData.genre.split(',').filter(Boolean) : [];
                      const updatedGenres = e.target.checked
                        ? [...currentGenres, genre]
                        : currentGenres.filter(g => g !== genre);
                      setFormData({...formData, genre: updatedGenres.join(',')});
                    }}
                    className="form-checkbox text-red-500 rounded border-gray-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-300">
                    {genre.charAt(0).toUpperCase() + genre.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Release Year
            </label>
            <input
              type="number"
              value={formData.release_year}
              onChange={(e) => setFormData({...formData, release_year: e.target.value})}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({...formData, duration: e.target.value})}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows="4"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Thumbnail
            </label>
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'thumbnail')}
                className="hidden"
                id="thumbnail-upload"
              />
              <label
                htmlFor="thumbnail-upload"
                className="block w-full px-4 py-2 bg-gray-700 text-white rounded-lg cursor-pointer hover:bg-gray-600"
              >
                Choose Thumbnail
              </label>
              {uploadProgress.thumbnail > 0 && (
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-red-600 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress.thumbnail}%` }}
                  ></div>
                </div>
              )}
              {formData.thumbnail_url && (
                <img
                  src={formData.thumbnail_url}
                  alt="Thumbnail preview"
                  className="w-full h-40 object-cover rounded-lg"
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Video Content
            </label>
            <div className="space-y-2">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleFileUpload(e, 'video')}
                className="hidden"
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                className="block w-full px-4 py-2 bg-gray-700 text-white rounded-lg cursor-pointer hover:bg-gray-600"
              >
                Choose Video
              </label>
              {uploadProgress.video > 0 && (
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-red-600 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress.video}%` }}
                  ></div>
                </div>
              )}
              {formData.content_url && (
                <div className="relative aspect-video w-full mb-4">
                  <VideoPlayer 
                    url={formData.content_url}
                    isPurchased={true}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, content_url: ''})}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <svg 
                      className="w-4 h-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="col-span-2">
            <p className="text-sm text-gray-400">
              Or provide URLs directly:
            </p>
            <input
              type="url"
              placeholder="Thumbnail URL"
              value={formData.thumbnail_url}
              onChange={(e) => setFormData({...formData, thumbnail_url: e.target.value})}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 mt-2"
            />
            <input
              type="text"
              placeholder="Video URL (Direct upload, YouTube, Vimeo) or iframe embed code"
              value={formData.content_url}
              onChange={(e) => {
                setFormData({...formData, content_url: e.target.value});
                handleVideoUrlPaste(e, 'content');
              }}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 mt-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Trailer URL
          </label>
          <div className="space-y-2">
            {formData.trailer_url && (
              <div className="relative aspect-video w-full mb-4">
                <VideoPlayer 
                  url={formData.trailer_url}
                  isPurchased={true}
                />
                <button
                  type="button"
                  onClick={() => setFormData({...formData, trailer_url: ''})}
                  className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <input
              type="text"
              placeholder="Trailer URL (YouTube, Vimeo) or iframe embed code"
              value={formData.trailer_url || ''}
              onChange={(e) => {
                setFormData({...formData, trailer_url: e.target.value});
                handleVideoUrlPaste(e, 'trailer');
              }}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Content'}
          </button>
        </div>
      </form>
    </div>
  );
}