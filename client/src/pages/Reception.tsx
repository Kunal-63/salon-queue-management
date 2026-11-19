import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { UserPlus, AlertCircle, X, Scissors } from 'lucide-react';

export const Reception: React.FC = () => {
  const { t } = useLanguage();
  const [showWalkInModal, setShowWalkInModal] = useState(false);

  // Tablet landscape layout with dummy data for initial setup
  const barbers = [
    { name: 'Ravi', status: 'busy', currentToken: 'S-11', customer: 'Rahul', timeLeft: 12 },
    { name: 'Amit', status: 'free', currentToken: null, customer: null, timeLeft: 0 },
    { name: 'Imran', status: 'break', currentToken: null, customer: null, timeLeft: 0 },
  ];

  const waitingList = [
    { token: 'S-12', name: 'Vikram Patel', services: ['Haircut', 'Beard trim'], barber: 'Any', waitMinutes: 20 },
    { token: 'S-13', name: 'Suresh Shah', services: ['Hair spa'], barber: 'Ravi', waitMinutes: 35 },
    { token: 'S-14', name: 'Kunal Joshi', services: ['Haircut'], barber: 'Amit', waitMinutes: 50 },
    { token: 'S-15', name: 'Manish Mehta', services: ['Hair color'], barber: 'Any', waitMinutes: 65 }, // > 60 min (amber)
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header Row with Add Walk-in */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-700/60">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">
            {t('receptionDashboardTitle')}
          </h1>
          <p className="text-xs text-gray-400">Tablet / Reception Desk Mode</p>
        </div>

        <button
          onClick={() => setShowWalkInModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#D4A017] hover:bg-[#E5AE1B] text-gray-950 font-bold text-sm shadow-md flex items-center space-x-2 transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4 font-bold" />
          <span>{t('addWalkInBtn')}</span>
        </button>
      </div>

      {/* Main Tablet Landscape 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Barber Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#D4A017] flex items-center space-x-2">
            <Scissors className="w-4 h-4" />
            <span>{t('barberCardsTitle')}</span>
          </h2>

          <div className="space-y-3">
            {barbers.map((b) => (
              <div
                key={b.name}
                className="bg-[#1F2937] border border-gray-700/60 rounded-2xl p-4 shadow-md space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-base">{b.name}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                        b.status === 'free'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : b.status === 'busy'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {b.status === 'free'
                        ? t('statusFree')
                        : b.status === 'busy'
                        ? t('statusBusy')
                        : t('statusBreak')}
                    </span>
                  </div>
                </div>

                {b.currentToken ? (
                  <div className="bg-gray-800/80 rounded-xl p-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="text-gray-400">{t('currentCustomer')}</p>
                      <p className="font-bold text-white text-sm">
                        {b.currentToken} · {b.customer}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400">{t('timeLeft')}</p>
                      <p className="font-bold text-[#D4A017] text-sm">
                        ~{b.timeLeft} {t('minutesShort')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-800/40 rounded-xl p-3 text-xs text-gray-400 italic">
                    {t('chairEmpty')}
                  </div>
                )}

                <button
                  disabled={b.status !== 'free'}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                    b.status === 'free'
                      ? 'bg-[#D4A017] hover:bg-[#E5AE1B] text-gray-950 shadow'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                  }`}
                >
                  {t('callNext')}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Waiting List in Order (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#D4A017]">
              {t('waitingListTitle')} ({waitingList.length})
            </h2>
            <span className="text-xs text-gray-400">First come, first served</span>
          </div>

          <div className="bg-[#1F2937] border border-gray-700/60 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-800/80 text-gray-400 uppercase tracking-wider font-semibold border-b border-gray-700">
                  <tr>
                    <th className="px-4 py-3">{t('colToken')}</th>
                    <th className="px-4 py-3">{t('colCustomer')}</th>
                    <th className="px-4 py-3">{t('colServices')}</th>
                    <th className="px-4 py-3">{t('colPreferredBarber')}</th>
                    <th className="px-4 py-3">{t('colWaitTime')}</th>
                    <th className="px-4 py-3 text-right">{t('colActions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {waitingList.map((item) => {
                    const isLongWait = item.waitMinutes > 60;
                    return (
                      <tr
                        key={item.token}
                        className={`hover:bg-gray-800/40 transition-colors ${
                          isLongWait ? 'bg-amber-500/10' : ''
                        }`}
                      >
                        <td className="px-4 py-3.5 font-bold text-white whitespace-nowrap">
                          {item.token}
                        </td>
                        <td className="px-4 py-3.5 text-gray-200 font-medium">
                          {item.name}
                        </td>
                        <td className="px-4 py-3.5 text-gray-400">
                          {item.services.join(', ')}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2 py-0.5 rounded-md bg-gray-800 text-gray-300 font-medium border border-gray-700">
                            {item.barber}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`flex items-center space-x-1 font-semibold ${
                              isLongWait ? 'text-amber-400' : 'text-gray-300'
                            }`}
                          >
                            {isLongWait && <AlertCircle className="w-3.5 h-3.5" />}
                            <span>{item.waitMinutes} {t('minutesShort')}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1">
                          <button
                            title={t('markNoShow')}
                            className="px-2 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 text-xs font-medium"
                          >
                            {t('markNoShow')}
                          </button>
                          <button
                            title={t('cancelQueueItem')}
                            className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium"
                          >
                            {t('cancelQueueItem')}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Walk-in Modal */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1F2937] border border-gray-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-700">
              <h3 className="font-bold text-white text-base">
                {t('walkInModalTitle')}
              </h3>
              <button
                onClick={() => setShowWalkInModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  {t('fullName')}
                </label>
                <input
                  type="text"
                  placeholder={t('namePlaceholder')}
                  className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  {t('phone')}
                </label>
                <input
                  type="tel"
                  placeholder={t('phonePlaceholder')}
                  className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm"
                />
              </div>
            </div>
            <div className="flex space-x-3 pt-3">
              <button
                onClick={() => setShowWalkInModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-800 text-gray-300 text-xs font-semibold"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => setShowWalkInModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#D4A017] hover:bg-[#E5AE1B] text-gray-950 text-xs font-bold shadow"
              >
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
