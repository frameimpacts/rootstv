'use client';
import { useState, useEffect } from 'react';
import { use } from 'react';
import Image from 'next/image';
import { useSession } from '@/components/SessionProvider';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import VideoPlayer from '@/components/VideoPlayer';
import ContentStatus from '@/components/ContentStatus';

export default function ContentPage({ params }) {
  const unwrappedParams = use(params);
  const contentId = unwrappedParams.id;
  const router = useRouter();
  const { session } = useSession();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchaseStatus, setPurchaseStatus] = useState({
    isPurchased: false,
    isExpired: false
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingContent, setPlayingContent] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetchContent();
    if (session) {
      checkPurchaseStatus();
    }
  }, [contentId, session]);

  const fetchContent = async () => {
    try {
      const response = await fetch(`/api/content/${contentId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setContent(data);
    } catch (error) {
      console.error('Error fetching content:', error);
      setError('Failed to load content. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const checkPurchaseStatus = async () => {
    try {
      console.log('Checking purchase status for content:', contentId);
      const response = await fetch(`/api/purchases/check/${contentId}`, {
        headers: {
          'Authorization': `Bearer ${session.token}`
        }
      });
      const data = await response.json();
      console.log('Purchase status response:', data);
      setPurchaseStatus({
        isPurchased: data.purchased && !data.status.isExpired,
        isExpired: data.status.isExpired
      });
    } catch (error) {
      console.error('Error checking purchase status:', error);
    }
  };

  const handlePurchase = async () => {
    if (!session || !session.user) {
      console.log('No session found, redirecting to login');
      router.push('/auth/login');
      return;
    }

    console.log('Session in client:', session);

    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`
        },
        body: JSON.stringify({
          contentId: content.id,
          amount: content.price,
          currency: 'INR'
        })
      });

      const responseData = await response.json();
      console.log('Payment response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Payment initialization failed');
      }

      if (responseData.orderToken || responseData.paymentSessionId) {
        if (typeof window.Cashfree === 'undefined') {
          console.error('Cashfree SDK not loaded');
          return;
        }
        
        const paymentContainer = document.getElementById('payment-form-container');
        const modalContainer = document.getElementById('cashfree-payment-container');
        
        if (paymentContainer && modalContainer) {
          try {
            modalContainer.style.display = 'block';
            
            const cashfree = new window.Cashfree({
              mode: "production"
            });
            
            const checkoutConfig = {
              orderToken: responseData.orderToken,
              paymentSessionId: responseData.paymentSessionId,
              container: paymentContainer,
              returnUrl: `${window.location.origin}/payment/status/${responseData.order_id}`,
              onSuccess: (data) => {
                console.log('Payment success:', data);
                modalContainer.style.display = 'none';
                router.push(`/payment/status/${responseData.order_id}`);
              },
              onFailure: (data) => {
                console.log('Payment failed:', data);
                modalContainer.style.display = 'none';
                router.push(`/payment/status/${responseData.order_id}`);
              },
              onClose: () => {
                modalContainer.style.display = 'none';
              }
            };
            
            console.log('Checkout config:', checkoutConfig);
            cashfree.checkout(checkoutConfig);
            
          } catch (error) {
            console.error('Error in Cashfree initialization:', error);
            modalContainer.style.display = 'none';
            alert('Failed to initialize payment. Please try again.');
          }
        }
      } else if (responseData.payment_link) {
        window.location.href = responseData.payment_link;
      }
    } catch (error) {
      console.error('Payment error details:', error);
      alert(error.message || 'Payment failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050d1a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3b5998]"></div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050d1a]">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-white">Content Not Found</h2>
          <p className="text-sm sm:text-base text-white/60">{error || "The content you're looking for doesn't exist."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050d1a] text-white">
      <Script
        src="https://sdk.cashfree.com/js/v3/cashfree.js"
        strategy="lazyOnload"
        onLoad={() => console.log('Cashfree SDK loaded')}
      />
      
      {/* Hero Section */}
      <div className="relative w-full">
        {/* Always show thumbnail as background */}
        <div className="w-full">
          <div className="relative h-[60vh] sm:h-[70vh]">
            <Image
              src={content.thumbnail_url || '/placeholder.jpg'}
              alt={content.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            
            {/* Enhanced Gradient Overlays - Behind the player */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#050d1a]/60 via-transparent to-[#050d1a] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050d1a]/60 via-[#050d1a]/20 to-transparent pointer-events-none" />

            {/* Video Player Overlay */}
            {isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center z-20 mt-16">
                <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="aspect-video w-full relative bg-black/40">
                    <VideoPlayer 
                      url={playingContent === 'trailer' ? content.trailer_url : content.content_url} 
                      isPurchased={playingContent === 'trailer' ? true : purchaseStatus.isPurchased}
                      isTrailer={playingContent === 'trailer'}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Info */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2">
              {/* Content Type & Metadata */}
              <div className="flex items-center space-x-3 mb-3">
                <span className="bg-[#3b5998] px-3 py-1 text-xs font-semibold rounded-md uppercase tracking-wide">
                  {content.type}
                </span>
                <span className="text-white/80 text-xs">{content.genre}</span>
                <span className="text-white/60">•</span>
                <span className="text-white/80 text-xs">{content.release_year}</span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 text-white">{content.title}</h1>
              <p className="text-sm sm:text-base text-white/80 mb-6 leading-relaxed">{content.description}</p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mb-6">
                {!purchaseStatus.isPurchased ? (
                  <button
                    onClick={handlePurchase}
                    className="bg-[#3b5998] hover:bg-[#4b69a8] text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 inline-flex items-center"
                  >
                    <span className="mr-2">₹{content.price}</span>
                    {purchaseStatus.isExpired ? 'Renew Access' : 'Buy Now'}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsPlaying(true);
                      setPlayingContent('main');
                    }}
                    className="bg-[#3b5998] hover:bg-[#4b69a8] text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 inline-flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4l12 6-12 6V4z"/>
                    </svg>
                    Watch Now
                  </button>
                )}
                {content.trailer_url && (
                  <button
                    onClick={() => {
                      setIsPlaying(true);
                      setPlayingContent('trailer');
                    }}
                    className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-full text-sm font-medium backdrop-blur-sm transition-all duration-300 hover:scale-105 inline-flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Watch Trailer
                  </button>
                )}
              </div>

              {/* Purchase Status */}
              {purchaseStatus.isPurchased && (
                <div className="text-sm text-white/80">
                  <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                    Active Purchase
                  </span>
                </div>
              )}
              {purchaseStatus.isExpired && (
                <div className="text-sm text-white/80">
                  <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
                    Expired - Please Renew
                  </span>
                </div>
              )}
            </div>

            {/* Right Column - Details */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4 text-white">Details</h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-white/60">Genre</dt>
                  <dd className="text-sm text-white mt-1">{content.genre}</dd>
                </div>
                <div>
                  <dt className="text-sm text-white/60">Release Year</dt>
                  <dd className="text-sm text-white mt-1">{content.release_year}</dd>
                </div>
                {content.duration && (
                  <div>
                    <dt className="text-sm text-white/60">Duration</dt>
                    <dd className="text-sm text-white mt-1">{content.duration}</dd>
                  </div>
                )}
                {content.language && (
                  <div>
                    <dt className="text-sm text-white/60">Language</dt>
                    <dd className="text-sm text-white mt-1">{content.language}</dd>
                  </div>
                )}
                {content.rating && (
                  <div>
                    <dt className="text-sm text-white/60">Rating</dt>
                    <dd className="flex items-center gap-2 text-sm text-white mt-1">
                      <span>{status?.rating?.toFixed(1) || content.rating}</span>
                      <span className="text-xs text-white/60">
                        ({status?.totalRatings || 0} ratings)
                      </span>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal Container */}
      <div id="cashfree-payment-container" className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 hidden">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md">
          <div id="payment-form-container" className="bg-white rounded-2xl p-6"></div>
        </div>
      </div>

      <ContentStatus 
        contentId={content.id} 
        userId={session?.user?.id}
        onStatusUpdate={(newStatus) => setStatus(newStatus)}
      />
    </div>
  );
}