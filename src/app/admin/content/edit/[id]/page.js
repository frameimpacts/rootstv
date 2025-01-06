'use client';
import { useState, useEffect } from 'react';
import { useSession } from '@/components/SessionProvider';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import VideoPlayer from '@/components/VideoPlayer';
import { GENRES } from '@/lib/constants';

const DirectorSelect = ({ selectedDirectors, directors, onChange }) => {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {directors.map(director => (
          <button
            key={director.id}
            type="button"
            onClick={() => {
              const isSelected = selectedDirectors.includes(director.id);
              if (isSelected) {
                onChange(selectedDirectors.filter(id => id !== director.id));
              } else {
                onChange([...selectedDirectors, director.id]);
              }
            }}
            className={`text-xs px-3 py-1.5 rounded-full border ${
              selectedDirectors.includes(director.id)
                ? 'bg-red-50 text-red-600 border-red-200'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
            }`}
          >
            {director.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default function EditContent() {
  const params = useParams();
  const router = useRouter();
  const contentId = params.id;
  const { session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadProgress, setUploadProgress] = useState({ thumbnail: 0, video: 0 });
  const [selectedDirectors, setSelectedDirectors] = useState([]);
  const [directors, setDirectors] = useState([]);
  const [actors, setActors] = useState([]);
  const [castMembers, setCastMembers] = useState([]);
  
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
    duration: '',
    rental_duration: '',
    status: 'normal',
    subscription_type: 'basic',
    featured_order: '0'
  });

  useEffect(() => {
    if (contentId && session?.token) {
      fetchContent();
    }
  }, [contentId, session]);

  const fetchContent = async () => {
    try {
      const response = await fetch(`/api/admin/content/${contentId}`, {
        headers: {
          'Authorization': `Bearer ${session?.token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch content');
      
      const content = await response.json();
      setFormData({
        ...content,
        featured_order: content.featured_order?.toString() || '0',
        title: content.title || '',
        description: content.description || '',
        type: content.type || 'movie',
        price: content.price || '',
        thumbnail_url: content.thumbnail_url || '',
        content_url: content.content_url || '',
        trailer_url: content.trailer_url || '',
        genre: content.genre || '',
        release_year: content.release_year || new Date().getFullYear(),
        duration: content.duration || '',
        rental_duration: content.rental_duration || '',
        status: content.status || 'normal',
        subscription_type: content.subscription_type || 'basic'
      });
    } catch (error) {
      setError('Failed to fetch content');
    } finally {
      setLoading(false);
    }
  };

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
    
    try {
      const dataToSend = {
        ...formData,
        directors: selectedDirectors,
        cast: castMembers,
        featured_order: formData.status === 'featured' ? parseInt(formData.featured_order, 10) : 0
      };

      const response = await fetch(`/api/admin/content/${contentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.token}`
        },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update content');
      }

      setSuccess('Content updated successfully!');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUrlPaste = async (e, type = 'content') => {
    const url = e.target.value;
    
    // Handle YouTube iframe
    if (url.includes('<iframe') && url.includes('youtube.com/embed/')) {
      setFormData(prev => ({
        ...prev,
        [type === 'content' ? 'content_url' : 'trailer_url']: url
      }));
      return;
    }

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
    // Handle any other iframe paste
    else if (url.includes('<iframe')) {
      setFormData(prev => ({
        ...prev,
        [type === 'content' ? 'content_url' : 'trailer_url']: url
      }));
    }
  };

  const handleCastChange = (index, field, value) => {
    const newCastMembers = [...castMembers];
    newCastMembers[index][field] = value;
    setCastMembers(newCastMembers);
  };

  const removeCastMember = (index) => {
    setCastMembers(castMembers.filter((_, i) => i !== index));
  };

  const addCastMember = () => {
    setCastMembers([...castMembers, { personId: '', characterName: '' }]);
  };

  useEffect(() => {
    if (session?.token) {
      fetchPeople();
    }
  }, [session]);

  const fetchPeople = async () => {
    try {
      const response = await fetch('/api/admin/people', {
        headers: {
          'Authorization': `Bearer ${session.token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch people');
      const people = await response.json();
      
      setDirectors(people.filter(p => p.role_type === 'director' || p.role_type === 'both'));
      setActors(people.filter(p => p.role_type === 'actor' || p.role_type === 'both'));
    } catch (error) {
      console.error('Failed to fetch people:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-sm font-medium text-gray-600 mb-1">Edit Content</h1>
          <p className="text-xs text-gray-500">Update content details</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-xs text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-xs text-green-600 p-4 rounded-lg mb-6 flex justify-between items-center">
          <span>{success}</span>
          <button
            onClick={() => router.push('/admin/content')}
            className="text-xs px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Go Back to List
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-gray-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-gray-600"
            >
              <option value="movie">Movie</option>
              <option value="show">TV Show</option>
              <option value="short">Short Film</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Price (₹)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-gray-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Genres
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
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
                    className="form-checkbox text-red-500 rounded border-gray-300 focus:ring-red-500"
                  />
                  <span className="text-xs text-gray-600">
                    {genre.charAt(0).toUpperCase() + genre.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Release Year
            </label>
            <input
              type="number"
              value={formData.release_year}
              onChange={(e) => setFormData({...formData, release_year: e.target.value})}
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-gray-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({...formData, duration: e.target.value})}
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-gray-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Rental Duration (days)
            </label>
            <input
              type="number"
              value={formData.rental_duration}
              onChange={(e) => setFormData({...formData, rental_duration: e.target.value})}
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-gray-600"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-gray-600"
            >
              <option value="normal">Normal</option>
              <option value="trending">Trending</option>
              <option value="featured">Featured</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Subscription Type
            </label>
            <select
              value={formData.subscription_type}
              onChange={(e) => setFormData({...formData, subscription_type: e.target.value})}
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-gray-600"
            >
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
            </select>
          </div>

          {formData.status === 'featured' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Featured Order
              </label>
              <input
                type="number"
                value={formData.featured_order}
                onChange={(e) => setFormData({...formData, featured_order: e.target.value})}
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-gray-600"
                min="0"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows="4"
            className="w-full text-xs bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-gray-600"
            required
          />
        </div>

        {/* File Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
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
                className="block w-full px-3 py-2 text-xs bg-gray-50 text-gray-600 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-100"
              >
                Choose New Thumbnail
              </label>
              {uploadProgress.thumbnail > 0 && (
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-red-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress.thumbnail}%` }}
                  ></div>
                </div>
              )}
              {formData.thumbnail_url && (
                <div className="relative aspect-video w-full">
                  <Image
                    src={formData.thumbnail_url}
                    alt="Thumbnail preview"
                    fill
                    className="rounded-md object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Video Content
            </label>
            <div className="space-y-2">
              {formData.content_url && (
                <div className="relative aspect-video w-full mb-2">
                  <VideoPlayer 
                    url={formData.content_url}
                    isPurchased={true}
                    isAdmin={true}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, content_url: ''})}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleFileUpload(e, 'video')}
                className="hidden"
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                className="block w-full px-3 py-2 text-xs bg-gray-50 text-gray-600 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-100"
              >
                Choose New Video
              </label>
              
              <p className="text-xs text-gray-500 mt-2">Or provide video URL:</p>
              <input
                type="text"
                placeholder="Video URL or iframe embed code"
                value={formData.content_url}
                onChange={(e) => {
                  setFormData({...formData, content_url: e.target.value});
                  handleVideoUrlPaste(e, 'content');
                }}
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-gray-600"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Trailer URL
          </label>
          <div className="space-y-2">
            {formData.trailer_url && (
              <div className="relative aspect-video w-full mb-2">
                <VideoPlayer 
                  url={formData.trailer_url}
                  isPurchased={true}
                  isAdmin={true}
                />
                <button
                  type="button"
                  onClick={() => setFormData({...formData, trailer_url: ''})}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <input
              type="text"
              placeholder="Trailer URL or iframe embed code"
              value={formData.trailer_url || ''}
              onChange={(e) => {
                setFormData({...formData, trailer_url: e.target.value});
                handleVideoUrlPaste(e, 'trailer');
              }}
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-gray-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">
            Directors
          </label>
          <DirectorSelect
            selectedDirectors={selectedDirectors}
            directors={directors}
            onChange={setSelectedDirectors}
          />
          {selectedDirectors.length > 0 && (
            <p className="mt-2 text-xs text-gray-500">
              {selectedDirectors.length} director{selectedDirectors.length !== 1 ? 's' : ''} selected
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Cast Members
          </label>
          <div className="space-y-2">
            {castMembers.map((cast, index) => (
              <div key={index} className="flex gap-2">
                <select
                  value={cast.personId}
                  onChange={(e) => handleCastChange(index, 'personId', e.target.value)}
                  className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-gray-600"
                >
                  <option value="">Select Actor</option>
                  {actors.map(actor => (
                    <option key={actor.id} value={actor.id}>
                      {actor.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Character Name"
                  value={cast.characterName}
                  onChange={(e) => handleCastChange(index, 'characterName', e.target.value)}
                  className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-gray-600"
                />
                <button
                  type="button"
                  onClick={() => removeCastMember(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addCastMember}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Add Cast Member
            </button>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.push('/admin/content')}
            className="text-xs px-3 py-2 border border-gray-200 text-gray-600 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="text-xs px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Content'}
          </button>
        </div>
      </form>
    </div>
  );
} 