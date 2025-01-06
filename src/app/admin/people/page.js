'use client';
import { useState, useEffect } from 'react';
import { useSession } from '@/components/SessionProvider';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function PeopleManagement() {
  const { session } = useSession();
  const router = useRouter();
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role_type: 'actor',
    profile_image: '',
    bio: '',
    birth_date: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchPeople();
  }, []);

  const fetchPeople = async () => {
    try {
      const response = await fetch('/api/admin/people', {
        headers: {
          'Authorization': `Bearer ${session.token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch people');
      const data = await response.json();
      setPeople(data);
    } catch (error) {
      console.error('Failed to fetch people:', error);
      setError('Failed to load people');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to upload image');
      const data = await response.json();
      return data.imageUrl; // Returns the path to the saved image
    } catch (error) {
      console.error('Failed to upload image:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = formData.profile_image;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const response = await fetch('/api/admin/people', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`
        },
        body: JSON.stringify({
          ...formData,
          profile_image: imageUrl
        })
      });

      if (!response.ok) throw new Error('Failed to add person');
      
      await fetchPeople();
      setShowAddModal(false);
      setFormData({
        name: '',
        role_type: 'actor',
        profile_image: '',
        bio: '',
        birth_date: ''
      });
      setImageFile(null);
      setImagePreview('');
    } catch (error) {
      setError('Failed to add person');
    }
  };

  const filteredPeople = people.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || person.role_type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-sm font-medium text-gray-600">Cast & Crew Management</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-md font-medium hover:bg-red-100"
        >
          Add New Person
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Search people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-600"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-600"
        >
          <option value="all">All Roles</option>
          <option value="actor">Actors</option>
          <option value="director">Directors</option>
          <option value="both">Both</option>
        </select>
      </div>

      {/* People Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {filteredPeople.map((person) => (
          <div key={person.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="aspect-[3/4] relative h-32">
              <Image
                src={person.profile_image || '/placeholder-person.jpg'}
                alt={person.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-2">
              <h3 className="font-medium text-xs text-gray-900 truncate">{person.name}</h3>
              <p className="text-[11px] text-gray-500 capitalize">{person.role_type}</p>
              <p className="text-[11px] text-gray-400">
                {new Date(person.birth_date).toLocaleDateString()}
              </p>
              <div className="mt-2 flex gap-2">
                <button 
                  onClick={() => router.push(`/admin/people/edit/${person.id}`)}
                  className="text-[11px] text-blue-600 hover:text-blue-700"
                >
                  Edit
                </button>
                <button 
                  className="text-[11px] text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Person Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Person</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role_type}
                  onChange={(e) => setFormData({...formData, role_type: e.target.value})}
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="actor">Actor</option>
                  <option value="director">Director</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Image
                </label>
                <div className="space-y-2">
                  {(imagePreview || formData.profile_image) && (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                      <Image
                        src={imagePreview || formData.profile_image}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Birth Date
                </label>
                <input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-sm bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  Add Person
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 