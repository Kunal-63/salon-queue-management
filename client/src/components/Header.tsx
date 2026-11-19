import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Globe, Clock, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const location = useLocation();

  const navLinks = [
    { to: '/', label: t('routes.home') },
    { to: '/join', label: t('routes.join') },
    { to: '/status/S-14', label: t('routes.status') },
    { to: '/reception', label: t('routes.reception') },
    { to: '/barber/Ravi', label: t('routes.barber') },
    { to: '/display', label: t('routes.display') },
    { to: '/admin', label: t('routes.admin') },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#07120b]/95 backdrop-blur-md border-b border-[#F5C518]/25 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      {/* Top ambient gold timeline thread */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#F5C518] to-transparent opacity-80" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo & Loki Crest */}
          <Link to="/" className="flex items-center space-x-3.5 group">
            <div className="relative w-11 h-11 rounded-full p-0.5 bg-gradient-to-br from-[#F5C518] via-[#10B981] to-[#D4A017] shadow-[0_0_15px_rgba(245,197,24,0.35)] group-hover:shadow-[0_0_22px_rgba(0,255,135,0.6)] transition-all duration-300">
              <img
                src="/loki-crest.svg"
                alt="Loki Crest"
                className="w-full h-full rounded-full object-cover bg-[#091A12] group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF87] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#10B981] border border-[#081A11]"></span>
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="font-cinzel text-xl sm:text-2xl font-black tracking-wider text-[#F5C518] drop-shadow-[0_2px_10px_rgba(245,197,24,0.4)]">
                  LOKI
                </span>
                <span className="hidden sm:inline-block text-xs font-semibold uppercase tracking-widest text-emerald-400/90 font-sans border-l border-emerald-500/40 pl-2">
                  Luxe & Gold
                </span>
              </div>
              <span className="text-[10px] text-gray-400 font-medium tracking-tight flex items-center space-x-1">
                <Sparkles className="w-2.5 h-2.5 text-[#F5C518]" />
                <span>{t('salonSubtitle')}</span>
              </span>
            </div>
          </Link>

          {/* Right Action Controls: Open Badge & Language Switcher */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-medium shadow-inner">
              <Clock className="w-3.5 h-3.5 text-[#00FF87] animate-pulse" />
              <span>{t('openBadge')}</span>
            </div>

            <button
              onClick={toggleLanguage}
              data-testid="language-toggle"
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#0F261B] hover:bg-[#163827] text-[#F5C518] border border-[#F5C518]/40 hover:border-[#F5C518] text-xs sm:text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-[0_0_12px_rgba(245,197,24,0.3)] cursor-pointer"
              title="Toggle English / Gujarati"
            >
              <Globe className="w-4 h-4 text-[#00FF87]" />
              <span data-testid="current-language-label" className="tracking-wide">
                {language === 'en' ? 'ગુજરાતી' : 'English'}
              </span>
            </button>
          </div>
        </div>

        {/* 7 Route Navigation bar with Loki glow indicator */}
        <nav className="flex space-x-1.5 overflow-x-auto py-2.5 text-xs border-t border-emerald-900/40 scrollbar-none">
          {navLinks.map((link) => {
            const isActive =
              location.pathname === link.to ||
              (link.to.startsWith('/status') && location.pathname.startsWith('/status')) ||
              (link.to.startsWith('/barber') && location.pathname.startsWith('/barber'));

            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all duration-200 flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#F5C518] to-[#D4A017] text-[#07120B] font-bold shadow-[0_0_15px_rgba(245,197,24,0.4)] scale-102'
                    : 'text-gray-300 hover:text-[#F5C518] hover:bg-[#0E2619] border border-transparent hover:border-emerald-500/30'
                }`}
              >
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
