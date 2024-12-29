'use client';
import Link from 'next/link';

export default function ContentGrid({ contents, title }) {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">{title}</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {contents.map((content) => (
          <Link key={content.id} href={`/content/${content.id}`} className="group">
            <div className="relative overflow-hidden rounded-lg">
              <img
                src={content.thumbnail_url}
                alt={content.title}
                className="w-full aspect-[2/3] object-cover transform group-hover:scale-110 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 p-4">
                  <h3 className="text-sm font-semibold">{content.title}</h3>
                  <p className="text-xs text-gray-300">${content.price}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}