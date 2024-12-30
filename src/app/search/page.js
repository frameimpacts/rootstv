'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/content/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchResults();
    }
  }, [query]);

  if (!query) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black px-4 py-8 sm:px-6 md:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Search Results</h1>
        <p className="text-gray-400">Please enter a search term</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black px-4 py-8 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Search Results</h1>
        <p className="text-gray-400 mb-8">
          {loading ? 'Searching...' : `Found ${results.length} results for "${query}"`}
        </p>

        {loading ? (
          // Skeleton loading grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg overflow-hidden animate-pulse">
                <div className="aspect-video bg-gray-700"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {results.map((content) => (
              <Link 
                key={content.id} 
                href={`/content/${content.id}`}
                className="bg-gray-800/50 rounded-lg overflow-hidden group hover:bg-gray-800 transition-colors"
              >
                <div className="relative aspect-video">
                  <Image
                    src={content.thumbnail_url}
                    alt={content.title}
                    fill
                    className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 p-4">
                      <p className="text-xs text-gray-300">
                        {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h2 className="font-semibold mb-1 group-hover:text-red-500 transition-colors">
                    {content.title}
                  </h2>
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {content.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">No results found</h2>
            <p className="text-gray-400">
              Try searching with different keywords or browse our categories
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link 
                href="/movies"
                className="bg-gray-800 hover:bg-gray-700 px-6 py-2 rounded-lg transition-colors"
              >
                Browse Movies
              </Link>
              <Link 
                href="/shows"
                className="bg-gray-800 hover:bg-gray-700 px-6 py-2 rounded-lg transition-colors"
              >
                Browse TV Shows
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}