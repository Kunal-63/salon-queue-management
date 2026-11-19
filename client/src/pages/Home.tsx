import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import type { BarberItem, QueueStats, ServiceItem } from '../services/api';
import { socket } from '../services/socket';
import { Clock, Users, ArrowRight, Sparkles, Scissors, AlertCircle } from 'lucide-react';

export const Home: React.FC = () => {
  const { t, language } = useLanguage();
  const [stats, setStats] = useState<QueueStats>({
    waitingCount: 6,
    servedCount: 14,
    noShowsCount: 1,
    approxWait: 50,
    totalRevenue: 3450,
  });
  const [barbers, setBarbers] = useState<BarberItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isOnlineOpen, setIsOnlineOpen] = useState(true);

  const loadData = async () => {
    try {
      const queueData = await api.getQueue();
      setStats(queueData.stats);
      setBarbers(queueData.barbers);
      setIsOnlineOpen(queueData.isOnlineOpen);

      const servicesData = await api.getServices();
      setServices(servicesData);
    } catch (err) {
      console.error('Failed to load home data', err);
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

  const getBarberStatusBadge = (status: string) => {
    switch (status) {
      case 'busy':
        return {
          bg: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
          dot: 'bg-amber-400',
          text: t('home.statusBusy'),
        };
      case 'break':
        return {
          bg: 'bg-red-500/15 border-red-500/40 text-red-300',
          dot: 'bg-red-400',
          text: t('home.statusBreak'),
        };
      default:
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
          dot: 'bg-[#00FF87] animate-pulse',
          text: t('home.statusFree'),
        };
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 loki-card border-2 border-[#F5C518]/30 shadow-[0_0_50px_rgba(16,185,129,0.15)] text-center">
        {/* Subtle Ambient Timeline Radial Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-[#10B981]/25 via-[#F5C518]/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Sacred Tag Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#0D2418] border border-[#00FF87]/40 text-[#00FF87] text-xs font-semibold tracking-wider uppercase mb-5 shadow-[0_0_15px_rgba(0,255,135,0.25)]">
            <Sparkles className="w-3.5 h-3.5 text-[#F5C518]" />
            <span>{t('home.heroTag')}</span>
          </div>

          {/* Majestic Loki Icon */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 mb-5 rounded-full p-1 bg-gradient-to-tr from-[#F5C518] via-[#00FF87] to-[#B3860F] shadow-[0_0_30px_rgba(245,197,24,0.4)]">
            <img
              src="/loki-crest.svg"
              alt="Loki Crest"
              className="w-full h-full object-cover rounded-full bg-[#07150E]"
            />
          </div>

          <h1 className="font-cinzel text-3xl sm:text-5xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5A5] via-[#F5C518] to-[#D4A017] mb-3 drop-shadow-[0_2px_12px_rgba(245,197,24,0.3)]">
            {t('home.heroTitle')}
          </h1>

          <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto leading-relaxed mb-6 font-normal">
            {t('home.heroDesc')}
          </p>

          {/* Open Badge Pill */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-semibold mb-8">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00FF87] animate-ping" />
            <span>{t('openBadge')}</span>
          </div>
        </div>
      </div>

      {/* SCREEN 1 MAIN REQUIREMENT: Live Card */}
      <div className="relative overflow-hidden rounded-2xl loki-card-gold p-6 sm:p-8 border-2 border-[#F5C518]/50 shadow-[0_0_35px_rgba(245,197,24,0.2)]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4 sm:space-x-5 text-center sm:text-left">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#123120] to-[#081810] border border-[#10B981]/50 flex items-center justify-center text-[#F5C518] shadow-[0_0_20px_rgba(16,185,129,0.3)] shrink-0">
              <Users className="w-8 h-8 text-[#F5C518]" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400/90 block mb-1">
                {t('home.liveQueueTitle')}
              </span>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 justify-center sm:justify-start">
                <span className="text-2xl sm:text-3xl font-black text-white font-cinzel">
                  {t('home.waitingCount', { count: stats.waitingCount })}
                </span>
                <span className="text-lg sm:text-xl font-bold text-[#F5C518]">
                  · {t('home.estWait', { time: stats.approxWait })}
                </span>
              </div>
            </div>
          </div>

          {/* SCREEN 1 MAIN REQUIREMENT: Big Gold Button [ Join Queue ] */}
          {isOnlineOpen ? (
            <Link
              to="/join"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#F5C518] via-[#FFD700] to-[#D4A017] hover:from-[#FFDF40] hover:to-[#E5A93C] text-gray-950 font-black text-base sm:text-lg tracking-wide uppercase shadow-[0_0_25px_rgba(245,197,24,0.5)] hover:shadow-[0_0_35px_rgba(245,197,24,0.8)] transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
            >
              <span>{t('home.joinButton')}</span>
              <ArrowRight className="w-5 h-5 font-bold" />
            </Link>
          ) : (
            <div className="flex items-center space-x-2 px-4 py-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs sm:text-sm font-medium">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{t('home.closedNotice')}</span>
            </div>
          )}
        </div>
      </div>

      {/* SCREEN 1 MAIN REQUIREMENT: Barber Chips with Status */}
      {/* Ravi (busy) · Amit (free) · Imran (on break) */}
      <div className="loki-card p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-900/40 pb-3">
          <h2 className="font-cinzel text-lg sm:text-xl font-bold text-[#F5C518] flex items-center space-x-2">
            <Scissors className="w-5 h-5 text-[#00FF87]" />
            <span>{t('home.barbersHeading')}</span>
          </h2>
          <span className="text-xs text-gray-400">{barbers.length} Master Stylists</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {barbers.map((barber) => {
            const badge = getBarberStatusBadge(barber.status);
            return (
              <div
                key={barber.name}
                className="relative overflow-hidden rounded-xl bg-[#0B1E14] border border-[#10B981]/25 p-4 flex items-center justify-between hover:border-[#F5C518]/50 transition-all shadow-md group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#163826] to-[#0A1810] border border-[#F5C518]/40 flex items-center justify-center font-cinzel font-bold text-[#F5C518] text-base shadow">
                    {barber.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base group-hover:text-[#F5C518] transition-colors">
                      {barber.name}
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      {barber.status === 'busy' && barber.current_token
                        ? `Serving ${barber.current_token}`
                        : 'Loki Stylist'}
                    </p>
                  </div>
                </div>

                {/* Status Chip */}
                <span
                  className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}
                >
                  <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                  <span>{badge.text}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Services Showcase */}
      <div className="loki-card p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between border-b border-emerald-900/40 pb-3">
          <h2 className="font-cinzel text-lg sm:text-xl font-bold text-[#F5C518] flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#F5C518]" />
            <span>{t('home.servicesHeading')}</span>
          </h2>
          <Link
            to="/join"
            className="text-xs font-semibold text-emerald-400 hover:text-[#F5C518] transition-colors flex items-center space-x-1"
          >
            <span>{t('home.viewAll')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {services.slice(0, 6).map((service) => (
            <div
              key={service.id}
              className="p-4 rounded-xl bg-[#091A11] border border-emerald-500/20 hover:border-[#F5C518]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-sm sm:text-base text-gray-100">
                    {language === 'gu' ? service.name_gu : service.name_en}
                  </h3>
                  <span className="font-cinzel font-bold text-[#F5C518] text-base whitespace-nowrap">
                    ₹{service.price}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-1 text-xs text-emerald-400/80 pt-2 border-t border-emerald-950/60 mt-2">
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>
                  {service.duration} {t('min')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Salon Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl loki-card border border-emerald-500/20 text-center">
          <div className="text-2xl sm:text-3xl font-cinzel font-black text-[#F5C518]">
            {stats.servedCount}+
          </div>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">
            {t('home.statGuestsToday')}
          </p>
        </div>

        <div className="p-5 rounded-2xl loki-card border border-emerald-500/20 text-center">
          <div className="text-2xl sm:text-3xl font-cinzel font-black text-[#00FF87]">
            {stats.approxWait} min
          </div>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">
            {t('home.statAvgWait')}
          </p>
        </div>

        <div className="p-5 rounded-2xl loki-card border border-emerald-500/20 text-center">
          <div className="text-2xl sm:text-3xl font-cinzel font-black text-[#F5C518]">
            99.8%
          </div>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">
            {t('home.statSatisfaction')}
          </p>
        </div>
      </div>
    </div>
  );
};
