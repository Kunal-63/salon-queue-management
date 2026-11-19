import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Clock, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';

export const MyStatus: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Test state simulation toggle
  const [simulationState, setSimulationState] = useState<'normal' | 'second' | 'called'>('normal');
  const [showCancelModal, setShowCancelModal] = useState(false);

  const token = id || 'S-14';
  const position = simulationState === 'second' ? 2 : simulationState === 'called' ? 0 : 4;
  const estimatedWait = simulationState === 'called' ? 0 : simulationState === 'second' ? 10 : 35;
  const assignedBarber = 'Ravi';

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* Simulation test bar */}
      <div className="p-2.5 rounded-xl bg-gray-800/80 border border-gray-700 flex items-center justify-between text-xs text-gray-400">
        <span>Dev State Switcher:</span>
        <div className="flex space-x-1">
          <button
            onClick={() => setSimulationState('normal')}
            className={`px-2 py-1 rounded transition-colors ${
              simulationState === 'normal' ? 'bg-[#D4A017] text-gray-950 font-bold' : 'bg-gray-700 text-white'
            }`}
          >
            4th
          </button>
          <button
            onClick={() => setSimulationState('second')}
            className={`px-2 py-1 rounded transition-colors ${
              simulationState === 'second' ? 'bg-[#D4A017] text-gray-950 font-bold' : 'bg-gray-700 text-white'
            }`}
          >
            2nd (Alert)
          </button>
          <button
            onClick={() => setSimulationState('called')}
            className={`px-2 py-1 rounded transition-colors ${
              simulationState === 'called' ? 'bg-[#D4A017] text-gray-950 font-bold' : 'bg-gray-700 text-white'
            }`}
          >
            Called (Gold)
          </button>
        </div>
      </div>

      {simulationState === 'called' ? (
        /* Full-screen Gold Called Alert */
        <div className="bg-[#D4A017] text-gray-950 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-fade-in">
          <div className="w-20 h-20 mx-auto rounded-full bg-gray-950/10 flex items-center justify-center animate-bounce">
            <CheckCircle className="w-12 h-12 text-gray-950" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              {t('itsYourTurnTitle')}
            </h1>
            <div className="text-5xl font-black my-4 tracking-wider bg-gray-950 text-[#D4A017] px-6 py-2 rounded-2xl shadow-xl inline-block">
              {token}
            </div>
            <p className="text-xl font-bold mt-2">
              {t('goToBarberInstructions', { barber: assignedBarber })}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* When 2nd in line: Warning banner */}
          {simulationState === 'second' && (
            <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 space-y-1 shadow-lg animate-pulse">
              <div className="flex items-center space-x-2 font-bold text-base">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <span>{t('startComingBanner')}</span>
              </div>
              <p className="text-xs text-amber-200/90 pl-7">
                {t('startComingSubtitle')}
              </p>
            </div>
          )}

          {/* Main Status Card */}
          <div className="bg-[#1F2937] border border-gray-700/60 rounded-3xl p-6 text-center space-y-6 shadow-xl">
            <div>
              <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
                {t('yourToken')}
              </span>
              <div className="text-5xl font-black text-[#D4A017] tracking-wider mt-1">
                {token}
              </div>
              <div className="inline-block mt-2 px-3 py-1 rounded-full bg-gray-800 text-gray-300 text-xs font-semibold">
                {t('positionSuffix', { pos: position })}
              </div>
            </div>

            {/* Circular countdown dial representation */}
            <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#374151"
                  strokeWidth="7"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#D4A017"
                  strokeWidth="7"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 * 0.35}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Clock className="w-5 h-5 text-[#D4A017] mb-1" />
                <span className="text-2xl font-black text-white">{estimatedWait}</span>
                <span className="text-xs text-gray-400">{t('minutesShort')}</span>
              </div>
            </div>

            <p className="text-xs text-gray-400">
              {t('circularCountdown', { time: estimatedWait })}
            </p>
          </div>

          {/* Cancel spot button */}
          <button
            onClick={() => setShowCancelModal(true)}
            className="w-full py-3 px-4 rounded-xl border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition-colors flex items-center justify-center space-x-2"
          >
            <XCircle className="w-4 h-4" />
            <span>{t('cancelMySpot')}</span>
          </button>
        </>
      )}

      {/* Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1F2937] border border-gray-700 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              {t('cancelConfirmDialogTitle')}
            </h3>
            <p className="text-xs text-gray-300">
              {t('cancelConfirmDialogBody')}
            </p>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 text-xs font-semibold"
              >
                {t('keepMySpot')}
              </button>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  navigate('/');
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                {t('confirmCancelSpot')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
