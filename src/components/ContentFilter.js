'use client';
import { useState } from 'react';

export default function ContentFilter({ onFilter, onSort }) {
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const handlePriceChange = (value) => {
    setPriceRange(value);
    onFilter({ price: value });
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    onSort(value);
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg mb-6">
      <div className="flex flex-wrap gap-4">
        {/* Price Filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Price Range
          </label>
          <select
            value={priceRange}
            onChange={(e) => handlePriceChange(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Prices</option>
            <option value="0-5">Under $5</option>
            <option value="5-10">$5 - $10</option>
            <option value="10-15">$10 - $15</option>
            <option value="15+">Over $15</option>
          </select>
        </div>

        {/* Sort Options */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="title-asc">Title: A to Z</option>
            <option value="title-desc">Title: Z to A</option>
          </select>
        </div>
      </div>
    </div>
  );
}