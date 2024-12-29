'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ContentGrid from '@/components/ContentGrid';

export default function Search() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      searchContent();
    }
  }, [query]);

  const searchContent = async () => {
    try {
      const response = await fetch(`/api/content/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setResults(data);
      setLoading(false);
    } catch (error) {
      console.error('Search failed:', error);
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

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Search Results</h1>
      <p className="text-gray-400 mb-8">Found {results.length} results for "{query}"</p>
      <ContentGrid contents={results} title="" />
    </div>
  );
}