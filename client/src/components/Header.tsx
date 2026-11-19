import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Scissors, Globe } from 'lucide-react';

export const Header: React.FC = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const location = useLocation();

  const navLinks = [
    { to: '/', label: t('navHome') },
    { to: '/join', label: t('navJoin') },
    { to: '/status/S-1', label: t('navStatus') },
    { to: '/reception', label: t('navReception') },
    { to: '/barber/Ravi', label: t('navBarber') },
    { to: '/display', label: t('navDisplay') },
    { to: '/admin', label: t('navAdmin') },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#1F2937] border-b border-gray-700/60 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4A017] to-[#B3860F] flex items-center justify-center text-gray-900 shadow-md group-hover:scale-105 transition-transform">
              <Scissors className="w-5 h-5 text-gray-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-wide">
                  {t('salonName')}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium border border-emerald-500/30">
                  {t('openStatus')}
                </span>
              </div>
              <p className="text-xs text-gray-400 hidden sm:block">
                {t('tagline')}
              </p>
            </div>
          </Link>

          {/* Right Action: Language Toggle */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-[#D4A017] border border-[#D4A017]/40 text-sm font-semibold transition-colors shadow-sm"
              title="Toggle English / Gujarati"
            >
              <Globe className="w-4 h-4 text-[#D4A017]" />
              <span>{language === 'en' ? 'ગુજરાતી' : 'English'}</span>
            </button>
          </div>
        </div>

        {/* Horizontal screen switcher for testing and navigation */}
        <div className="flex space-x-1 overflow-x-auto py-2 text-xs border-t border-gray-800/80 scrollbar-none">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to || (link.to.startsWith('/status') && location.pathname.startsWith('/status'));
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-[#D4A017] text-gray-950 font-bold shadow'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
};
