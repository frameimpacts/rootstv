'use client';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const handleInstall = useCallback(async () => {
    console.log('handleInstall called');
    
    // For development testing, simulate install
    if (process.env.NODE_ENV === 'development') {
      toast.success('App installed successfully! (Development Mode)');
      return;
    }

    if (!deferredPrompt) {
      toast.error('Installation not available');
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('Installation outcome:', outcome);
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        toast.success('App installed successfully!');
      } else {
        toast.error('Installation cancelled');
      }
    } catch (error) {
      console.error('Installation error:', error);
      toast.error('Installation failed');
    }
  }, [deferredPrompt]);

  useEffect(() => {
    console.log('PWAInstallPrompt mounted');
    
    // For development, simulate the beforeinstallprompt event
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        toast((t) => (
          <div className="flex items-center gap-4">
            <div>
              <p className="font-semibold">Install RootsTV App</p>
              <p className="text-sm text-gray-400">Watch movies with better protection</p>
            </div>
            <button
              onClick={() => {
                handleInstall();
                toast.dismiss(t.id);
              }}
              className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 rounded-md text-white"
            >
              Install
            </button>
          </div>
        ), {
          duration: 10000,
          position: 'bottom-right',
        });
      }, 2000); // Show after 2 seconds
    } else {
      // Production code
      const beforeInstallPromptHandler = (e) => {
        console.log('beforeinstallprompt event fired');
        e.preventDefault();
        setDeferredPrompt(e);
      };

      window.addEventListener('beforeinstallprompt', beforeInstallPromptHandler);
      return () => window.removeEventListener('beforeinstallprompt', beforeInstallPromptHandler);
    }
  }, [handleInstall]);

  // For testing in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const testInstall = (e) => {
        if (e.key === 'i' && e.ctrlKey) {
          toast((t) => (
            <div className="flex items-center gap-4">
              <div>
                <p className="font-semibold">Install RootsTV App</p>
                <p className="text-sm text-gray-400">Watch movies with better protection</p>
              </div>
              <button
                onClick={() => {
                  handleInstall();
                  toast.dismiss(t.id);
                }}
                className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 rounded-md text-white"
              >
                Install
              </button>
            </div>
          ), {
            duration: 10000,
            position: 'bottom-right',
          });
        }
      };

      window.addEventListener('keydown', testInstall);
      return () => window.removeEventListener('keydown', testInstall);
    }
  }, [handleInstall]);

  return null;
} 