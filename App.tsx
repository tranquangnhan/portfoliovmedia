import React, { useState, useEffect } from 'react';
import TVControls from './components/TVControls';
import EmbedPlayer from './components/EmbedPlayer';
import PortfolioGrid from './components/PortfolioGrid';
import InfoOverlay from './components/InfoOverlay';
import AdminPanel from './components/AdminPanel';
import type { ViewState, PortfolioItem, ContactInfo } from './types';
import { INITIAL_DATABASE } from './database';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { db } from './firebaseConfig';
import { ref, onValue, set } from 'firebase/database';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  
  // Initialize with fallback database.ts to prevent blank screen while loading Firebase
  const [items, setItems] = useState<PortfolioItem[]>(INITIAL_DATABASE?.portfolioItems || []);
  
  const [contactInfo, setContactInfo] = useState<ContactInfo>(INITIAL_DATABASE?.contactInfo || {
    bio: '', email: '', phone: '', instagram: '', facebook: '', zalo: '', address: ''
  });

  const [activeItem, setActiveItem] = useState<PortfolioItem>(items[0] || null);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoadingFirebase, setIsLoadingFirebase] = useState(true);

  // Swipe State
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // --- FIREBASE SYNC ---
  useEffect(() => {
    // Reference to 'portfolioItems' in Firebase
    const itemsRef = ref(db, 'portfolioItems');
    
    // Listen for changes
    const unsubscribeItems = onValue(itemsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setItems(data);
        // If the currently active item was deleted/changed, or on first load, reset active item
        setActiveItem((prev) => {
          const exists = data.find((i: PortfolioItem) => i.id === prev?.id);
          return exists || data[0] || null;
        });
      } else {
        // If DB is empty (new project), set initial data to Firebase
        // This acts as a seeder
        set(itemsRef, INITIAL_DATABASE.portfolioItems);
      }
      setIsLoadingFirebase(false);
    }, (error) => {
      console.error("Firebase read failed:", error);
      // Fallback to local is already handled by initial state, just stop loading
      setIsLoadingFirebase(false);
    });

    // Reference to 'contactInfo' in Firebase
    const contactRef = ref(db, 'contactInfo');
    const unsubscribeContact = onValue(contactRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setContactInfo((prev) => ({ ...prev, ...data })); // Merge to ensure new fields
      } else {
         // Seed initial contact info if empty
         set(contactRef, INITIAL_DATABASE.contactInfo);
      }
    });

    return () => {
      unsubscribeItems();
      unsubscribeContact();
    };
  }, []);

  // Check URL Hash for Admin Access
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#/adminvmedia' || window.location.pathname.endsWith('/adminvmedia')) {
        setView('ADMIN');
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // SEO & Social Share Update Effect
  useEffect(() => {
    // Helper to update or create OG tags
    const updateOG = (property: string, content: string) => {
      let element = document.querySelector(`meta[property="${property}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    const updateMeta = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    if (contactInfo.seoTitle) {
      document.title = contactInfo.seoTitle;
      updateOG('og:title', contactInfo.seoTitle);
    }
    
    if (contactInfo.seoDescription) {
      updateMeta('description', contactInfo.seoDescription);
      updateOG('og:description', contactInfo.seoDescription);
    }
    
    if (contactInfo.seoKeywords) {
      updateMeta('keywords', contactInfo.seoKeywords);
    }

    // Set OG Image (Use first portfolio item thumbnail or a default)
    if (items.length > 0 && items[0].thumbnail) {
      updateOG('og:image', items[0].thumbnail);
    }

    updateOG('og:url', window.location.href);
    updateOG('og:type', 'website');

  }, [contactInfo, items]);

  const handleNavigate = (newView: ViewState) => {
    setView(newView);
    if (view === 'ADMIN' && newView !== 'ADMIN') {
      window.history.pushState(null, '', window.location.pathname);
    }
  };

  const handleSelectProject = (item: PortfolioItem) => {
    setActiveItem(item);
    setView('HOME'); 
  };

  // UPDATE DATA TO FIREBASE
  const handleUpdateItems = (updatedItems: PortfolioItem[]) => {
    // Optimistic update
    setItems(updatedItems); 
    // Write to Firebase
    set(ref(db, 'portfolioItems'), updatedItems).catch(err => {
      console.error("Firebase write error:", err);
      alert("Lỗi lưu dữ liệu lên Firebase. Vui lòng kiểm tra cấu hình.");
    });
  };

  const handleUpdateContactInfo = (updatedInfo: ContactInfo) => {
    // Optimistic update
    setContactInfo(updatedInfo);
    // Write to Firebase
    set(ref(db, 'contactInfo'), updatedInfo).catch(err => {
      console.error("Firebase write error:", err);
      alert("Lỗi lưu dữ liệu lên Firebase. Vui lòng kiểm tra cấu hình.");
    });
  };

  const handleNext = () => {
    if (items.length === 0) return;
    const currentIndex = items.findIndex(item => item.id === activeItem?.id);
    const nextIndex = (currentIndex + 1) % items.length;
    setActiveItem(items[nextIndex]);
  };

  const handlePrev = () => {
    if (items.length === 0) return;
    const currentIndex = items.findIndex(item => item.id === activeItem?.id);
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

  // Touch Handlers for Swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); // Reset
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    // Swipe Up (Next Video)
    if (distance > minSwipeDistance) {
      handleNext();
    }
    
    // Swipe Down (Previous Video)
    if (distance < -minSwipeDistance) {
      handlePrev();
    }
  };

  return (
    // Global Scaling Container with Swipe Handlers
    <div 
      className="fixed inset-0 w-screen h-screen bg-black overflow-hidden touch-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
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
          <div className="absolute bottom-20 left-6 md:top-8 md:left-12 z-20 max-w-[80%] md:max-w-md animate-slide-up pointer-events-none">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-[1px] w-6 md:w-8 bg-gold-400"></div>
              <span className="text-gold-400 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">Đang Trình Chiếu</span>
            </div>
            <h1 className="text-xl md:text-5xl font-serif text-white mb-2 leading-tight drop-shadow-md">
              {activeItem.title}
            </h1>
            <p className="text-white/70 text-xs md:text-base font-light border-l-2 border-white/20 pl-4 py-1 hidden md:block">
              {activeItem.description}
            </p>
          </div>
        )}

        {view === 'HOME' && items.length > 0 && (
          <button 
            onClick={() => handleNavigate('PORTFOLIO')}
            className="absolute top-6 left-6 md:hidden z-30 p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-gold-500 transition-colors"
            title="Quay lại danh sách"
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