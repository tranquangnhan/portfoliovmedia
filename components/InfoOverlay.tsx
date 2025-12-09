import React from 'react';
import { ViewState, ContactInfo } from '../types';
import { Mail, Instagram, MapPin, Phone, Facebook } from 'lucide-react';

interface InfoOverlayProps {
  view: ViewState;
  contactInfo: ContactInfo;
}

const InfoOverlay: React.FC<InfoOverlayProps> = ({ view, contactInfo }) => {
  if (view !== 'ABOUT' && view !== 'CONTACT') return null;

  return (
    <div className="absolute inset-0 z-40 bg-cream/95 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
      <div className="max-w-2xl w-full text-center">
        
        {view === 'ABOUT' && (
          <div className="space-y-8">
            {/* Custom V MEDIA Logo Container */}
            <div className="w-40 h-40 mx-auto rounded-2xl p-1 border-2 border-gold-400 bg-black shadow-[0_0_30px_rgba(212,175,55,0.2)] flex items-center justify-center">
              <div className="flex flex-col items-center justify-center -mt-2">
                 {/* Stylized V Logo SVG */}
                 <svg width="80" height="70" viewBox="0 0 100 80" fill="white" xmlns="http://www.w3.org/2000/svg" className="mb-1">
                    {/* Right Arm - Solid */}
                    <path d="M55 75 L90 5 H70 L48 60 Z" />
                    
                    {/* Left Arm - Stylized Stripes */}
                    {/* Top bar */}
                    <path d="M10 5 H35 L38 12 H13 Z" />
                    {/* 2nd bar */}
                    <path d="M16 18 H41 L44 25 H19 Z" />
                    {/* 3rd bar */}
                    <path d="M22 31 H47 L50 38 H25 Z" />
                    {/* Bottom bar connecting to tip */}
                    <path d="M28 44 H53 L51 55 L45 70 H36 Z" /> 
                 </svg>
                 
                 {/* MEDIA Text */}
                 <span className="text-white font-sans font-bold text-xl tracking-[0.3em] ml-1">
                   MEDIA
                 </span>
              </div>
            </div>
            
            <div>
              <h2 className="text-4xl md:text-5xl font-serif text-gold-600 mb-4">VMEDIA</h2>
              <p className="text-lg md:text-xl text-neutral-600 font-light leading-relaxed">
                {contactInfo.bio}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gold-200">
              <div>
                <span className="block text-3xl font-serif text-gold-600">5+</span>
                <span className="text-xs uppercase tracking-widest text-neutral-500">Năm Kinh Nghiệm</span>
              </div>
              <div>
                <span className="block text-3xl font-serif text-gold-600">100+</span>
                <span className="text-xs uppercase tracking-widest text-neutral-500">Dự Án</span>
              </div>
              <div>
                <span className="block text-3xl font-serif text-gold-600">12</span>
                <span className="text-xs uppercase tracking-widest text-neutral-500">Giải Thưởng</span>
              </div>
            </div>
          </div>
        )}

        {view === 'CONTACT' && (
          <div className="space-y-10">
             <div>
              <h2 className="text-4xl md:text-5xl font-serif text-gold-600 mb-2">Liên Hệ</h2>
              <p className="text-neutral-500 font-light">Sẵn sàng cho các dự án toàn cầu.</p>
            </div>

            <div className="space-y-6">
              {contactInfo.email && (
                <a href={`mailto:${contactInfo.email}`} className="flex items-center justify-center gap-4 text-xl md:text-2xl text-neutral-700 hover:text-gold-600 transition-colors group">
                  <div className="p-3 bg-white rounded-full shadow-sm group-hover:shadow-md transition-all">
                    <Mail className="text-gold-500" />
                  </div>
                  {contactInfo.email}
                </a>
              )}
              
              {contactInfo.phone && (
                <a href={`tel:${contactInfo.phone}`} className="flex items-center justify-center gap-4 text-xl md:text-2xl text-neutral-700 hover:text-gold-600 transition-colors group">
                  <div className="p-3 bg-white rounded-full shadow-sm group-hover:shadow-md transition-all">
                    <Phone className="text-gold-500" />
                  </div>
                  {contactInfo.phone}
                </a>
              )}

              <div className="flex flex-wrap items-center justify-center gap-6 mt-4">
                {contactInfo.instagram && (
                  <a href={contactInfo.instagram.startsWith('http') ? contactInfo.instagram : `https://instagram.com/${contactInfo.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-lg text-neutral-700 hover:text-gold-600 transition-colors group">
                    <div className="p-3 bg-white rounded-full shadow-sm group-hover:shadow-md transition-all">
                      <Instagram className="text-gold-500" />
                    </div>
                    <span className="hidden md:inline">Instagram</span>
                  </a>
                )}
                
                {contactInfo.facebook && (
                  <a href={contactInfo.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-lg text-neutral-700 hover:text-gold-600 transition-colors group">
                    <div className="p-3 bg-white rounded-full shadow-sm group-hover:shadow-md transition-all">
                      <Facebook className="text-gold-500" />
                    </div>
                    <span className="hidden md:inline">Facebook</span>
                  </a>
                )}

                {contactInfo.zalo && (
                  <a href={`https://zalo.me/${contactInfo.zalo}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-lg text-neutral-700 hover:text-gold-600 transition-colors group">
                    <div className="p-3 bg-white rounded-full shadow-sm group-hover:shadow-md transition-all flex items-center justify-center">
                       {/* Custom Zalo Icon SVG */}
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gold-500 w-6 h-6">
                          <rect x="2" y="4" width="20" height="16" rx="4" stroke="currentColor" strokeWidth="2" />
                          <path d="M8 16V8L16 8V9.5L10 16H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                       </svg>
                    </div>
                    <span className="hidden md:inline">Zalo</span>
                  </a>
                )}
              </div>

              {contactInfo.address && (
                <div className="flex items-center justify-center gap-4 text-xl md:text-2xl text-neutral-700 group mt-4">
                  <div className="p-3 bg-white rounded-full shadow-sm group-hover:shadow-md transition-all">
                     <MapPin className="text-gold-500" />
                  </div>
                  {contactInfo.address}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default InfoOverlay;