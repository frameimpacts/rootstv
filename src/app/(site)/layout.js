import { Geist } from 'next/font/google';
import { SessionProvider } from '@/components/SessionProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import '../globals.css';

const geist = Geist({ subsets: ['latin'] });

export default function SiteLayout({ children }) {
  return (
    <div className={`${geist.className} bg-[#050d1a] text-white min-h-screen`}>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
} 