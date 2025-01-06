'use client';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const handleInstall = useCallback(async () => {
    console.log('handleInstall called', { deferredPrompt, env: process.env.NODE_ENV });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode - simulating install');
      toast.success('App installed successfully! (Development Mode)');
      return;
    }

    if (!deferredPrompt) {
      console.log('No deferred prompt available');
      toast.error('Installation not available. Please use a supported browser.');
      return;
    }

    try {
      await deferredPrompt.prompt();
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
      toast.error('Installation failed: ' + error.message);
    }
  }, [deferredPrompt]);

  useEffect(() => {
    const beforeInstallPromptHandler = (e) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleCustomInstallPrompt = () => {
      console.log('Custom install prompt triggered');
      handleInstall();
    };

    window.addEventListener('beforeinstallprompt', beforeInstallPromptHandler);
    window.addEventListener('show-pwa-install-prompt', handleCustomInstallPrompt);
    
    // Debug log
    if (!window.matchMedia('(display-mode: standalone)').matches) {
      console.log('App is not installed');
    }
    
    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstallPromptHandler);
      window.removeEventListener('show-pwa-install-prompt', handleCustomInstallPrompt);
    };
  }, [handleInstall]);

  return null;
} 