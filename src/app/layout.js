'use client';
import { Geist } from 'next/font/google';
import { SessionProvider } from '@/components/SessionProvider';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './globals.css';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { Toaster } from 'react-hot-toast';

const geist = Geist({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  useEffect(() => {
    if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => 
          console.log('Service Worker registration successful:', registration.scope)
        )
        .catch((err) => 
          console.error('Service Worker registration failed:', err)
        );
    }
  }, []);

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="shortcut icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={geist.className}>
        <SessionProvider>
          {!isAdminRoute && <Navbar />}
          {children}
          {!isAdminRoute && <Footer />}
        </SessionProvider>
        <PWAInstallPrompt />
        <Toaster />
      </body>
    </html>
  );
}