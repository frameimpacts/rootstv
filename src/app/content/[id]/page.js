'use client';
import { useState, useEffect } from 'react';
import { use } from 'react';
import Image from 'next/image';
import { useSession } from '@/components/SessionProvider';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import VideoPlayer from '@/components/VideoPlayer';

export default function ContentPage({ params }) {
  const unwrappedParams = use(params);
  const contentId = unwrappedParams.id;
  const router = useRouter();
  const { session } = useSession();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPurchased, setIsPurchased] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingContent, setPlayingContent] = useState(null);

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
      setIsPurchased(data.purchased);
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
              mode: "sandbox"
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Content Not Found</h2>
          <p className="text-gray-400">{error || "The content you're looking for doesn't exist."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Script
        src="https://sdk.cashfree.com/js/v3/cashfree.js"
        strategy="lazyOnload"
        onLoad={() => {
          console.log('Cashfree SDK loaded');
        }}
      />
      
      {/* Hero Section */}
      <div className="relative">
        {isPlaying ? (
          <div className="aspect-video w-full">
            <VideoPlayer 
              url={playingContent === 'trailer' ? content.trailer_url : content.content_url} 
              isPurchased={playingContent === 'trailer' ? true : isPurchased}
            />
          </div>
        ) : (
          <div className="relative aspect-video">
            <Image
              src={content.thumbnail_url || '/placeholder.jpg'}
              alt={content.title}
              fill
              className="object-cover"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50" />
          </div>
        )}

        {/* Content Info */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="md:col-span-2">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 md:mb-4">About {content.title}</h2>
              <p className="text-sm sm:text-base text-gray-300">{content.description}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold mb-3 md:mb-4">Details</h3>
              <dl className="space-y-3 md:space-y-4">
                <div>
                  <dt className="text-sm sm:text-base text-gray-400">Genre</dt>
                  <dd className="text-sm sm:text-base capitalize">{content.genre}</dd>
                </div>
                <div>
                  <dt className="text-sm sm:text-base text-gray-400">Release Year</dt>
                  <dd className="text-sm sm:text-base">{content.release_year}</dd>
                </div>
                <div>
                  <dt className="text-sm sm:text-base text-gray-400">Duration</dt>
                  <dd className="text-sm sm:text-base">{content.duration}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            {/* Trailer Button - Always visible */}
            {content.trailer_url && (
              <button
                onClick={() => {
                  setIsPlaying(true);
                  setPlayingContent('trailer');
                }}
                className="w-full sm:w-auto bg-gray-700 hover:bg-gray-600 text-white px-4 sm:px-6 md:px-8 py-2 md:py-3 rounded-lg font-semibold inline-flex items-center justify-center transition-colors"
              >
                <svg 
                  className="w-4 h-4 sm:w-5 sm:h-5 mr-2" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M4 4l12 6-12 6V4z"/>
                </svg>
                Watch Trailer
              </button>
            )}

            {/* Main Content Button */}
            {session ? (
              isPurchased ? (
                <button
                  onClick={() => {
                    setIsPlaying(true);
                    setPlayingContent('main');
                  }}
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 md:px-8 py-2 md:py-3 rounded-lg font-semibold inline-flex items-center justify-center transition-colors"
                >
                  <svg 
                    className="w-4 h-4 sm:w-5 sm:h-5 mr-2" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M4 4l12 6-12 6V4z"/>
                  </svg>
                  Watch Now
                </button>
              ) : (
                <button
                  onClick={handlePurchase}
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 md:px-8 py-2 md:py-3 rounded-lg font-semibold inline-flex items-center justify-center transition-colors"
                >
                  Buy Now ₹{parseFloat(content.price).toLocaleString('en-IN')}
                </button>
              )
            ) : (
              <button
                onClick={() => router.push('/auth/login')}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 md:px-8 py-2 md:py-3 rounded-lg font-semibold inline-flex items-center justify-center transition-colors"
              >
                Sign in to Watch
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Payment Container */}
      <div 
        id="cashfree-payment-container" 
        className="fixed inset-0 z-50 bg-black bg-opacity-50"
        style={{ display: 'none' }}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[500px] h-[600px] bg-white rounded-lg overflow-hidden">
          <div id="payment-form-container" className="w-full h-full"></div>
        </div>
      </div>
    </div>
  );
}