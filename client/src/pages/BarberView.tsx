import React from 'react';
import { useParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export const BarberView: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const { t } = useLanguage();

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-[#1F2937] border border-gray-700/60 rounded-2xl p-8 text-center shadow-xl space-y-2">
        <h1 className="text-2xl font-bold text-[#D4A017] tracking-wide">
          {t('routes.barber')}
        </h1>
        {name && (
          <p className="text-sm font-semibold text-gray-300">
            {name}
          </p>
        )}
      </div>
    </div>
  );
};
