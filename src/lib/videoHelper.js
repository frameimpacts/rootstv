export const getVideoEmbedUrl = (url) => {
  try {
    // Handle YouTube URLs
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtube.com') 
        ? url.split('v=')[1].split('&')[0]
        : url.split('youtu.be/')[1];
      return {
        valid: true,
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        type: 'youtube'
      };
    }
    // Handle Vimeo URLs (for later)
    else if (url.includes('vimeo.com')) {
      const videoId = url.match(/(?:vimeo.com\/)(\d+)/)?.[1];
      return {
        valid: true,
        embedUrl: `https://player.vimeo.com/video/${videoId}`,
        type: 'vimeo'
      };
    }
    
    // If it's a direct URL, return as is
    return {
      valid: true,
      embedUrl: url,
      type: 'direct'
    };
  } catch (error) {
    console.error('Video URL parsing error:', error);
    return { valid: false };
  }
}; 