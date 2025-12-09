import React, { useState, useEffect } from 'react';
import TVControls from './components/TVControls';
import EmbedPlayer from './components/EmbedPlayer';
import PortfolioGrid from './components/PortfolioGrid';
import InfoOverlay from './components/InfoOverlay';
import AdminPanel from './components/AdminPanel';
import type { ViewState, PortfolioItem, ContactInfo } from './types';
import { INITIAL_DATABASE } from './database';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  
  // Initialize from LocalStorage OR fall back to database.ts
  const [items, setItems] = useState<PortfolioItem[]>(() => {
    try {
      const saved = localStorage.getItem('luxe_portfolio_items');
      return saved ? JSON.parse(saved) : (INITIAL_DATABASE?.portfolioItems || []);
    } catch (e) {
      return INITIAL_DATABASE?.portfolioItems || [];
    }
  });

  const [contactInfo, setContactInfo] = useState<ContactInfo>(() => {
    try {
      const saved = localStorage.getItem('luxe_contact_info');
      if (saved) {
        // Merge saved data with initial structure to ensure new fields (like facebook/zalo) exist
        return { ...(INITIAL_DATABASE?.contactInfo || {}), ...JSON.parse(saved) };
      }
      return INITIAL_DATABASE?.contactInfo || {
        bio: '', email: '', phone: '', instagram: '', facebook: '', zalo: '', address: ''
      };
    } catch (e) {
      return INITIAL_DATABASE?.contactInfo || {
        bio: '', email: '', phone: '', instagram: '', facebook: '', zalo: '', address: ''
      };
    }
  });

  const [activeItem, setActiveItem] = useState<PortfolioItem>(items[0] || null);
  const [isMuted, setIsMuted] = useState(false);

  // Check URL Hash for Admin Access on Mount & Change
  useEffect(() => {
    const checkHash = () => {
      // Check if the URL ends with /adminvmedia (path) or has the hash #/adminvmedia
      if (window.location.hash === '#/adminvmedia' || window.location.pathname.endsWith('/adminvmedia')) {
        setView('ADMIN');
      }
    };
    
    // Check initially
    checkHash();

    // Add listener
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // SEO Update Effect
  useEffect(() => {
    if (contactInfo.seoTitle) document.title = contactInfo.seoTitle;
    
    const updateMeta = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    if (contactInfo.seoDescription) updateMeta('description', contactInfo.seoDescription);
    if (contactInfo.seoKeywords) updateMeta('keywords', contactInfo.seoKeywords);
  }, [contactInfo]);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('luxe_portfolio_items', JSON.stringify(items));
    if (items.length > 0 && !items.find(i => i.id === activeItem?.id)) {
      setActiveItem(items[0]);
    }
  }, [items]);

  useEffect(() => {
    localStorage.setItem('luxe_contact_info', JSON.stringify(contactInfo));
  }, [contactInfo]);

  const handleNavigate = (newView: ViewState) => {
    setView(newView);
    // Clear admin hash if leaving admin
    if (view === 'ADMIN' && newView !== 'ADMIN') {
      window.history.pushState(null, '', window.location.pathname);
    }
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

  const handleNext = () => {
    if (items.length === 0) return;
    const currentIndex = items.findIndex(item => item.id === activeItem.id);
    const nextIndex = (currentIndex + 1) % items.length;
    setActiveItem(items[nextIndex]);
  };

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
    // Global Scaling Container
    // We set width/height to 125% and scale to 0.8 (100/125 = 0.8) to shrink the interface while keeping it full screen
    <div className="fixed inset-0 w-screen h-screen bg-black overflow-hidden">
      <div className="w-[125%] h-[125%] origin-top-left transform scale-[0.8] relative font-sans select-none group/app">
        
        <div className="absolute inset-0 z-0">
          <EmbedPlayer 
            item={activeItem} 
            muted={isMuted}
            className="transition-opacity duration-1000 ease-in-out"
          />
        </div>

        {view === 'HOME' && items.length > 1 && (
          <>
            {/* 
              PREV/NEXT BUTTONS
              Added bottom-24 to stop at ~96px from bottom, leaving space for YouTube scrubber 
            */}
            <button 
              onClick={handlePrev}
              className="hidden md:flex absolute left-0 top-0 bottom-24 w-24 z-30 items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 group/nav cursor-pointer"
              aria-label="Previous Video"
            >
              <div className="p-4 bg-black/20 backdrop-blur-md rounded-full border border-white/10 group-hover/nav:bg-gold-500/80 group-hover/nav:border-gold-400 group-hover/nav:scale-110 transition-all duration-300">
                <ChevronLeft className="text-white w-8 h-8 md:w-10 md:h-10" strokeWidth={1.5} />
              </div>
            </button>

            <button 
              onClick={handleNext}
              className="hidden md:flex absolute right-0 top-0 bottom-24 w-24 z-30 items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 group/nav cursor-pointer"
              aria-label="Next Video"
            >
              <div className="p-4 bg-black/20 backdrop-blur-md rounded-full border border-white/10 group-hover/nav:bg-gold-500/80 group-hover/nav:border-gold-400 group-hover/nav:scale-110 transition-all duration-300">
                <ChevronRight className="text-white w-8 h-8 md:w-10 md:h-10" strokeWidth={1.5} />
              </div>
            </button>
          </>
        )}

        <PortfolioGrid 
          items={items} 
          isVisible={view === 'PORTFOLIO'} 
          onSelect={handleSelectProject} 
        />
        
        <InfoOverlay view={view} contactInfo={contactInfo} />

        {view === 'ADMIN' && (
          <AdminPanel 
            items={items} 
            contactInfo={contactInfo}
            onUpdateItems={handleUpdateItems} 
            onUpdateContactInfo={handleUpdateContactInfo}
            onExit={() => handleNavigate('HOME')} 
          />
        )}

        {view === 'HOME' && activeItem && (
          <div className="absolute top-6 left-6 md:top-8 md:left-12 z-20 max-w-[70%] md:max-w-md animate-slide-up pointer-events-none">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-[1px] w-6 md:w-8 bg-gold-400"></div>
              <span className="text-gold-400 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">Đang Trình Chiếu</span>
            </div>
            <h1 className="text-2xl md:text-5xl font-serif text-white mb-2 leading-tight drop-shadow-md">
              {activeItem.title}
            </h1>
            <p className="text-white/70 text-xs md:text-base font-light border-l-2 border-white/20 pl-4 py-1 hidden md:block">
              {activeItem.description}
            </p>
          </div>
        )}

        {view === 'HOME' && items.length > 0 && activeItem?.id !== items[0].id && (
          <button 
            onClick={() => handleNavigate('PORTFOLIO')}
            className="absolute top-6 right-6 md:top-8 md:right-8 z-30 p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-gold-500 transition-colors"
          >
            <X size={20} className="md:w-6 md:h-6" />
          </button>
        )}

        <TVControls 
          currentView={view} 
          onNavigate={handleNavigate} 
          isMuted={isMuted}
          toggleMute={() => setIsMuted(!isMuted)}
          toggleFullscreen={toggleFullscreen}
        />
      </div>
    </div>
  );
};

export default App;