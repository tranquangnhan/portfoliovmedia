import React from 'react';
import { Play, Image as ImageIcon } from 'lucide-react';
import type { PortfolioItem } from '../types';

interface PortfolioGridProps {
  items: PortfolioItem[];
  onSelect: (item: PortfolioItem) => void;
  isVisible: boolean;
}

const PortfolioGrid: React.FC<PortfolioGridProps> = ({ items, onSelect, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-40 bg-cream/90 backdrop-blur-md overflow-y-auto no-scrollbar pt-20 pb-40 px-6 md:px-20 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h2 className="text-4xl md:text-5xl font-serif text-gold-600 mb-2">Tác Phẩm Tiêu Biểu</h2>
          <div className="w-16 h-1 bg-gold-400 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {items.map((item, index) => (
            <div 
              key={item.id}
              onClick={() => onSelect(item)}
              className="
                group relative aspect-video bg-neutral-200 cursor-pointer overflow-hidden rounded-lg
                shadow-sm hover:shadow-[0_20px_40px_rgba(212,175,55,0.2)] 
                transition-all duration-500 hover:-translate-y-2
              "
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Thumbnail */}
              <img 
                src={item.thumbnail} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <span className="text-gold-400 text-xs font-bold tracking-widest uppercase mb-1 block">
                    {item.client || 'Dự Án Cá Nhân'}
                  </span>
                  <h3 className="text-white font-serif text-xl mb-2">{item.title}</h3>
                  <div className="flex items-center text-white/80 text-xs gap-2">
                     {item.type === 'video' ? <Play size={12} fill="white" /> : <ImageIcon size={12} />}
                     <span className="capitalize">{item.type}</span>
                  </div>
                </div>
              </div>

              {/* Center Icon */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100">
                <div className="w-12 h-12 rounded-full border border-white/30 backdrop-blur-sm flex items-center justify-center bg-white/10">
                   {item.type === 'video' ? <Play size={20} className="text-white ml-1" /> : <ImageIcon size={20} className="text-white" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PortfolioGrid;