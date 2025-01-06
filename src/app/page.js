'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import VideoPlayer from '@/components/VideoPlayer';

export default function Home() {
  const [featuredContents, setFeaturedContents] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingShows, setTrendingShows] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [isTrailerPlaying, setIsTrailerPlaying] = useState(false);
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
      setTrendingMovies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch trending movies:', error);
      setTrendingMovies([]);
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
    <main className="min-h-screen bg-[#050d1a]">
      {/* Hero Section */}
      <div className="relative w-full h-[55vh] sm:h-[80vh] lg:h-[90vh] xl:h-[95vh] overflow-hidden">
        {featuredContents.map((content, index) => (
          <div
            key={content.id}
            className={`absolute inset-0 transition-all duration-700 ${
              index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
          >
            {/* Background Image */}
            <Image
              src={content.thumbnail_url}
              alt={content.title}
              fill
              sizes="100vw"
              className="object-cover object-center transform hover:scale-105 transition-transform duration-[3s]"
              priority={index === currentSlide}
            />
            
            {/* Updated gradient overlays to match the dark blue theme */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#050d1a]/60 via-transparent to-[#050d1a]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050d1a]/60 via-[#050d1a]/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050d1a] to-transparent" />

            {/* Content Container - Responsive positioning */}
            <div className="absolute inset-0 flex items-center translate-y-12 sm:translate-y-16 md:translate-y-20 lg:translate-y-24">
              <div className="w-full h-full relative flex items-center">
                {/* Left Side - Content Details */}
                <div className={`pl-6 sm:pl-12 md:pl-14 lg:pl-16 transition-all duration-500 ${
                  isTrailerPlaying ? 'w-[60%]' : 'w-full'
                }`}>
                  {/* Content Type & Metadata */}
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="bg-[#3b5998] px-3 py-1 text-xs font-semibold rounded-md uppercase tracking-wide text-white">
                      {content.type}
                    </span>
                    {content.genre && (
                      <span className="text-white/80 text-xs">
                        {content.genre}
                      </span>
                    )}
                    {content.release_year && (
                      <>
                        <span className="text-white/60">•</span>
                        <span className="text-white/80 text-xs">
                          {content.release_year}
                        </span>
                      </>
                    )}
                  </div>
                  
                  {/* Title - Reduced size */}
                  <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold mb-2 sm:mb-3 text-white tracking-tight">
                    {content.title}
                  </h1>
                  
                  {/* Description - Reduced size */}
                  <p className="text-xs sm:text-sm md:text-base text-white/90 mb-6 sm:mb-8 line-clamp-3 max-w-2xl">
                    {content.description}
                  </p>
                  
                  {/* Action Buttons - More rounded and smaller on mobile */}
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <Link
                      href={`/content/${content.id}`}
                      className="bg-transparent border-2 border-[#3b5998] text-[#3b5998] hover:bg-[#3b5998] hover:text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium inline-flex items-center transition-all duration-300 hover:scale-105"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4l12 6-12 6V4z"/>
                      </svg>
                      Watch Now
                    </Link>
                    {content.trailer_url && (
                      <button
                        onClick={() => setIsTrailerPlaying(!isTrailerPlaying)}
                        className="bg-white/10 hover:bg-white/20 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium backdrop-blur-sm transition-all duration-300 hover:scale-105 inline-flex items-center"
                      >
                        {isTrailerPlaying ? (
                          <>
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Close Trailer
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Watch Trailer
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Duration - Added margin top */}
                  {content.duration && (
                    <div className="flex items-center text-white/80 text-[10px] sm:text-xs">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {content.duration}
                    </div>
                  )}
                </div>

                {/* Right Side - Trailer Video */}
                {isTrailerPlaying && (
                  <div className={`fixed inset-0 z-50 bg-black sm:relative sm:w-[40%] sm:bg-transparent ${
                    isTrailerPlaying ? 'flex items-center justify-center' : 'hidden'
                  }`}>
                    {/* Dark overlay for mobile */}
                    <div className="absolute inset-0 bg-black/90 sm:hidden" />
                    
                    {/* Video Container */}
                    <div className="relative w-full h-full sm:h-auto">
                      <div className="absolute inset-0 flex items-center">
                        <VideoPlayer
                          url={content.trailer_url}
                          playing={isTrailerPlaying}
                          controls={true}
                          isTrailer={true}
                          width="100%"
                          height="100%"
                          style={{ aspectRatio: '16/9' }}
                          className="w-full h-auto"
                        />
                      </div>
                      
                      {/* Close Button - Repositioned for mobile */}
                      <button
                        onClick={() => setIsTrailerPlaying(false)}
                        className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors sm:top-2 sm:right-2"
                      >
                        <svg className="w-6 h-6 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Slide Indicators - Updated size for mobile */}
        <div className="absolute bottom-20 sm:bottom-24 left-1/2 transform -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 z-20">
          {featuredContents.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-300 ${
                index === currentSlide
                  ? 'w-6 sm:w-8 h-1 sm:h-1.5 bg-white rounded-full'
                  : 'w-1 sm:w-1.5 h-1 sm:h-1.5 bg-white/50 hover:bg-white/80 rounded-full'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Trending Movies Section */}
      <section className="bg-[#050d1a]/40 backdrop-blur-sm -mt-16">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 pt-2">
          {/* Trending Header - Responsive */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-3 sm:gap-6">
              <h2 className="text-base sm:text-lg text-white/90 font-medium">Trending</h2>
              <div className="flex items-center bg-black/20 rounded-full p-0.5 sm:p-1">
                <button className="px-3 sm:px-4 py-1 rounded-full bg-[#3b5998] text-white text-xs sm:text-sm">
                  Movies
                </button>
                <button className="px-3 sm:px-4 py-1 rounded-full text-gray-400 hover:text-white text-xs sm:text-sm">
                  TV Shows
                </button>
              </div>
            </div>
            <Link 
              href="/movies" 
              className="text-xs sm:text-sm text-[#3b5998] hover:text-[#8b9dc3] font-medium transition-colors"
            >
              View All
            </Link>
          </div>

          {/* Movie Cards - Responsive grid */}
          <div className="relative">
            <div className="flex space-x-2 sm:space-x-3 md:space-x-4 overflow-x-auto pb-4 scrollbar-hide">
              {loading.movies ? (
                // Skeleton loaders
                [...Array(8)].map((_, i) => (
                  <div key={i} className="flex-none w-[120px] sm:w-[140px] md:w-[160px] lg:w-[180px]">
                    <div className="aspect-[2/3] rounded-lg bg-gray-800/40 animate-pulse"></div>
                  </div>
                ))
              ) : (
                trendingMovies.map((movie) => (
                  <Link 
                    key={movie.id} 
                    href={`/content/${movie.id}`} 
                    className="flex-none w-[120px] sm:w-[140px] md:w-[160px] lg:w-[180px] group"
                  >
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-900/40">
                      <img
                        src={movie.thumbnail_url}
                        alt={movie.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
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
                            {movie.title}
                          </h3>
                          <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-white/70">
                            <span>{movie.release_year}</span>
                            {movie.duration && (
                              <>
                                <span>•</span>
                                <span>{movie.duration}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Title and metadata below image */}
                    <div className="mt-1 sm:mt-2">
                      <h3 className="text-xs sm:text-sm text-white/90 font-medium line-clamp-1 group-hover:text-[#8b9dc3] transition-colors">
                        {movie.title}
                      </h3>
                      <div className="flex items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                        <span className="text-[10px] text-white/50">
                          {movie.release_year}
                        </span>
                        <span className="text-[10px] text-white/50">
                          {movie.duration}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Popular TV Shows Section */}
      <section className="px-4 sm:px-6 md:px-8 py-8 sm:py-12 bg-[#050d1a]/60">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-white">Popular TV Shows</h2>
          <Link href="/shows" className="text-xs sm:text-sm text-[#3b5998] hover:text-[#8b9dc3] font-medium">
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
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    className="object-cover transform group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 p-3 sm:p-4">
                      <h3 className="font-semibold text-xs sm:text-sm text-white line-clamp-2">{show.title}</h3>
                      <p className="text-xs text-white">{show.release_year}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* New Releases Section */}
      <section className="px-4 sm:px-6 md:px-8 py-8 sm:py-12 bg-[#050d1a]/40">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-white">New Releases</h2>
          <Link href="/new-releases" className="text-xs sm:text-sm text-[#3b5998] hover:text-[#8b9dc3] font-medium">
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
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transform group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                    <div className="absolute bottom-0 p-4 sm:p-6">
                      <h3 className="text-sm sm:text-base font-semibold mb-2 text-white">{content.title}</h3>
                      <p className="text-xs sm:text-sm text-white line-clamp-2">{content.description}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </main>
  );
}


// INSERT INTO users (name, email, password, role) 
// VALUES ('Admin User', 'admin@example.com', '$2a$10$ABF8D1qR4axqxOEh6./Vw.Izcym1wFjPFtf.6uG0b.hVhdawJmOhO', 'admin');