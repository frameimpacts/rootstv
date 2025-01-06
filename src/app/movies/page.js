'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { GENRES } from '@/lib/constants';

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [isTrailerPlaying, setIsTrailerPlaying] = useState(false);

  const genres = ['all', ...GENRES];

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await fetch('/api/content?type=movie');
      const data = await response.json();
      setMovies(data);
      setFeaturedMovie(data[0]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching movies:', error);
      setLoading(false);
    }
  };

  const filteredMovies = selectedGenre === 'all' 
    ? movies 
    : movies.filter(movie => movie.genre.split(',').map(g => g.toLowerCase().trim()).includes(selectedGenre));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3b5998]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050d1a]">
      {/* Hero Section - Adjusted height for mobile */}
      {featuredMovie && (
        <div className="relative w-full h-[55vh] sm:h-[80vh] lg:h-[90vh] xl:h-[95vh] overflow-hidden">
          {/* Background Image */}
          <Image
            src={featuredMovie.thumbnail_url}
            alt={featuredMovie.title}
            fill
            className="object-cover object-center transform hover:scale-105 transition-transform duration-[3s]"
            priority
            sizes="100vw"
          />
          
          {/* Enhanced Gradient Overlays - Matching homepage */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#050d1a]/60 via-transparent to-[#050d1a]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050d1a]/60 via-[#050d1a]/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050d1a] to-transparent" />

          {/* Content Container - Matching homepage positioning */}
          <div className="absolute inset-0 flex items-center translate-y-12 sm:translate-y-16 md:translate-y-20 lg:translate-y-24">
            <div className="w-full h-full relative flex items-center">
              {/* Left Side - Content Details */}
              <div className={`pl-6 sm:pl-12 md:pl-14 lg:pl-16 transition-all duration-500 ${
                isTrailerPlaying ? 'w-[60%]' : 'w-full'
              }`}>
                {/* Content Type & Metadata */}
                <div className="flex items-center space-x-3 mb-3">
                  <span className="bg-[#3b5998] px-3 py-1 text-xs font-semibold rounded-md uppercase tracking-wide text-white">
                    Movie
                  </span>
                  {featuredMovie.genre && (
                    <span className="text-white/80 text-xs">
                      {featuredMovie.genre}
                    </span>
                  )}
                  {featuredMovie.release_year && (
                    <>
                      <span className="text-white/60">•</span>
                      <span className="text-white/80 text-xs">
                        {featuredMovie.release_year}
                      </span>
                    </>
                  )}
                </div>

                {/* Title - Matching homepage size */}
                <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold mb-2 sm:mb-3 text-white tracking-tight">
                  {featuredMovie.title}
                </h1>

                {/* Description - Matching homepage size */}
                <p className="text-xs sm:text-sm md:text-base text-white/90 mb-6 sm:mb-8 line-clamp-3 max-w-2xl">
                  {featuredMovie.description}
                </p>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <Link
                    href={`/content/${featuredMovie.id}`}
                    className="bg-transparent border-2 border-[#3b5998] text-[#3b5998] hover:bg-[#3b5998] hover:text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium inline-flex items-center transition-all duration-300 hover:scale-105"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4l12 6-12 6V4z"/>
                    </svg>
                    Watch Now
                  </Link>
                  {featuredMovie.trailer_url && (
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

                {/* Duration */}
                {featuredMovie.duration && (
                  <div className="flex items-center text-white/80 text-[10px] sm:text-xs">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {featuredMovie.duration}
                  </div>
                )}
              </div>

              {/* Right Side - Trailer Video */}
              {isTrailerPlaying && (
                <div className={`fixed inset-0 z-50 bg-black sm:relative sm:w-[40%] sm:bg-transparent ${
                  isTrailerPlaying ? 'flex items-center justify-center' : 'hidden'
                }`}>
                  <div className="absolute inset-0 bg-black/90 sm:hidden" />
                  <div className="relative w-full h-full sm:h-auto">
                    <div className="absolute inset-0 flex items-center">
                      <VideoPlayer
                        url={featuredMovie.trailer_url}
                        playing={isTrailerPlaying}
                        controls={true}
                        isTrailer={true}
                        width="100%"
                        height="100%"
                        style={{ aspectRatio: '16/9' }}
                        className="w-full h-auto"
                      />
                    </div>
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
      )}

      {/* Genre Filter - Moved up with negative margin */}
      <div className="sticky top-16 z-10 bg-black/95 backdrop-blur-sm border-b border-[#3b5998]/20 -mt-16">
        <div className="px-4 sm:px-6 md:px-8 py-4">
          <div className="flex space-x-2 sm:space-x-4 overflow-x-auto scrollbar-hide">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors
                  ${selectedGenre === genre 
                    ? 'bg-[#3b5998] text-white' 
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
              >
                {genre.charAt(0).toUpperCase() + genre.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Movies Grid Section - Updated card sizes */}
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
          {movies.map((movie) => (
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
          ))}
        </div>
      </div>
    </div>
  );
}