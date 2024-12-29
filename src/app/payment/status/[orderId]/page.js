'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PaymentStatus({ params }) {
  const [status, setStatus] = useState('loading');
  const router = useRouter();
  const orderId = params.orderId;

  useEffect(() => {
    checkPaymentStatus();
  }, [orderId]);

  const checkPaymentStatus = async () => {
    try {
      const response = await fetch(`/api/payments/status/${orderId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch payment status');
      }
      
      const data = await response.json();
      console.log('Payment status response:', data);

      if (data.status === 'paid' || data.status === 'success') {
        setStatus('success');
      } else if (data.status === 'failed' || data.status === 'failure') {
        setStatus('failed');
      } else {
        setStatus('pending');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
      <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full text-center">
        {status === 'loading' && (
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto"></div>
        )}
        
        {status === 'success' && (
          <>
            <svg
              className="h-16 w-16 text-green-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <h2 className="text-2xl font-bold mb-4">Payment Successful!</h2>
            <p className="text-gray-300 mb-6">Your purchase was completed successfully.</p>
            <Link
              href="/"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg inline-block"
            >
              Back to Home
            </Link>
          </>
        )}

        {status === 'failed' && (
          <>
            <svg
              className="h-16 w-16 text-red-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <h2 className="text-2xl font-bold mb-4">Payment Failed</h2>
            <p className="text-gray-300 mb-6">Your payment could not be processed.</p>
            <button
              onClick={() => router.back()}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
} 