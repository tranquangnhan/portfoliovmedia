import React from 'react';
import { Home, Grid, User, Mail, Maximize2, Volume2, VolumeX, Lock } from 'lucide-react';
import { ViewState } from '../types';

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
  
  const navItems = [
    { id: 'HOME', icon: Home, label: 'Trang Chủ' },
    { id: 'PORTFOLIO', icon: Grid, label: 'Dự Án' },
    { id: 'ABOUT', icon: User, label: 'Hồ Sơ' },
    { id: 'CONTACT', icon: Mail, label: 'Liên Hệ' },
  ];

  return (
    // Sensor Area: Fixed at bottom, height 120px (h-32), centered items
    <div className="fixed bottom-0 left-0 w-full h-32 z-50 flex justify-center items-end pb-6 group">
      
      {/* Hover Gradient Overlay - Only visible on hover to indicate active area */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* The Controls Bar */}
      <div className="
        relative
        backdrop-blur-xl 
        bg-white/90 
        border border-white/50 
        shadow-[0_8px_32px_rgba(212,175,55,0.15)] 
        rounded-2xl 
        px-8 py-3 
        flex items-center gap-8
        
        transform translate-y-[150%] opacity-0 
        group-hover:translate-y-0 group-hover:opacity-100
        
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
                    ? 'bg-gold-500 text-white shadow-lg shadow-gold-500/30 -translate-y-2 scale-110' 
                    : 'text-neutral-500 hover:text-gold-600 hover:bg-gold-100/50 hover:-translate-y-1'}
                `}>
                  <Icon size={24} strokeWidth={isActive ? 2 : 1.5} />
                </div>
                
                {/* Active Indicator Dot */}
                {isActive && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold-600 shadow-sm animate-pulse" />
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
            className="text-neutral-500 hover:text-gold-600 transition-colors p-2 hover:bg-gold-50 rounded-full hover:scale-105 active:scale-95"
            title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
          >
            {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
          </button>
          <button 
            onClick={toggleFullscreen}
            className="text-neutral-500 hover:text-gold-600 transition-colors p-2 hover:bg-gold-50 rounded-full hover:scale-105 active:scale-95"
            title="Toàn màn hình"
          >
            <Maximize2 size={22} />
          </button>
          {/* Admin Button */}
          <button 
            onClick={() => onNavigate('ADMIN')}
            className={`text-neutral-500 hover:text-gold-600 transition-colors p-2 hover:bg-gold-50 rounded-full hover:scale-105 active:scale-95 ${currentView === 'ADMIN' ? 'text-gold-600' : ''}`}
            title="Quản trị viên"
          >
            <Lock size={18} />
          </button>
        </div>
      </div>
      
      {/* Brand Watermark (Only visible when controls are hidden) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center transition-all duration-500 group-hover:opacity-0 group-hover:translate-y-4 pointer-events-none">
        <span className="text-[10px] tracking-[0.4em] font-serif text-white/40 font-medium uppercase">
          LuxeFrame Control
        </span>
      </div>
    </div>
  );
};

export default TVControls;