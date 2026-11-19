import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Settings, Users, CheckCircle, Clock, UserX, Power, Scissors } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { t } = useLanguage();

  const [queueOpen, setQueueOpen] = useState(true);
  const [barbers, setBarbers] = useState([
    { id: 1, name: 'Ravi', onDuty: true },
    { id: 2, name: 'Amit', onDuty: true },
    { id: 3, name: 'Imran', onDuty: true },
  ]);

  const [services, setServices] = useState([
    { id: 1, nameEn: 'Haircut', nameGu: 'હેરકટ', duration: 30, price: 150, active: true },
    { id: 2, nameEn: 'Beard trim', nameGu: 'દાઢી ટ્રીમ', duration: 15, price: 80, active: true },
    { id: 3, nameEn: 'Hair spa', nameGu: 'હેર સ્પા', duration: 45, price: 400, active: true },
    { id: 4, nameEn: 'Hair color', nameGu: 'હેર કલર', duration: 60, price: 600, active: false },
  ]);

  const toggleBarber = (id: number) => {
    setBarbers(barbers.map(b => b.id === id ? { ...b, onDuty: !b.onDuty } : b));
  };

  const toggleService = (id: number) => {
    setServices(services.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center space-x-3 pb-4 border-b border-gray-700/60">
        <Settings className="w-6 h-6 text-[#D4A017]" />
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
          {t('adminSettingsTitle')}
        </h1>
      </div>

      {/* Today's Stats Cards */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
          {t('todayStatsTitle')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#1F2937] border border-gray-700/60 rounded-2xl p-4 flex items-center space-x-3 shadow-md">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400">{t('statServed')}</p>
              <p className="text-xl font-black text-white">24</p>
            </div>
          </div>

          <div className="bg-[#1F2937] border border-gray-700/60 rounded-2xl p-4 flex items-center space-x-3 shadow-md">
            <div className="w-10 h-10 rounded-xl bg-[#D4A017]/10 border border-[#D4A017]/30 flex items-center justify-center text-[#D4A017]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400">{t('statAvgWait')}</p>
              <p className="text-xl font-black text-white">18 {t('minutesShort')}</p>
            </div>
          </div>

          <div className="bg-[#1F2937] border border-gray-700/60 rounded-2xl p-4 flex items-center space-x-3 shadow-md">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <UserX className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400">{t('statNoShows')}</p>
              <p className="text-xl font-black text-white">2</p>
            </div>
          </div>
        </div>
      </div>

      {/* Online Queue Switch */}
      <div className="bg-[#1F2937] border border-gray-700/60 rounded-2xl p-5 shadow-lg flex items-center justify-between">
        <div>
          <h3 className="font-bold text-white text-base">
            {t('queueControlTitle')}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {queueOpen ? t('queueIsOpen') : t('queueIsClosed')}
          </p>
        </div>
        <button
          onClick={() => setQueueOpen(!queueOpen)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow ${
            queueOpen
              ? 'bg-emerald-500 text-gray-950 hover:bg-emerald-400'
              : 'bg-rose-600 text-white hover:bg-rose-500'
          }`}
        >
          <Power className="w-4 h-4" />
          <span>{queueOpen ? t('queueIsOpen') : t('queueIsClosed')}</span>
        </button>
      </div>

      {/* Barbers on Duty Today */}
      <div className="bg-[#1F2937] border border-gray-700/60 rounded-2xl p-5 shadow-lg space-y-4">
        <h3 className="font-bold text-white text-sm uppercase tracking-wider text-[#D4A017] flex items-center space-x-2">
          <Users className="w-4 h-4" />
          <span>{t('barbersOnDutyTitle')}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {barbers.map((b) => (
            <div
              key={b.id}
              className="p-3.5 rounded-xl bg-gray-800/80 border border-gray-700 flex items-center justify-between"
            >
              <span className="font-bold text-white text-sm">{b.name}</span>
              <button
                onClick={() => toggleBarber(b.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  b.onDuty
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {b.onDuty ? 'On Duty' : 'Off Duty'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Services List Management */}
      <div className="bg-[#1F2937] border border-gray-700/60 rounded-2xl p-5 shadow-lg space-y-4">
        <h3 className="font-bold text-white text-sm uppercase tracking-wider text-[#D4A017] flex items-center space-x-2">
          <Scissors className="w-4 h-4" />
          <span>{t('servicesListTitle')}</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-800/60 text-gray-400 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">{t('colServiceName')}</th>
                <th className="px-4 py-3">{t('colDuration')}</th>
                <th className="px-4 py-3">{t('colPrice')}</th>
                <th className="px-4 py-3 text-right">{t('colActive')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {services.map((s) => (
                <tr key={s.id} className="hover:bg-gray-800/30">
                  <td className="px-4 py-3 text-white font-medium">
                    {s.nameEn} / {s.nameGu}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {s.duration} {t('minutesShort')}
                  </td>
                  <td className="px-4 py-3 text-[#D4A017] font-semibold">
                    {t('currency')}{s.price}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleService(s.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        s.active
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {s.active ? t('serviceActive') : t('serviceInactive')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
