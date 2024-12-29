'use client';
import { useState } from 'react';
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-black/95 to-gray-900/95 sticky top-0 z-50 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-[1920px] mx-auto px-6">
        <div className="relative flex items-center justify-between h-20">
          {/* Left side - Logo and navigation */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center pl-2">
              <Image
                src="/rootstv.png"
                alt="RootsTV"
                width={140}
                height={140}
                className="object-contain w-auto h-16"
                priority
                quality={100}
              />
            </Link>
            
            <div className="hidden md:flex space-x-8 ml-8">
              <Link 
                href="/movies" 
                className="text-gray-200 hover:text-red-500 transition-colors duration-200 font-medium text-sm uppercase tracking-wider"
              >
                Movies
              </Link>
              <Link 
                href="/shows" 
                className="text-gray-200 hover:text-red-500 transition-colors duration-200 font-medium text-sm uppercase tracking-wider"
              >
                TV Shows
              </Link>
              <Link 
                href="/shorts" 
                className="text-gray-200 hover:text-red-500 transition-colors duration-200 font-medium text-sm uppercase tracking-wider"
              >
                Shorts
              </Link>
            </div>
          </div>

          {/* Right side - Search and Account */}
          <div className="flex items-center space-x-5 pr-2">
            <form onSubmit={handleSearch} className="hidden md:block relative">
              <input
                type="search"
                placeholder="Search movies, shows..."
                className="bg-gray-800/50 text-white pl-10 pr-4 py-2.5 rounded-full w-64 focus:outline-none focus:ring-2 focus:ring-red-500 border border-gray-700 hover:border-gray-600 transition-colors"
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

            {session ? (
              <div className="relative ml-2">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white focus:outline-none p-2 rounded-full hover:bg-gray-800 transition-colors"
                >
                  <svg 
                    className="h-8 w-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
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
              <div className="flex items-center space-x-3">
                <Link 
                  href="/auth/login" 
                  className="text-gray-200 hover:text-red-500 transition-colors duration-200 font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-red-600 text-white px-6 py-2.5 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-300 hover:text-white p-2"
              >
                <svg
                  className="h-6 w-6"
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

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-700 mt-2">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/movies"
                className="text-gray-300 hover:text-white block px-3 py-2"
                onClick={() => setIsOpen(false)}
              >
                Movies
              </Link>
              <Link
                href="/shows"
                className="text-gray-300 hover:text-white block px-3 py-2"
                onClick={() => setIsOpen(false)}
              >
                TV Shows
              </Link>
              <Link
                href="/shorts"
                className="text-gray-300 hover:text-white block px-3 py-2"
                onClick={() => setIsOpen(false)}
              >
                Shorts
              </Link>
              <form onSubmit={handleSearch} className="px-3 py-2">
                <input
                  type="search"
                  placeholder="Search..."
                  className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}