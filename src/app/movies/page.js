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

  const genres = ['all', ...GENRES];

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await fetch('/api/content?type=movie');
      const data = await response.json();
      setMovies(data);
      // Set the first movie as featured
      setFeaturedMovie(data[0]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching movies:', error);
      setLoading(false);
    }
  };

  const filteredMovies = selectedGenre === 'all' 
    ? movies 
    : movies.filter(movie => {
        // Split the comma-separated genres and trim whitespace
        const movieGenres = movie.genre.split(',').map(g => g.toLowerCase().trim());
        // Check if the selected genre exists in the movie's genres array
        return movieGenres.includes(selectedGenre);
      });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Featured Movie Hero Section */}
      {featuredMovie && (
        <div className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] w-full">
          <Image
            src={featuredMovie.thumbnail_url}
            alt={featuredMovie.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent">
            <div className="absolute bottom-0 left-0 p-4 sm:p-6 md:p-8 max-w-3xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 md:mb-4">{featuredMovie.title}</h1>
              <p className="text-sm sm:text-base md:text-lg mb-4 md:mb-6 text-gray-200">{featuredMovie.description}</p>
              <Link
                href={`/content/${featuredMovie.id}`}
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
            </div>
          </div>
        </div>
      )}

      {/* Genre Filter */}
      <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b border-gray-800 sticky top-16 bg-gray-900/95 backdrop-blur-sm z-10">
        <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                ${selectedGenre === genre 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              {genre.charAt(0).toUpperCase() + genre.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Movies Grid */}
      <div className="px-4 sm:px-6 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
          {filteredMovies.map((movie) => (
            <Link 
              key={movie.id} 
              href={`/content/${movie.id}`}
              className="group"
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                <Image
                  src={movie.thumbnail_url}
                  alt={movie.title}
                  fill
                  className="object-cover transform group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 p-2 sm:p-3 md:p-4">
                    <h3 className="font-semibold text-xs sm:text-sm">{movie.title}</h3>
                    <p className="text-xs text-gray-300 mt-1">{movie.release_year}</p>
                  </div>
                </div>
              </div>
              <h3 className="mt-2 font-semibold group-hover:text-red-500 transition-colors text-sm sm:text-base">
                {movie.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-400">{movie.release_year}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}