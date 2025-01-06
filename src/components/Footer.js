'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const quickLinks = [
    { name: 'Movies', href: '/movies' },
    { name: 'TV Shows', href: '/shows' },
    { name: 'Short Films', href: '/shorts' },
    { name: 'New Releases', href: '/new-releases' }
  ];

  const supportLinks = [
    { name: 'Help Center', href: '/help' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' }
  ];

  const handleSubscribe = (e) => {
    e.preventDefault();
    console.log('Newsletter subscription submitted');
  };

  return (
    <footer className="bg-[#050d1a] border-t border-[#3b5998]/20">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
          {/* Company Info */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/rootstv.png"
                alt="RootsTV"
                width={140}
                height={140}
                className="object-contain w-auto h-12 md:h-14"
                priority
                quality={100}
              />
            </Link>
            <p className="text-sm text-gray-400">
              Watch your favorite movies, shows, and short films anytime, anywhere.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-[#3b5998] hover:text-[#8b9dc3] transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              {/* Add other social media icons similarly */}
            </div>
          </div>

          {/* Quick Links and Support - Side by side on mobile */}
          <div className="grid grid-cols-2 sm:hidden gap-8">
            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Quick Links</h3>
              <div className="space-y-2">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-sm text-gray-400 hover:text-[#3b5998] transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Support</h3>
              <div className="space-y-2">
                {supportLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-sm text-gray-400 hover:text-[#3b5998] transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links - Tablet and above */}
          <div className="hidden sm:block sm:ml-auto">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Quick Links</h3>
            <div className="space-y-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sm text-gray-400 hover:text-[#3b5998] transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Support - Tablet and above */}
          <div className="hidden sm:block sm:ml-auto">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Support</h3>
            <div className="space-y-2">
              {supportLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sm text-gray-400 hover:text-[#3b5998] transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="sm:ml-auto">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Stay Updated</h3>
            <p className="text-sm text-gray-400 mb-4">
              Subscribe to our newsletter for updates and exclusive offers.
            </p>
            <form onSubmit={handleSubscribe}>
              <div className="flex max-w-md">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-black text-white px-4 py-2 rounded-l-md w-full text-sm focus:outline-none focus:ring-1 focus:ring-[#3b5998] border border-[#3b5998]/30 hover:border-[#3b5998]/50 transition-colors"
                />
                <button
                  type="submit"
                  className="bg-transparent border border-[#3b5998] text-[#3b5998] hover:bg-[#3b5998] hover:text-white px-4 py-2 rounded-r-md text-sm font-medium transition-all duration-300"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="border-t border-[#3b5998]/20 py-8">
          <p className="text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} RootsTV. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}