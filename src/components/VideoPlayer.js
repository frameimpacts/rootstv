import React, { useEffect, useState } from 'react';

export default function VideoPlayer({ url, isPurchased = false, isTrailer = false, isAdmin = false }) {
  const [isPWA, setIsPWA] = useState(false);
  
  const getVideoType = (url) => {
    if (!url) return 'none';
    if (url.includes('<iframe') && url.includes('youtube.com/embed/')) {
      return 'youtube-iframe';
    }
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    }
    if (url.includes('vimeo.com')) {
      return 'vimeo';
    }
    if (url.includes('<iframe')) {
      return 'iframe';
    }
    return 'direct';
  };

  const extractSrcFromIframe = (iframeHtml) => {
    const srcMatch = iframeHtml.match(/src="([^"]+)"/);
    return srcMatch ? srcMatch[1] : '';
  };

  const videoType = getVideoType(url);

  useEffect(() => {
    const checkIfPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isFromHomescreen = window.navigator.standalone;
      setIsPWA(isStandalone || isFromHomescreen);
    };

    checkIfPWA();
    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkIfPWA);
    
    if (!isTrailer) {
      const preventKeyboardShortcuts = (e) => {
        if (e.key === 'PrintScreen' || 
            (e.ctrlKey && (e.key === 'p' || e.key === 's' || e.key === 'c')) || 
            (e.altKey && e.key === 'PrintScreen')) {
          e.preventDefault();
          return false;
        }
      };

      document.addEventListener('keydown', preventKeyboardShortcuts);
      return () => document.removeEventListener('keydown', preventKeyboardShortcuts);
    }

    return () => {
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', checkIfPWA);
    };
  }, [isTrailer]);

  // Check for trailer first
  if (isTrailer) {
    return (
      <div className="aspect-video w-full">
        {videoType === 'youtube-iframe' && (
          <iframe
            src={extractSrcFromIframe(url)}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        )}
        {videoType === 'youtube' && (
          <iframe
            src={`https://www.youtube.com/embed/${url.includes('youtube.com') 
              ? url.split('v=')[1]?.split('&')[0]
              : url.split('youtu.be/')[1]}`}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
        {videoType === 'vimeo' && (
          <iframe
            src={`https://player.vimeo.com/video/${url.match(/(?:vimeo.com\/)(\d+)/)?.[1]}?${new URLSearchParams({
              dnt: 1,
              controls: 1,
              playsinline: 1,
              title: 0,
              byline: 0,
              portrait: 0,
              autopause: 1,
              transparent: 0,
            }).toString()}`}
            className="w-full h-full"
            frameBorder="0"
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        )}
        {videoType === 'direct' && (
          <video
            src={url}
            className="w-full h-full"
            controls
            controlsList="nodownload"
          />
        )}
      </div>
    );
  }

  // Then check for admin
  if (isAdmin) {
    return (
      <div className="aspect-video w-full">
        {videoType === 'youtube-iframe' && (
          <iframe
            src={extractSrcFromIframe(url)}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        )}
        {videoType === 'youtube' && (
          <iframe
            src={`https://www.youtube.com/embed/${url.includes('youtube.com') 
              ? url.split('v=')[1]?.split('&')[0]
              : url.split('youtu.be/')[1]}`}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
        {videoType === 'vimeo' && (
          <iframe
            src={`https://player.vimeo.com/video/${url.match(/(?:vimeo.com\/)(\d+)/)?.[1]}?${new URLSearchParams({
              dnt: 1,
              controls: 1,
              playsinline: 1,
              title: 0,
              byline: 0,
              portrait: 0,
              autopause: 1,
              transparent: 0,
            }).toString()}`}
            className="w-full h-full"
            frameBorder="0"
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        )}
        {videoType === 'iframe' && (
          <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: url }} />
        )}
        {videoType === 'direct' && (
          <video
            src={url}
            className="w-full h-full"
            controls
            controlsList="nodownload"
          />
        )}
      </div>
    );
  }

  // Then check for PWA requirement
  if (!isPWA && !isTrailer) {
    return (
      <div className="aspect-video w-full bg-gray-800 flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-lg font-semibold mb-2">Install App to Watch Full Movie</p>
          <p className="text-sm text-gray-400 mb-4">For a better and more secure viewing experience, please install our app</p>
          <button 
            onClick={() => {
              const installEvent = new Event('show-pwa-install-prompt');
              window.dispatchEvent(installEvent);
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
          >
            Install App
          </button>
        </div>
      </div>
    );
  }

  // Then check for purchase requirement
  if (!isPurchased) {
    return (
      <div className="aspect-video w-full bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Purchase to Watch</p>
          <p className="text-sm text-gray-400">This content requires purchase</p>
        </div>
      </div>
    );
  }

  if (videoType === 'youtube-iframe') {
    const srcMatch = url.match(/src="([^"]+)"/);
    const embedUrl = srcMatch ? srcMatch[1] : '';
    return (
      <div className="aspect-video w-full select-none">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          frameBorder="0"
        />
      </div>
    );
  }

  if (videoType === 'youtube') {
    const videoId = url.includes('youtube.com') 
      ? url.split('v=')[1]?.split('&')[0]
      : url.split('youtu.be/')[1];
    return (
      <div className="aspect-video w-full select-none">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (videoType === 'vimeo') {
    const videoId = url.match(/(?:vimeo.com\/)(\d+)/)?.[1];
    return (
      <div className="aspect-video w-full select-none">
        <iframe
          src={`https://player.vimeo.com/video/${videoId}?${new URLSearchParams({
            dnt: 1,
            controls: 1,
            playsinline: 1,
            title: 0,
            byline: 0,
            portrait: 0,
            pip: !isTrailer ? 0 : 1,
            autopause: 1,
            transparent: 0,
            keyboard: !isTrailer ? 0 : 1,
          }).toString()}`}
          className="w-full h-full"
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      </div>
    );
  }

  if (videoType === 'iframe') {
    return (
      <div className="aspect-video w-full select-none" 
        dangerouslySetInnerHTML={{ __html: url }} 
      />
    );
  }

  // Default video player for direct URLs
  return (
    <div className="relative aspect-video w-full select-none">
      <video
        src={url}
        className="w-full h-full"
        controls
        controlsList={!isTrailer ? "nodownload nofullscreen noremoteplayback" : "nodownload"}
        disablePictureInPicture={!isTrailer}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        onSelectStart={(e) => e.preventDefault()}
        onCopy={(e) => e.preventDefault()}
      />
      {!isTrailer && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div 
            className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none select-none"
            style={{ 
              transform: 'rotate(-45deg)',
              fontSize: '2rem',
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}
          >
            © RootsTV • {new Date().toISOString()}
          </div>
        </div>
      )}
    </div>
  );
}

const updateWatchProgress = async (contentId, progress) => {
  try {
    await fetch(`/api/content/${contentId}/watch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ progress })
    });
  } catch (error) {
    console.error('Failed to update watch progress:', error);
  }
};

// Add this to your video player's onTimeUpdate or similar event
const handleTimeUpdate = (e) => {
  const video = e.target;
  const progress = Math.round((video.currentTime / video.duration) * 100);
  
  // Update progress every 5% change or when video ends
  if (progress % 5 === 0 || progress === 100) {
    updateWatchProgress(contentId, progress);
  }
}; 