import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import type { ServiceItem, BarberItem, QueueStats } from '../services/api';
import { socket } from '../services/socket';
import {
  Settings,
  Scissors,
  Users,
  Clock,
  DollarSign,
  UserX,
  ToggleLeft,
  ToggleRight,
  Power,
  Sparkles,
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { t } = useLanguage();

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [barbers, setBarbers] = useState<BarberItem[]>([]);
  const [stats, setStats] = useState<QueueStats>({
    waitingCount: 6,
    servedCount: 14,
    noShowsCount: 1,
    approxWait: 50,
    totalRevenue: 3450,
  });
  const [isOnlineOpen, setIsOnlineOpen] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const q = await api.getQueue();
      setStats(q.stats);
      setBarbers(q.barbers);
      setIsOnlineOpen(q.isOnlineOpen);

      const s = await api.getServices();
      setServices(s);
    } catch (err) {
      console.error('Failed to load admin settings', err);
    }
  };

  useEffect(() => {
    loadData();

    socket.on('queue:updated', (data) => {
      if (data.stats) setStats(data.stats);
      if (data.barbers) setBarbers(data.barbers);
      if (data.isOnlineOpen !== undefined) setIsOnlineOpen(data.isOnlineOpen);
    });

    return () => {
      socket.off('queue:updated');
    };
  }, []);

  // Toggle online queue Open / Closed
  const handleToggleQueueOpen = async () => {
    setUpdating('queue');
    try {
      const res = await api.toggleQueueOpen(!isOnlineOpen);
      setIsOnlineOpen(res.isOpen);
    } catch (err: any) {
      alert(err.message || 'Error toggling queue open state');
    } finally {
      setUpdating(null);
    }
  };

  // Toggle Barber Duty Today
  const handleToggleBarberDuty = async (barberName: string) => {
    setUpdating(`barber-${barberName}`);
    try {
      await api.toggleDuty(barberName);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error toggling barber duty');
    } finally {
      setUpdating(null);
    }
  };

  // Toggle Service Active / Inactive
  const handleToggleService = async (service: ServiceItem) => {
    setUpdating(`service-${service.id}`);
    try {
      const nextActive = service.is_active ? 0 : 1;
      await api.updateService(service.id, nextActive);
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, is_active: nextActive } : s))
      );
    } catch (err: any) {
      alert(err.message || 'Error toggling service');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* Page Title */}
      <div className="border-b border-emerald-900/40 pb-5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5C518] to-[#D4A017] flex items-center justify-center text-gray-950 font-bold shadow-md">
            <Settings className="w-5 h-5 font-bold" />
          </div>
          <div>
            <h1 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-[#F5C518]">
              {t('admin.pageTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">{t('admin.pageSubtitle')}</p>
          </div>
        </div>
      </div>

      {/* SCREEN 7 MAIN REQUIREMENT: Today's Stats */}
      {/* Customers served, average wait, no-shows */}
      <div>
        <h2 className="font-cinzel text-lg sm:text-xl font-bold text-[#F5C518] mb-4 flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-[#00FF87]" />
          <span>{t('admin.statsTitle')}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl loki-card border border-emerald-500/30 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-[#122E1F] border border-emerald-500/40 flex items-center justify-center text-[#00FF87] shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                {t('admin.statCompleted')}
              </span>
              <span className="font-cinzel text-2xl font-black text-white">
                {stats.servedCount}
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl loki-card border border-emerald-500/30 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-[#122E1F] border border-[#F5C518]/40 flex items-center justify-center text-[#F5C518] shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                {t('admin.statAverageWait')}
              </span>
              <span className="font-cinzel text-2xl font-black text-[#F5C518]">
                {stats.approxWait} min
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl loki-card border border-emerald-500/30 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
              <UserX className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                {t('admin.statNoShows')}
              </span>
              <span className="font-cinzel text-2xl font-black text-red-400">
                {stats.noShowsCount}
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl loki-card border border-emerald-500/30 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-[#122E1F] border border-[#00FF87]/40 flex items-center justify-center text-[#00FF87] shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                {t('admin.statEstRevenue')}
              </span>
              <span className="font-cinzel text-2xl font-black text-[#00FF87]">
                ₹{stats.totalRevenue || 3450}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SCREEN 7 MAIN REQUIREMENT: Queue Switch: Open / Closed for online joining */}
      <div className="p-6 sm:p-8 rounded-3xl loki-card-gold border-2 border-[#F5C518]/50 shadow-[0_0_35px_rgba(245,197,24,0.2)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-[#F5C518] block">
              {t('admin.queueStatusTitle')}
            </span>
            <h3 className="font-cinzel text-xl sm:text-2xl font-black text-white">
              {isOnlineOpen ? t('admin.queueIsOpen') : t('admin.queueIsClosed')}
            </h3>
            <p className="text-xs text-gray-300">
              {isOnlineOpen
                ? 'Customers can freely join the queue from their mobile phones.'
                : 'Online join is paused. Walk-in customers can still be added by reception.'}
            </p>
          </div>

          <button
            onClick={handleToggleQueueOpen}
            disabled={updating === 'queue'}
            className={`px-6 py-3.5 rounded-2xl font-black text-sm tracking-wide uppercase transition-all duration-300 flex items-center space-x-2.5 cursor-pointer shadow-lg ${
              isOnlineOpen
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                : 'bg-gradient-to-r from-[#00FF87] to-[#10B981] text-gray-950 hover:from-[#34D399] hover:to-[#059669] shadow-[0_0_20px_rgba(0,255,135,0.4)]'
            }`}
          >
            <Power className="w-4 h-4 font-bold" />
            <span>{t('admin.toggleQueueBtn')}</span>
          </button>
        </div>
      </div>

      {/* SCREEN 7 MAIN REQUIREMENT: Barbers on duty today (toggle) */}
      <div className="loki-card p-6 sm:p-8 space-y-4">
        <h2 className="font-cinzel text-lg sm:text-xl font-bold text-[#F5C518] border-b border-emerald-900/40 pb-3 flex items-center space-x-2">
          <Users className="w-5 h-5 text-[#00FF87]" />
          <span>{t('admin.barbersTitle')}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {barbers.map((barber) => (
            <div
              key={barber.name}
              className="p-4 rounded-2xl bg-[#081810] border border-emerald-500/30 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[#163826] border border-[#F5C518]/50 flex items-center justify-center font-cinzel font-bold text-[#F5C518]">
                  {barber.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">{barber.name}</h4>
                  <span className="text-[11px] text-gray-400 capitalize">{barber.status}</span>
                </div>
              </div>

              {/* Duty Toggle Button */}
              <button
                onClick={() => handleToggleBarberDuty(barber.name)}
                disabled={updating === `barber-${barber.name}`}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  barber.is_on_duty ? 'text-[#00FF87] hover:scale-110' : 'text-gray-500 hover:scale-110'
                }`}
                title="Toggle On Duty"
              >
                {barber.is_on_duty ? (
                  <ToggleRight className="w-8 h-8 stroke-[2.2]" />
                ) : (
                  <ToggleLeft className="w-8 h-8 stroke-[2.2]" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SCREEN 7 MAIN REQUIREMENT: Services list (name EN/GU, minutes, price, on/off) */}
      <div className="loki-card p-6 sm:p-8 space-y-4">
        <h2 className="font-cinzel text-lg sm:text-xl font-bold text-[#F5C518] border-b border-emerald-900/40 pb-3 flex items-center space-x-2">
          <Scissors className="w-5 h-5 text-[#00FF87]" />
          <span>{t('admin.servicesTitle')}</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#091D13] text-gray-400 uppercase tracking-wider text-[11px] border-b border-emerald-900/60 font-semibold">
              <tr>
                <th className="px-4 py-3.5">{t('admin.colService')} (EN / GU)</th>
                <th className="px-4 py-3.5">{t('admin.colDuration')}</th>
                <th className="px-4 py-3.5">{t('admin.colPrice')}</th>
                <th className="px-4 py-3.5">{t('admin.colActive')}</th>
                <th className="px-4 py-3.5 text-right">Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/60">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-[#0C2216] transition-colors">
                  <td className="px-4 py-3.5">
                    <span className="font-bold text-white block">{service.name_en}</span>
                    <span className="text-xs text-gray-400 font-normal">{service.name_gu}</span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-300 font-medium">
                    {service.duration} {t('min')}
                  </td>
                  <td className="px-4 py-3.5 font-cinzel font-bold text-[#F5C518] text-base">
                    ₹{service.price}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                        service.is_active
                          ? 'bg-emerald-950/80 text-[#00FF87] border-[#00FF87]/30'
                          : 'bg-gray-800 text-gray-400 border-gray-700'
                      }`}
                    >
                      {service.is_active ? t('serviceActive') : t('serviceInactive')}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => handleToggleService(service)}
                      disabled={updating === `service-${service.id}`}
                      className="cursor-pointer text-gray-300 hover:text-white"
                    >
                      {service.is_active ? (
                        <ToggleRight className="w-7 h-7 text-[#00FF87]" />
                      ) : (
                        <ToggleLeft className="w-7 h-7 text-gray-500" />
                      )}
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
