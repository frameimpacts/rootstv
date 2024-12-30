'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const [featuredContents, setFeaturedContents] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingShows, setTrendingShows] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [loading, setLoading] = useState({
    featured: true,
    movies: true,
    shows: true,
    newReleases: true
  });

  useEffect(() => {
    fetchFeaturedContent();
    fetchTrendingMovies();
    fetchTrendingShows();
    fetchNewReleases();
  }, []);

  const fetchFeaturedContent = async () => {
    try {
      const response = await fetch('/api/content?status=featured');
      const data = await response.json();
      setFeaturedContents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch featured content:', error);
      setFeaturedContents([]);
    } finally {
      setLoading(prev => ({ ...prev, featured: false }));
    }
  };

  const fetchTrendingMovies = async () => {
    try {
      const response = await fetch('/api/content?type=movie&limit=10&random=true');
      const data = await response.json();
      setTrendingMovies(data);
    } catch (error) {
      console.error('Failed to fetch trending movies:', error);
    } finally {
      setLoading(prev => ({ ...prev, movies: false }));
    }
  };

  const fetchTrendingShows = async () => {
    try {
      const response = await fetch('/api/content?type=show&status=popular');
      const data = await response.json();
      setTrendingShows(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch trending shows:', error);
      setTrendingShows([]);
    } finally {
      setLoading(prev => ({ ...prev, shows: false }));
    }
  };

  const fetchNewReleases = async () => {
    try {
      const response = await fetch('/api/content/new-releases');
      const data = await response.json();
      setNewReleases(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch new releases:', error);
      setNewReleases([]);
    } finally {
      setLoading(prev => ({ ...prev, newReleases: false }));
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredContents.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredContents.length) % featuredContents.length);
  };

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    if (featuredContents.length <= 1) return;
    
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [featuredContents.length]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Hero Section */}
      <div className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] w-full">
        {loading.featured ? (
          <div className="absolute inset-0 bg-gray-800 animate-pulse">
            <div className="absolute bottom-0 left-0 p-4 sm:p-6 md:p-8 max-w-3xl">
              <div className="w-3/4 h-8 bg-gray-700 rounded mb-4"></div>
              <div className="w-full h-20 bg-gray-700 rounded mb-6"></div>
              <div className="flex gap-4">
                <div className="w-32 h-10 bg-gray-700 rounded-lg"></div>
                <div className="w-32 h-10 bg-gray-700 rounded-lg"></div>
              </div>
            </div>
          </div>
        ) : featuredContents.length > 0 ? (
          <>
            {featuredContents.map((content, index) => (
              <div
                key={content.id}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                <Image
                  src={content.thumbnail_url}
                  alt={content.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent">
                  <div className="absolute bottom-0 left-0 p-4 sm:p-6 lg:p-8 max-w-3xl">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 md:mb-4">{content.title}</h1>
                    <p className="text-sm sm:text-base md:text-lg mb-4 md:mb-6 text-gray-200">{content.description}</p>
                    <div className="flex gap-4">
                      <Link
                        href={`/content/${content.id}`}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg font-semibold inline-flex items-center transition-colors text-sm sm:text-base"
                      >
                        <svg 
                          className="w-5 h-5 mr-2" 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M4 4l12 6-12 6V4z"/>
                        </svg>
                        Watch Now
                      </Link>
                      <Link
                        href={`/content/${content.id}`}
                        className="bg-gray-800/80 hover:bg-gray-700 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base"
                      >
                        More Info
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Slider Controls */}
            {featuredContents.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/75 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/75 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                  {featuredContents.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentSlide ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : null}
      </div>

      {/* Trending Movies Section */}
      {(loading.movies || trendingMovies.length > 0) && (
        <section className="px-4 sm:px-6 md:px-8 py-8 sm:py-12">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold">Trending Movies</h2>
            <Link href="/movies" className="text-red-500 hover:text-red-400 text-sm font-semibold">
              View All
            </Link>
          </div>
          <div className="relative">
            <div className="flex space-x-3 sm:space-x-4 overflow-x-auto pb-4 scrollbar-hide">
              {loading.movies ? (
                // Skeleton loaders for movies
                [...Array(5)].map((_, i) => (
                  <div key={i} className="flex-none w-[180px] sm:w-[220px] md:w-[260px] lg:w-[280px]">
                    <div className="relative aspect-[16/9] rounded-lg bg-gray-800 animate-pulse"></div>
                  </div>
                ))
              ) : (
                trendingMovies.map((movie) => (
                  <Link key={movie.id} href={`/content/${movie.id}`} className="flex-none w-[180px] sm:w-[220px] md:w-[260px] lg:w-[280px] group">
                    <div className="relative aspect-[16/9] rounded-lg overflow-hidden">
                      <Image
                        src={movie.thumbnail_url}
                        alt={movie.title}
                        fill
                        className="object-cover transform group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 p-3 sm:p-4">
                          <h3 className="font-semibold text-sm">{movie.title}</h3>
                          <p className="text-xs text-gray-300">{movie.release_year}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* Popular TV Shows Section */}
      {(loading.shows || trendingShows.length > 0) && (
        <section className="px-4 sm:px-6 md:px-8 py-8 sm:py-12 bg-gray-900/50">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold">Popular TV Shows</h2>
            <Link href="/shows" className="text-red-500 hover:text-red-400 text-sm font-semibold">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
            {loading.shows ? (
              // Skeleton loaders for shows
              [...Array(12)].map((_, i) => (
                <div key={i} className="group">
                  <div className="relative aspect-[2/3] rounded-lg bg-gray-800 animate-pulse">
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                      <div className="h-4 bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              trendingShows.map((show) => (
                <Link key={show.id} href={`/content/${show.id}`} className="group">
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                    <Image
                      src={show.thumbnail_url}
                      alt={show.title}
                      fill
                      className="object-cover transform group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 p-3 sm:p-4">
                        <h3 className="font-semibold text-sm sm:text-base line-clamp-2">{show.title}</h3>
                        <p className="text-xs sm:text-sm text-gray-300">{show.release_year}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      )}

      {/* New Releases Section */}
      {(loading.newReleases || newReleases.length > 0) && (
        <section className="px-4 sm:px-6 md:px-8 py-8 sm:py-12">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold">New Releases</h2>
            <Link href="/new-releases" className="text-red-500 hover:text-red-400 text-sm font-semibold">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {loading.newReleases ? (
              // Skeleton loaders for new releases
              [...Array(6)].map((_, i) => (
                <div key={i} className="group">
                  <div className="relative aspect-video rounded-lg bg-gray-800 animate-pulse">
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                      <div className="h-5 bg-gray-700 rounded mb-2 w-3/4"></div>
                      <div className="h-4 bg-gray-700 rounded w-full"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              newReleases.map((content) => (
                <Link key={content.id} href={`/content/${content.id}`} className="group">
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <Image
                      src={content.thumbnail_url}
                      alt={content.title}
                      fill
                      className="object-cover transform group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                      <div className="absolute bottom-0 p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-semibold mb-2">{content.title}</h3>
                        <p className="text-xs sm:text-sm text-gray-300 line-clamp-2">{content.description}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      )}
    </main>
  );
}


// INSERT INTO users (name, email, password, role) 
// VALUES ('Admin User', 'admin@example.com', '$2a$10$ABF8D1qR4axqxOEh6./Vw.Izcym1wFjPFtf.6uG0b.hVhdawJmOhO', 'admin');