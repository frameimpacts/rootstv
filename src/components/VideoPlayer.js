export default function VideoPlayer({ url, isPurchased = false }) {
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

  const videoType = getVideoType(url);

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
      <div className="aspect-video w-full">
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
      <div className="aspect-video w-full">
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
      <div className="aspect-video w-full">
        <iframe
          src={`https://player.vimeo.com/video/${videoId}`}
          className="w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (videoType === 'iframe') {
    return (
      <div className="aspect-video w-full" 
        dangerouslySetInnerHTML={{ __html: url }} 
      />
    );
  }

  // Default video player for direct URLs
  return (
    <video
      src={url}
      className="w-full aspect-video"
      controls
      controlsList="nodownload"
    />
  );
} 