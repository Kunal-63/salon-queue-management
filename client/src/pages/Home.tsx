import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Users, Clock, ArrowRight } from 'lucide-react';

export const Home: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Initial dummy state for setup
  const barbers = [
    { name: 'Ravi', status: 'busy' },
    { name: 'Amit', status: 'free' },
    { name: 'Imran', status: 'break' },
  ];

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-6">
      {/* Live Status Card */}
      <div className="bg-[#1F2937] border border-gray-700/60 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-gray-700/50">
          <span className="text-xs uppercase tracking-wider text-[#D4A017] font-semibold">
            {t('homeLiveCardTitle')}
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        <div className="py-6 text-center space-y-2">
          <div className="flex items-center justify-center space-x-3 text-4xl font-extrabold text-white">
            <Users className="w-8 h-8 text-[#D4A017]" />
            <span>6</span>
          </div>
          <p className="text-lg font-medium text-gray-200">
            {t('peopleWaiting')}
          </p>
          <div className="flex items-center justify-center space-x-1 text-sm text-gray-400">
            <Clock className="w-4 h-4 text-[#D4A017]" />
            <span>{t('aboutTime', { time: '50' })}</span>
          </div>
        </div>

        {/* Barber Chips */}
        <div className="pt-4 border-t border-gray-700/50">
          <p className="text-xs text-gray-400 mb-3 font-medium">
            {t('barbersOnDuty')}
          </p>
          <div className="flex flex-wrap gap-2">
            {barbers.map((b) => {
              const statusColor =
                b.status === 'free'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : b.status === 'busy'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30';

              const statusText =
                b.status === 'free'
                  ? t('statusFree')
                  : b.status === 'busy'
                  ? t('statusBusy')
                  : t('statusBreak');

              return (
                <div
                  key={b.name}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 ${statusColor}`}
                >
                  <span className="text-white">{b.name}</span>
                  <span className="opacity-75">({statusText})</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Big Gold Button to Join Queue */}
      <button
        onClick={() => navigate('/join')}
        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#D4A017] to-[#B3860F] hover:from-[#E5AE1B] hover:to-[#C29012] text-gray-950 font-bold text-lg shadow-lg hover:shadow-[#D4A017]/20 flex items-center justify-center space-x-2 transition-all transform active:scale-95"
      >
        <span>{t('joinQueue')}</span>
        <ArrowRight className="w-5 h-5 font-bold" />
      </button>
    </div>
  );
};
