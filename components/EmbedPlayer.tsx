import React, { useState, useEffect } from 'react';
import type { PortfolioItem } from '../types';
import { Play } from 'lucide-react';

interface EmbedPlayerProps {
  item: PortfolioItem | null;
  className?: string;
  autoplay?: boolean;
  muted?: boolean;
}

const EmbedPlayer: React.FC<EmbedPlayerProps> = ({ item, className = '', autoplay = false, muted = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Reset to thumbnail view whenever the video item changes
  useEffect(() => {
    setIsPlaying(false);
  }, [item?.id]);

  if (!item) return <div className={`bg-black ${className}`} />;

  if (item.type === 'image') {
    return (
      <div className={`relative w-full h-full overflow-hidden ${className}`}>
        <img 
          src={item.url} 
          alt={item.title} 
          className="w-full h-full object-cover animate-fade-in"
        />
        {/* Cinematic Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)]" />
      </div>
    );
  }

  const handlePlay = () => {
    setIsPlaying(true);
  };

  // Helper to detect Facebook URLs
  const isFacebookUrl = (url: string) => {
    return url.includes('facebook.com') || url.includes('fb.watch');
  };

  const getFacebookEmbedUrl = (url: string) => {
    // Facebook Embed Player needs the encoded URL
    const encodedUrl = encodeURIComponent(url);
    return `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=0&autoplay=1&mute=0`;
  };

  // Robust parsing for YouTube URLs
  const getYouTubeEmbedUrl = (url: string) => {
    let videoId = '';
    let start = '0';

    const idMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (idMatch) {
      videoId = idMatch[1];
    } else {
      return url; 
    }

    const timeMatch = url.match(/[?&]t=([^&]+)/);
    if (timeMatch) {
      start = timeMatch[1].replace('s', '');
    }

    const params = [];
    
    // Auto start ONLY when user clicks the custom play button (state isPlaying is true)
    params.push('autoplay=1'); 
    params.push(`mute=${muted ? '1' : '0'}`);
    params.push(`start=${start}`);
    params.push('controls=1');       // Show controls once playing for better UX
    params.push('rel=0');            
    params.push('showinfo=0');       
    params.push('modestbranding=1'); 
    params.push('iv_load_policy=3'); 
    params.push('fs=1');             // Allow fullscreen
    params.push('playsinline=1');    

    return `https://www.youtube.com/embed/${videoId}?${params.join('&')}`;
  };

  const isFacebook = isFacebookUrl(item.url);

  return (
    <div className={`w-full h-full bg-black relative overflow-hidden group ${className}`}>
      
      {/* 
        STATE 1: THUMBNAIL & PLAY BUTTON
        Visible when not playing.
      */}
      {!isPlaying && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
           {/* Background Thumbnail */}
           <div className="absolute inset-0 z-0">
              <img 
                src={item.thumbnail} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
              />
              {/* Reduced opacity overlay from 30% to 10% and removed blur for clearer image */}
              <div className="absolute inset-0 bg-black/10 transition-colors duration-500 group-hover:bg-black/20"></div>
           </div>

           {/* Central Play Button */}
           <button 
             onClick={handlePlay}
             className="relative z-30 group/play cursor-pointer transform transition-all duration-300 hover:scale-110"
             aria-label="Play Video"
           >
             {/* Outer Ring */}
             <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border border-white/30 bg-white/10 backdrop-blur-md flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.3)] transition-all duration-500 group-hover/play:bg-gold-500/20 group-hover/play:border-gold-400">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border border-white/50 flex items-center justify-center">
                   <Play className="w-8 h-8 md:w-10 md:h-10 text-white fill-white ml-1 transition-colors group-hover/play:text-gold-100 group-hover/play:fill-gold-100" />
                </div>
             </div>
             
             {/* Pulse Effect */}
             <div className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-0 group-hover/play:opacity-100"></div>
           </button>
           
           <span className="relative z-30 mt-4 text-white/90 text-xs tracking-[0.3em] font-sans uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-2 group-hover:translate-y-0 text-shadow-sm">
             Xem Phim
           </span>
        </div>
      )}

      {/* 
        STATE 2: VIDEO IFRAME (YouTube or Facebook)
        Visible only when playing.
      */}
      {isPlaying && (
        <div className="absolute inset-0 w-full h-full z-10 animate-fade-in bg-black">
          <iframe
            src={isFacebook ? getFacebookEmbedUrl(item.url) : getYouTubeEmbedUrl(item.url)}
            title={item.title}
            className="w-full h-full border-none" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            // Facebook specific constraints
            scrolling="no"
          />
        </div>
      )}
    </div>
  );
};

export default EmbedPlayer;