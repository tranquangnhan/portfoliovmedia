import React, { useState, useEffect } from 'react';
import TVControls from './components/TVControls';
import EmbedPlayer from './components/EmbedPlayer';
import PortfolioGrid from './components/PortfolioGrid';
import InfoOverlay from './components/InfoOverlay';
import AdminPanel from './components/AdminPanel';
import { ViewState, PortfolioItem, ContactInfo } from './types';
import { PORTFOLIO_ITEMS, CONTACT_INFO } from './constants';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  
  // State for dynamic items, initialized from LocalStorage if available
  const [items, setItems] = useState<PortfolioItem[]>(() => {
    try {
      const saved = localStorage.getItem('luxe_portfolio_items');
      return saved ? JSON.parse(saved) : PORTFOLIO_ITEMS;
    } catch (e) {
      return PORTFOLIO_ITEMS;
    }
  });

  // State for dynamic contact info
  const [contactInfo, setContactInfo] = useState<ContactInfo>(() => {
    try {
      const saved = localStorage.getItem('luxe_contact_info');
      if (saved) {
        // Merge with default to ensure new fields like facebook/zalo exist if older data is present
        return { ...CONTACT_INFO, ...JSON.parse(saved) };
      }
      return CONTACT_INFO;
    } catch (e) {
      return CONTACT_INFO;
    }
  });

  const [activeItem, setActiveItem] = useState<PortfolioItem>(items[0]);
  const [isMuted, setIsMuted] = useState(false);

  // Sync portfolio items to LocalStorage
  useEffect(() => {
    localStorage.setItem('luxe_portfolio_items', JSON.stringify(items));
    
    // Safety check: if active item was deleted, reset to first available
    if (!items.find(i => i.id === activeItem.id) && items.length > 0) {
      setActiveItem(items[0]);
    }
  }, [items]);

  // Sync contact info to LocalStorage
  useEffect(() => {
    localStorage.setItem('luxe_contact_info', JSON.stringify(contactInfo));
  }, [contactInfo]);

  const handleNavigate = (newView: ViewState) => {
    setView(newView);
  };

  const handleSelectProject = (item: PortfolioItem) => {
    setActiveItem(item);
    setView('HOME'); 
  };

  const handleUpdateItems = (updatedItems: PortfolioItem[]) => {
    setItems(updatedItems);
  };

  const handleUpdateContactInfo = (updatedInfo: ContactInfo) => {
    setContactInfo(updatedInfo);
  };

  // Next Video Logic
  const handleNext = () => {
    if (items.length === 0) return;
    const currentIndex = items.findIndex(item => item.id === activeItem.id);
    const nextIndex = (currentIndex + 1) % items.length;
    setActiveItem(items[nextIndex]);
  };

  // Previous Video Logic
  const handlePrev = () => {
    if (items.length === 0) return;
    const currentIndex = items.findIndex(item => item.id === activeItem.id);
    const prevIndex = (currentIndex - 1 + items.length) % items.length;
    setActiveItem(items[prevIndex]);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden select-none font-sans group/app">
      
      {/* 1. Main Screen Layer */}
      <div className="absolute inset-0 z-0">
        <EmbedPlayer 
          item={activeItem} 
          // Autoplay handled internally by EmbedPlayer on click now
          muted={isMuted}
          className="transition-opacity duration-1000 ease-in-out"
        />
      </div>

      {/* 2. Navigation Arrows (Only on Home View) */}
      {view === 'HOME' && items.length > 1 && (
        <>
          {/* Left Arrow */}
          <button 
            onClick={handlePrev}
            className="absolute left-0 top-0 bottom-0 w-24 z-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 group/nav cursor-pointer"
            aria-label="Previous Video"
          >
             <div className="p-4 bg-black/20 backdrop-blur-md rounded-full border border-white/10 group-hover/nav:bg-gold-500/80 group-hover/nav:border-gold-400 group-hover/nav:scale-110 transition-all duration-300">
               <ChevronLeft className="text-white w-8 h-8 md:w-10 md:h-10" strokeWidth={1.5} />
             </div>
          </button>

          {/* Right Arrow */}
          <button 
            onClick={handleNext}
            className="absolute right-0 top-0 bottom-0 w-24 z-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 group/nav cursor-pointer"
             aria-label="Next Video"
          >
             <div className="p-4 bg-black/20 backdrop-blur-md rounded-full border border-white/10 group-hover/nav:bg-gold-500/80 group-hover/nav:border-gold-400 group-hover/nav:scale-110 transition-all duration-300">
               <ChevronRight className="text-white w-8 h-8 md:w-10 md:h-10" strokeWidth={1.5} />
             </div>
          </button>
        </>
      )}

      {/* 3. Content Overlay Layers */}
      <PortfolioGrid 
        items={items} 
        isVisible={view === 'PORTFOLIO'} 
        onSelect={handleSelectProject} 
      />
      
      <InfoOverlay view={view} contactInfo={contactInfo} />

      {/* 4. Admin Panel Layer */}
      {view === 'ADMIN' && (
        <AdminPanel 
          items={items} 
          contactInfo={contactInfo}
          onUpdateItems={handleUpdateItems} 
          onUpdateContactInfo={handleUpdateContactInfo}
          onExit={() => setView('HOME')} 
        />
      )}

      {/* 5. Screen Info (Top Left) - Only visible on Home Screen */}
      {view === 'HOME' && activeItem && (
        <div className="absolute top-8 left-8 md:left-12 z-20 max-w-md animate-slide-up pointer-events-none">
           <div className="flex items-center gap-3 mb-2">
             <div className="h-[1px] w-8 bg-gold-400"></div>
             <span className="text-gold-400 text-xs font-bold tracking-[0.2em] uppercase">Đang Trình Chiếu</span>
           </div>
           <h1 className="text-3xl md:text-5xl font-serif text-white mb-2 leading-tight drop-shadow-md">
             {activeItem.title}
           </h1>
           <p className="text-white/70 text-sm md:text-base font-light border-l-2 border-white/20 pl-4 py-1">
             {activeItem.description}
           </p>
        </div>
      )}

      {/* Close button for Active Project if different from Intro Reel */}
      {view === 'HOME' && items.length > 0 && activeItem.id !== items[0].id && (
         <button 
           onClick={() => handleNavigate('PORTFOLIO')}
           className="absolute top-8 right-8 z-30 p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-gold-500 transition-colors"
         >
           <X size={24} />
         </button>
      )}

      {/* 6. Controls Layer (Always on top) */}
      <TVControls 
        currentView={view} 
        onNavigate={handleNavigate} 
        isMuted={isMuted}
        toggleMute={() => setIsMuted(!isMuted)}
        toggleFullscreen={toggleFullscreen}
      />
    </div>
  );
};

export default App;