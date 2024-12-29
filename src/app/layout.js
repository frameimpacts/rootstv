import { Geist } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './globals.css';
import { SessionProvider } from '@/components/SessionProvider';

const geist = Geist({ subsets: ['latin'] });

export const metadata = {
  title: 'RootsTV',
  description: 'Watch your favorite movies and shows',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
      </head>
      <body className={`${geist.className} bg-gray-900 text-white flex flex-col min-h-screen`}>
        <SessionProvider>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}