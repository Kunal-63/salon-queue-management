import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Scissors, Clock, Bell } from 'lucide-react';

export const DisplayTV: React.FC = () => {
  const { t } = useLanguage();
  const [newlyCalled] = useState<string | null>('S-12');

  const barberRows = [
    { name: 'Ravi', nowServing: 'S-11', service: 'Haircut', status: 'busy' },
    { name: 'Amit', nowServing: 'S-12', service: 'Beard trim', status: 'busy' },
    { name: 'Imran', nowServing: null, service: null, status: 'free' },
  ];

  const upNextTokens = [
    { token: 'S-13', wait: 15 },
    { token: 'S-14', wait: 30 },
    { token: 'S-15', wait: 45 },
    { token: 'S-16', wait: 60 },
    { token: 'S-17', wait: 75 },
  ];

  return (
    <div className="min-h-screen bg-[#111827] text-white p-6 lg:p-10 space-y-8">
      {/* Newly Called Flashing Banner */}
      {newlyCalled && (
        <div className="bg-[#D4A017] text-gray-950 px-6 py-4 rounded-2xl flex items-center justify-between shadow-2xl animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gray-950 text-[#D4A017] flex items-center justify-center font-black">
              <Bell className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black">
                {t('callingAlert', { token: 'S-12', barber: 'Amit' })}
              </p>
            </div>
          </div>
          <span className="text-3xl font-black bg-gray-950 text-[#D4A017] px-4 py-1 rounded-xl">
            S-12
          </span>
        </div>
      )}

      {/* Main TV Layout: Left (Now Serving Rows) & Right (Up Next 5 Tokens) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Now Serving per Barber (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center space-x-3 pb-2 border-b border-gray-700/60">
            <Scissors className="w-6 h-6 text-[#D4A017]" />
            <h2 className="text-2xl font-black tracking-wide uppercase text-[#D4A017]">
              {t('nowServingCol')}
            </h2>
          </div>

          <div className="space-y-4">
            {barberRows.map((barber) => (
              <div
                key={barber.name}
                className="bg-[#1F2937] border-2 border-gray-700/80 rounded-3xl p-6 flex items-center justify-between shadow-xl"
              >
                <div className="flex items-center space-x-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4A017] to-[#B3860F] flex items-center justify-center text-gray-950 font-black text-2xl shadow-md">
                    {barber.name[0]}
                  </div>
                  <div>
                    <h3 className="text-3xl font-extrabold text-white">
                      {barber.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {barber.status === 'busy' ? barber.service : t('statusFree')}
                    </p>
                  </div>
                </div>

                <div>
                  {barber.nowServing ? (
                    <div className="text-right">
                      <span className="text-xs uppercase font-bold tracking-wider text-gray-400 block">
                        {t('nowServingCol')}
                      </span>
                      <span className="text-5xl font-black text-[#D4A017] tracking-wider">
                        {barber.nowServing}
                      </span>
                    </div>
                  ) : (
                    <span className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-sm font-bold">
                      {t('statusFree')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Up Next List of 5 Tokens (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center space-x-3 pb-2 border-b border-gray-700/60">
            <Clock className="w-6 h-6 text-[#D4A017]" />
            <h2 className="text-2xl font-black tracking-wide uppercase text-white">
              {t('upNextCol')}
            </h2>
          </div>

          <div className="bg-[#1F2937] border-2 border-gray-700/80 rounded-3xl p-5 space-y-3 shadow-xl">
            <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">
              {t('upNextTokensTitle')}
            </p>

            {upNextTokens.map((item, idx) => (
              <div
                key={item.token}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-800/80 border border-gray-700"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-7 h-7 rounded-full bg-gray-900 text-gray-400 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-2xl font-black text-white tracking-wider">
                    {item.token}
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#D4A017]">
                  ~{item.wait} {t('minutesShort')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
