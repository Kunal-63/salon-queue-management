import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const DisplayTV: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-[#1F2937] border-2 border-gray-700/80 rounded-3xl p-12 text-center shadow-2xl">
        <h1 className="text-3xl font-black text-[#D4A017] tracking-wider uppercase">
          {t('routes.display')}
        </h1>
      </div>
    </div>
  );
};
