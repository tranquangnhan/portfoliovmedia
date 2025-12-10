import React, { useState } from 'react';
import type { ViewState } from '../types';
import { Home, Grid, User, Mail, Maximize2, Volume2, VolumeX, Menu, X } from 'lucide-react';

interface TVControlsProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  isMuted: boolean;
  toggleMute: () => void;
  toggleFullscreen: () => void;
}

const TVControls: React.FC<TVControlsProps> = ({ 
  currentView, 
  onNavigate, 
  isMuted, 
  toggleMute, 
  toggleFullscreen 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navItems = [
    { id: 'HOME', icon: Home, label: 'Trang Chủ' },
    { id: 'PORTFOLIO', icon: Grid, label: 'Dự Án' },
    { id: 'ABOUT', icon: User, label: 'Hồ Sơ' },
    { id: 'CONTACT', icon: Mail, label: 'Liên Hệ' },
  ];

  return (
    <>
      {/* 
        DESKTOP INTERACTION (Hidden on mobile)
        Positioned at bottom-12 (approx 48px) to sit just above the YouTube control bar.
      */}
      <div className="hidden md:flex fixed bottom-12 left-1/2 -translate-x-1/2 z-50 flex-col items-center justify-end pb-2 group">
        
        {/* The Controls Bar */}
        <div className="
          mb-2
          backdrop-blur-xl 
          bg-white/90 
          border border-white/50 
          shadow-[0_8px_32px_rgba(212,175,55,0.15)] 
          rounded-2xl 
          px-8 py-3 
          flex items-center gap-8
          
          transform translate-y-8 opacity-0 pointer-events-none
          group-hover:translate-y-0 group-hover:opacity-100 group-hover:pointer-events-auto
          
          transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
          w-auto
        ">
          {/* Navigation Group */}
          <div className="flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id as ViewState)}
                  className="group/btn relative flex flex-col items-center justify-center gap-1 min-w-[3rem]"
                  title={item.label}
                >
                  <div className={`
                    p-2.5 rounded-full transition-all duration-300 ease-out
                    ${isActive 
                      ? 'bg-gold-500 text-white shadow-[0_0_20px_rgba(212,175,55,0.5)] ring-2 ring-gold-100/50' 
                      : 'text-neutral-500 hover:text-gold-600 hover:bg-gold-50'}
                  `}>
                    <Icon size={24} strokeWidth={isActive ? 2 : 1.5} />
                  </div>
                  
                  {/* Active Indicator Dot (Static) */}
                  {isActive && (
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold-600/50" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Separator */}
          <div className="w-px h-8 bg-neutral-300/50" />

          {/* Utility Group */}
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleMute}
              className="text-neutral-500 hover:text-gold-600 transition-colors p-2 hover:bg-gold-50 rounded-full active:scale-95"
              title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
            >
              {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
            </button>
            <button 
              onClick={toggleFullscreen}
              className="text-neutral-500 hover:text-gold-600 transition-colors p-2 hover:bg-gold-50 rounded-full active:scale-95"
              title="Toàn màn hình"
            >
              <Maximize2 size={22} />
            </button>
          </div>
        </div>
        
        {/* Brand Watermark / Handle */}
        <div className="transition-all duration-500 group-hover:opacity-0 group-hover:translate-y-4">
          <div className="bg-white/10 backdrop-blur-md px-4 py-1 rounded-full border border-white/20">
            <span className="text-[10px] tracking-[0.4em] font-serif text-white/60 font-medium uppercase">
              Menu
            </span>
          </div>
        </div>
      </div>

      {/* 
        MOBILE INTERACTION
        Friendly "Remote Control" Style
      */}
      <div className="md:hidden">
         {/* Toggle Button - Floating at bottom right */}
         <button 
           onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
           className={`
             fixed bottom-8 right-6 z-50 
             w-14 h-14 rounded-full 
             flex items-center justify-center 
             shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md transition-all duration-300
             border border-white/50
             ${isMobileMenuOpen ? 'bg-gold-500 text-white rotate-90 scale-110' : 'bg-white/80 text-neutral-800 hover:scale-105 active:scale-95'}
           `}
         >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
         </button>

         {/* Menu Overlay - Remote Control Card */}
         <div className={`
           fixed bottom-24 right-6 z-50 w-64
           bg-white/90 backdrop-blur-xl border border-white/50
           rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)]
           p-4
           transition-all duration-300 ease-out origin-bottom-right
           ${isMobileMenuOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-12 pointer-events-none'}
         `}>
             {/* Navigation Grid (2x2) for larger touch targets */}
             <div className="grid grid-cols-2 gap-3 mb-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id as ViewState);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`
                        flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-all duration-200
                        border
                        ${isActive 
                          ? 'bg-gold-500 text-white border-gold-400 shadow-lg shadow-gold-500/30' 
                          : 'bg-white/50 text-neutral-600 border-white/60 hover:bg-white hover:shadow-sm active:scale-95'
                        }
                      `}
                    >
                       <Icon size={24} strokeWidth={isActive ? 2 : 1.5} />
                       <span className="text-xs font-bold tracking-wide">{item.label}</span>
                    </button>
                  );
                })}
             </div>
             
             {/* Divider */}
             <div className="w-12 h-1 bg-neutral-200 mx-auto rounded-full mb-4" />
             
             {/* Utilities Row */}
             <div className="flex gap-3">
                <button 
                  onClick={toggleMute}
                  className={`
                    flex-1 py-3 rounded-2xl flex items-center justify-center gap-2
                    transition-all active:scale-95 border
                    ${isMuted ? 'bg-red-50 text-red-500 border-red-100' : 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-white'}
                  `}
                >
                   {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <button 
                  onClick={toggleFullscreen}
                  className="flex-1 py-3 bg-neutral-100 text-neutral-600 border border-neutral-200 rounded-2xl flex items-center justify-center transition-all active:scale-95 hover:bg-white"
                >
                   <Maximize2 size={20} />
                </button>
             </div>
         </div>
      </div>
    </>
  );
};

export default TVControls;