export const getVimeoEmbedUrl = async (url) => {
  try {
    // Extract video ID from URL
    const videoId = url.match(/(?:vimeo.com\/)(\d+)/)?.[1];
    if (!videoId) return { valid: false };

    // Get oEmbed data from Vimeo
    const response = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`);
    const data = await response.json();

    return {
      valid: true,
      embedUrl: data.html,
      duration: data.duration * 60 // Convert to minutes
    };
  } catch (error) {
    console.error('Vimeo validation error:', error);
    return { valid: false };
  }
}; 