import React from 'react';
import { useParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export const MyStatus: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-[#1F2937] border border-gray-700/60 rounded-2xl p-8 text-center shadow-xl space-y-2">
        <h1 className="text-2xl font-bold text-[#D4A017] tracking-wide">
          {t('routes.status')}
        </h1>
        {id && (
          <p className="text-sm font-semibold text-gray-300">
            ID: <span className="text-[#D4A017]">{id}</span>
          </p>
        )}
      </div>
    </div>
  );
};
