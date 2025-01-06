'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from '@/components/SessionProvider';

export default function Navbar() {
  const { session, logout } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  // Add scroll listener
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 0;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsOpen(false);
    }
  };

  return (
    <>
      <nav 
        className={`fixed w-full top-0 z-40 transition-all duration-500 ease-in-out ${
          scrolled 
            ? 'bg-gradient-to-b from-black/90 via-black/80 to-black/70 backdrop-blur-[2px]' 
            : 'bg-gradient-to-b from-black/50 via-black/30 to-transparent'
        }`}
      >
        <div className="max-w-[1920px] mx-auto pl-3 sm:pl-6 md:pl-12">
          <div className="relative flex items-center justify-between h-16 md:h-16">
            {/* Left side - Logo */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <Image
                src="/rootstv.png"
                alt="RootsTV"
                width={160}
                height={160}
                className="object-contain w-auto h-12"
                priority
                quality={100}
              />
            </Link>

            {/* Right side - Navigation, Search and Account */}
            <div className="flex items-center space-x-3 sm:space-x-5 md:space-x-8">
              {/* Navigation Links */}
              <div className="hidden md:flex space-x-8">
                <Link 
                  href="/movies" 
                  className="text-gray-100 hover:text-red-500 transition-colors duration-200 font-medium text-[13px] uppercase tracking-wide"
                >
                  Movies
                </Link>
                <Link 
                  href="/shows" 
                  className="text-gray-100 hover:text-red-500 transition-colors duration-200 font-medium text-[13px] uppercase tracking-wide"
                >
                  TV Shows
                </Link>
                <Link 
                  href="/shorts" 
                  className="text-gray-100 hover:text-red-500 transition-colors duration-200 font-medium text-[13px] uppercase tracking-wide"
                >
                  Shorts
                </Link>
              </div>

              {/* Search */}
              <form onSubmit={handleSearch} className="hidden md:block relative">
                <input
                  type="search"
                  placeholder="Search movies, shows..."
                  className="bg-gray-800/40 text-white pl-10 pr-4 py-1.5 rounded-full w-56 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 border border-gray-700/50 hover:border-gray-600 transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg 
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </form>

              {/* Account Section */}
              {session ? (
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="hidden md:flex items-center space-x-2 text-gray-100 hover:text-white focus:outline-none"
                  >
                    <span className="text-sm font-medium">{session.user?.name}</span>
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 py-1 border border-gray-700">
                      {session.role === 'admin' && (
                        <Link
                          href="/admin/dashboard"
                          className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          </svg>
                          Admin Dashboard
                        </Link>
                      )}
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        My Profile
                      </Link>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          logout();
                        }}
                        className="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-gray-700"
                      >
                        <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    href="/auth/login"
                    className="text-white/90 hover:text-white px-3 py-2 text-sm font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-[#3b5998] text-white hover:bg-[#4b69a8] px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile menu button - Updated with larger size */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-1 -mr-2"
              >
                <svg
                  className="h-9 w-9 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div 
        className={`fixed inset-0 bg-[#050d1a]/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />
      
      <div 
        className={`fixed inset-y-0 right-0 w-[280px] bg-[#050d1a] z-50 md:hidden transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Close button */}
          <div className="flex justify-end p-4">
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors duration-200"
            >
              <svg
                className="h-6 w-6 text-gray-400 hover:text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="px-4 pb-4 border-b border-gray-800">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="search"
                placeholder="Search movies, shows..."
                className="w-full bg-gray-800/50 text-white pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 border border-gray-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg 
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </form>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto py-4">
            <Link
              href="/movies"
              className="flex items-center text-gray-300 hover:text-white hover:bg-gray-800 px-4 py-3"
              onClick={() => setIsOpen(false)}
            >
              <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
              Movies
            </Link>
            <Link
              href="/shows"
              className="flex items-center text-gray-300 hover:text-white hover:bg-gray-800 px-4 py-3"
              onClick={() => setIsOpen(false)}
            >
              <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              TV Shows
            </Link>
            <Link
              href="/shorts"
              className="flex items-center text-gray-300 hover:text-white hover:bg-gray-800 px-4 py-3"
              onClick={() => setIsOpen(false)}
            >
              <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Shorts
            </Link>
          </div>

          {/* User Section */}
          <div className="border-t border-gray-800 p-4">
            {session ? (
              <div className="space-y-3">
                {session.role === 'admin' && (
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center text-gray-300 hover:text-white hover:bg-gray-800 px-4 py-2.5 rounded-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    </svg>
                    Admin Dashboard
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="flex items-center text-gray-300 hover:text-white hover:bg-gray-800 px-4 py-2.5 rounded-lg"
                  onClick={() => setIsOpen(false)}
                >
                  <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Profile
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    logout();
                  }}
                  className="flex items-center w-full text-gray-300 hover:text-white hover:bg-gray-800 px-4 py-2.5 rounded-lg"
                >
                  <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  href="/auth/login"
                  className="flex items-center justify-center w-full text-gray-200 hover:text-white bg-gray-800 hover:bg-gray-700 px-4 py-2.5 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="flex items-center justify-center w-full text-white bg-red-600 hover:bg-red-700 px-4 py-2.5 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}