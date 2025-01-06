'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState([]);
  const [relatedContent, setRelatedContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRelated, setLoadingRelated] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/content/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data);
        
        // After getting results, fetch related content based on first result's genre
        if (data.length > 0) {
          const firstResult = data[0];
          const genre = firstResult.genre;
          const response = await fetch(`/api/content?genre=${encodeURIComponent(genre)}&limit=12`);
          const relatedData = await response.json();
          // Filter out current search results
          const filteredRelated = relatedData.filter(item => 
            !data.some(result => result.id === item.id)
          );
          setRelatedContent(filteredRelated);
        }
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
        setLoadingRelated(false);
      }
    };

    if (query) {
      fetchResults();
    }
  }, [query]);

  // Remove the empty search state and start directly with the results view
  return (
    <div className="min-h-screen bg-[#050d1a]">
      {/* Header Section */}
      <div className="relative w-full h-[30vh] sm:h-[40vh] overflow-hidden">
        {/* Gradient backgrounds */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050d1a]/60 via-transparent to-[#050d1a]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050d1a]/60 via-[#050d1a]/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050d1a] to-transparent" />
        
        <div className="absolute inset-0 flex items-center">
          <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-base sm:text-lg md:text-lg lg:text-xl xl:text-2xl font-bold mb-2 sm:mb-3 text-white tracking-tight">
                Search Results
              </h1>
              <p className="text-xs sm:text-sm text-white/90">
                {loading ? 'Searching...' : `Found ${results.length} results for "${query}"`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Results Grid Section */}
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-8 -mt-16 relative z-10">
        {loading ? (
          // Skeleton loading grid
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex-none w-[120px] sm:w-[140px] md:w-[160px] lg:w-[180px]">
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800/40 animate-pulse" />
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
            {results.map((content) => (
              <Link 
                key={content.id} 
                href={`/content/${content.id}`}
                className="flex-none w-[120px] sm:w-[140px] md:w-[160px] lg:w-[180px] group"
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-900/40">
                  <Image
                    src={content.thumbnail_url}
                    alt={content.title}
                    fill
                    className="object-cover transform group-hover:scale-110 transition-transform duration-300"
                  />
                  {/* Quality badge */}
                  <div className="absolute top-2 right-2">
                    <span className="px-1.5 py-0.5 bg-[#3b5998]/80 backdrop-blur-sm rounded text-[10px] font-medium text-white">
                      HD
                    </span>
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3">
                      <h3 className="text-white text-xs sm:text-sm font-medium line-clamp-2 mb-1">
                        {content.title}
                      </h3>
                      <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-white/70">
                        <span className="capitalize">{content.type}</span>
                        {content.release_year && (
                          <>
                            <span>•</span>
                            <span>{content.release_year}</span>
                          </>
                        )}
                        {content.duration && (
                          <>
                            <span>•</span>
                            <span>{content.duration}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Title and metadata below image */}
                <div className="mt-1 sm:mt-2">
                  <h3 className="text-white text-xs sm:text-sm font-medium line-clamp-1 group-hover:text-[#3b5998] transition-colors">
                    {content.title}
                  </h3>
                  <div className="flex items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                    <span className="text-[10px] text-white/60 capitalize">
                      {content.type}
                    </span>
                    {content.release_year && (
                      <>
                        <span className="text-white/60">•</span>
                        <span className="text-[10px] text-white/60">
                          {content.release_year}
                        </span>
                      </>
                    )}
                    {content.duration && (
                      <>
                        <span className="text-white/60">•</span>
                        <span className="text-[10px] text-white/60">
                          {content.duration}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-white text-xl font-semibold mb-2">No results found</h2>
            <p className="text-white/60 mb-8">
              Try searching with different keywords or browse our categories
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/movies"
                className="bg-[#3b5998] hover:bg-[#3b5998]/80 px-6 py-2 rounded-full text-sm font-medium text-white transition-colors"
              >
                Browse Movies
              </Link>
              <Link 
                href="/shows"
                className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-full text-sm font-medium text-white transition-colors"
              >
                Browse TV Shows
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Related Content Section */}
      {!loading && results.length > 0 && (
        <section className="px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg text-white/90 font-medium">
              Related Content
            </h2>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
            {loadingRelated ? (
              // Skeleton loading for related content
              [...Array(6)].map((_, i) => (
                <div key={i} className="flex-none w-[120px] sm:w-[140px] md:w-[160px] lg:w-[180px]">
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800/40 animate-pulse" />
                </div>
              ))
            ) : (
              relatedContent.map((content) => (
                // Use the same card component as search results
                <Link 
                  key={content.id} 
                  href={`/content/${content.id}`}
                  className="flex-none w-[120px] sm:w-[140px] md:w-[160px] lg:w-[180px] group"
                >
                  {/* Card content remains the same as search results */}
                  {/* ... existing card JSX ... */}
                </Link>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}