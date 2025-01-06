'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function NewReleases() {
  const [newReleases, setNewReleases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNewReleases();
  }, []);

  const fetchNewReleases = async () => {
    try {
      const response = await fetch('/api/content/new-releases');
      const data = await response.json();
      setNewReleases(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch new releases:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050d1a]">
      {/* Hero Section */}
      <div className="relative w-full h-[30vh] sm:h-[40vh] overflow-hidden">
        {/* Gradient backgrounds */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050d1a]/60 via-transparent to-[#050d1a]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050d1a]/60 via-[#050d1a]/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050d1a] to-transparent" />
        
        <div className="absolute inset-0 flex items-center">
          <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-base sm:text-lg md:text-lg lg:text-xl xl:text-2xl font-bold mb-2 sm:mb-3 text-white tracking-tight">
                New Releases
              </h1>
              <p className="text-xs sm:text-sm text-white/90">
                The latest movies and shows added to our collection
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid Section */}
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-8 -mt-16 relative z-10">
        {loading ? (
          // Skeleton loading grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="group">
                <div className="relative aspect-video rounded-lg bg-gray-800/40 animate-pulse">
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                    <div className="h-5 bg-gray-700 rounded mb-2 w-3/4"></div>
                    <div className="h-4 bg-gray-700 rounded w-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {newReleases.map((content) => (
              <Link 
                key={content.id} 
                href={`/content/${content.id}`} 
                className="group"
              >
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <Image
                    src={content.thumbnail_url}
                    alt={content.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transform group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                    <div className="absolute bottom-0 p-4 sm:p-6">
                      <h3 className="text-sm sm:text-base font-semibold mb-2 text-white">
                        {content.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-white line-clamp-2">
                        {content.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 