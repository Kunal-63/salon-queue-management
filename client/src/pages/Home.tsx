import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const Home: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-[#1F2937] border border-gray-700/60 rounded-2xl p-8 text-center shadow-xl">
        <h1 className="text-2xl font-bold text-[#D4A017] tracking-wide">
          {t('routes.home')}
        </h1>
      </div>
    </div>
  );
};
