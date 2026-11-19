import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Play, Check, Coffee, User, Clock, Scissors } from 'lucide-react';

export const BarberView: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const { t } = useLanguage();

  const barberName = name || 'Ravi';
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<'idle' | 'started'>('idle');

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* Barber Header & Duty Toggle */}
      <div className="flex items-center justify-between bg-[#1F2937] border border-gray-700/60 rounded-2xl p-4 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#D4A017]/20 border border-[#D4A017]/40 flex items-center justify-center text-[#D4A017]">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base">{barberName}</h1>
            <p className="text-xs text-gray-400">{t('barberViewTitle')}</p>
          </div>
        </div>

        {/* Break toggle button */}
        <button
          onClick={() => setIsOnBreak(!isOnBreak)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
            isOnBreak
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          }`}
        >
          <Coffee className="w-3.5 h-3.5" />
          <span>{isOnBreak ? t('toggleOnBreak') : t('toggleAvailable')}</span>
        </button>
      </div>

      {/* Current Customer Card */}
      <div className="bg-[#1F2937] border border-gray-700/60 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-700/60">
          <span className="text-xs font-bold uppercase tracking-wider text-[#D4A017]">
            {t('currentServing')}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
            S-14
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">
              <User className="w-5 h-5 text-gray-300" />
            </div>
            <div>
              <p className="font-extrabold text-white text-lg">Rahul Verma</p>
              <p className="text-xs text-gray-400">Haircut · Beard trim</p>
            </div>
          </div>

          <div className="bg-gray-800/80 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-xs text-gray-400 flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-[#D4A017]" />
              <span>{t('timerSinceStart')}</span>
            </span>
            <span className="font-mono text-xl font-black text-white">
              {serviceStatus === 'started' ? '12:45' : '00:00'}
            </span>
          </div>
        </div>

        {/* Big Action Buttons [ Start ] -> [ Done ] */}
        <div className="pt-2">
          {serviceStatus === 'idle' ? (
            <button
              onClick={() => setServiceStatus('started')}
              className="w-full py-4 px-6 rounded-2xl bg-[#D4A017] hover:bg-[#E5AE1B] text-gray-950 font-black text-base shadow-lg flex items-center justify-center space-x-2 transition-all active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{t('startServiceBtn')}</span>
            </button>
          ) : (
            <button
              onClick={() => setServiceStatus('idle')}
              className="w-full py-4 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-black text-base shadow-lg flex items-center justify-center space-x-2 transition-all active:scale-95"
            >
              <Check className="w-6 h-6 stroke-[3]" />
              <span>{t('doneServiceBtn')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Next for you Card */}
      <div className="bg-[#1F2937]/70 border border-gray-700/50 rounded-2xl p-4 space-y-2">
        <span className="text-xs font-semibold text-gray-400">
          {t('nextForYou')}:
        </span>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-white text-sm">S-15 Kunal</p>
            <p className="text-xs text-gray-400">Haircut (30 min)</p>
          </div>
          <span className="text-xs text-[#D4A017] font-semibold">
            {t('expectedWaitTime')}: ~15 {t('minutesShort')}
          </span>
        </div>
      </div>
    </div>
  );
};
