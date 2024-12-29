'use client';
import { useState, useEffect } from 'react';
import ContentGrid from '@/components/ContentGrid';

export default function Shows() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShows();
  }, []);

  const fetchShows = async () => {
    try {
      const response = await fetch('/api/content?type=show');
      const data = await response.json();
      setShows(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch shows:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return <ContentGrid contents={shows} title="TV Shows" />;
}