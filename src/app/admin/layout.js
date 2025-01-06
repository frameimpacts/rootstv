'use client';
import { useSession } from '@/components/SessionProvider';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import AdminIcon from '@/components/AdminIcon';

export default function AdminLayout({ children }) {
  const { session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  if (!session?.token) {
    router.push('/auth/login');
    return null;
  }

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'chart-bar' },
    { path: '/admin/content', label: 'Content', icon: 'film' },
    { path: '/admin/comments', label: 'Comments', icon: 'chat' },
    { path: '/admin/manage-featured', label: 'Featured', icon: 'star' },
    { path: '/admin/people', label: 'Cast & Crew', icon: 'users' },
    { path: '/admin/users', label: 'Users', icon: 'users' },
    { path: '/admin/orders', label: 'Orders', icon: 'shopping-cart' },
    { path: '/admin/settings', label: 'Settings', icon: 'cog' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white h-14 fixed w-full z-50 flex items-center px-4 justify-between border-b border-gray-200 shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="text-red-500 text-lg font-bold">●</span>
          <h1 className="text-sm font-semibold text-gray-700">
            RootsTV Admin
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-gray-100 hover:bg-gray-200 p-1.5 rounded-md">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <button 
            onClick={() => router.push('/')} 
            className="flex items-center space-x-1.5 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 transition-all"
          >
            <span>Exit</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="fixed w-56 h-full bg-white pt-14 border-r border-gray-200">
        <nav className="mt-4 px-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center px-3 py-2 mb-1 text-xs rounded-md transition-all ${
                pathname === item.path 
                  ? 'bg-red-50 text-red-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <AdminIcon name={item.icon} className={`w-4 h-4 mr-2 ${
                pathname === item.path ? 'text-red-500' : 'text-gray-500'
              }`} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="pl-56 pt-14">
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
} 