import React from 'react';
import { ArrowUpRight, Terminal, Globe, Mail, Phone, MessageSquare } from 'lucide-react';
// @ts-ignore
import webdotLogo from '../assets/images/web.jpg';

interface NavbarProps {
  currentView: 'website' | 'command';
  onNavigate: (view: 'website' | 'command') => void;
  onBookConsultation: () => void;
  isAdmin?: boolean;
}

export default function Navbar({ currentView, onNavigate, onBookConsultation, isAdmin = false }: NavbarProps) {
  return (
    <header className="fixed top-0 w-full z-50 bg-[#11131b]/80 backdrop-blur-xl border-b border-white/10 shadow-sm">
      <nav className="flex justify-between items-center px-gutter py-4 w-full max-w-7xl mx-auto">
        <div 
          onClick={() => onNavigate('website')} 
          className="cursor-pointer flex items-center gap-3 group"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white rounded-xl overflow-hidden flex items-center justify-center p-0.5 shadow-lg shadow-primary/15 group-hover:scale-105 transition-all duration-300 border border-white/10">
            <img 
              src={webdotLogo || "/web.png"} 
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src !== window.location.origin + "/web.png") {
                  target.src = "/web.png";
                }
              }}
              alt="WEBDot Logo" 
              className="w-full h-full object-contain select-none pointer-events-none"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="text-base sm:text-lg font-display font-black tracking-widest text-on-surface uppercase group-hover:text-primary transition-colors duration-300">
            WEBDot
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a 
            href="#work" 
            onClick={(e) => {
              e.preventDefault();
              onNavigate('website');
              setTimeout(() => {
                document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="text-on-surface-variant font-medium text-sm hover:text-primary transition-colors duration-300"
          >
            Work
          </a>
          <a 
            href="#services" 
            onClick={(e) => {
              e.preventDefault();
              onNavigate('website');
              setTimeout(() => {
                document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="text-on-surface-variant font-medium text-sm hover:text-primary transition-colors duration-300"
          >
            Services
          </a>
          <a 
            href="#about" 
            onClick={(e) => {
              e.preventDefault();
              onNavigate('website');
              setTimeout(() => {
                document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="text-on-surface-variant font-medium text-sm hover:text-primary transition-colors duration-300"
          >
            About
          </a>
          <a 
            href="#contact" 
            onClick={(e) => {
              e.preventDefault();
              onNavigate('website');
              setTimeout(() => {
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="text-on-surface-variant font-medium text-sm hover:text-primary transition-colors duration-300"
          >
            Contact
          </a>
          {isAdmin && (
            <button
              onClick={() => onNavigate(currentView === 'website' ? 'command' : 'website')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                currentView === 'command'
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'bg-white/5 text-on-surface-variant border-white/10 hover:border-white/20'
              } transition-all`}
            >
              {currentView === 'command' ? (
                <>
                  <Globe className="w-3.5 h-3.5" />
                  <span>Agency Site</span>
                </>
              ) : (
                <>
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Command Portal</span>
                </>
              )}
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2 md:gap-3">
          {/* Quick Contact Icons */}
          <div className="flex items-center gap-1.5 md:gap-2 mr-1">
            <a 
              href="tel:+917620685718"
              title="Direct Phone Line: +91 7620685718"
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 hover:border-primary/20 transition-all active:scale-95"
            >
              <Phone className="w-4 h-4 text-primary" />
            </a>
            <a 
              href="mailto:nishantshewale69@gmail.com"
              title="Direct Email: nishantshewale69@gmail.com"
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 hover:border-primary/20 transition-all active:scale-95"
            >
              <Mail className="w-4 h-4 text-primary" />
            </a>
            <a 
              href="https://wa.me/917620685718"
              target="_blank"
              rel="noopener noreferrer"
              title="Instant WhatsApp Support: 7620685718"
              className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/30 transition-all active:scale-95 relative"
            >
              <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-400 border-2 border-[#11131b] rounded-full animate-ping"></span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-400 border-2 border-[#11131b] rounded-full"></span>
              <MessageSquare className="w-4 h-4 text-emerald-400" />
            </a>
          </div>

          <button 
            onClick={onBookConsultation}
            className="hidden sm:inline-block bg-primary-container text-on-primary-container px-4 md:px-5 py-2 rounded-full font-semibold text-xs md:text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary-container/25"
          >
            Book Consultation
          </button>
        </div>
      </nav>
    </header>
  );
}
