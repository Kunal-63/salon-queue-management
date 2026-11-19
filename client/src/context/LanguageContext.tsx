import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../locales/en.json';
import gu from '../locales/gu.json';

export type Language = 'en' | 'gu';

const translations: Record<Language, typeof en> = { en, gu };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('salon_lang');
      return (saved === 'gu' || saved === 'en') ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('salon_lang', lang);
    } catch {
      // storage unavailable fallback
    }
  };

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'gu' : 'en';
    setLanguage(nextLang);
  };

  const t = (path: string): string => {
    const current = translations[language] || translations.en;
    const parts = path.split('.');
    let value: any = current;
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        // Fallback to English
        let fallback: any = translations.en;
        for (const fbPart of parts) {
          if (fallback && typeof fallback === 'object' && fbPart in fallback) {
            fallback = fallback[fbPart];
          } else {
            return path;
          }
        }
        return typeof fallback === 'string' ? fallback : path;
      }
    }
    return typeof value === 'string' ? value : path;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
