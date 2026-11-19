import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import type { QueueTicket, BarberItem } from '../services/api';
import { socket } from '../services/socket';
import {
  Scissors,
  Play,
  CheckCircle,
  Coffee,
  Sparkles,
  UserCheck,
  User,
} from 'lucide-react';

export const BarberView: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const currentBarberName = name || 'Ravi';

  const [barbers, setBarbers] = useState<BarberItem[]>([]);
  const [currentBarber, setCurrentBarber] = useState<BarberItem | null>(null);
  const [currentTicket, setCurrentTicket] = useState<QueueTicket | null>(null);
  const [nextTicket, setNextTicket] = useState<QueueTicket | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    try {
      const queueData = await api.getQueue();
      setBarbers(queueData.barbers);

      const b = queueData.barbers.find(
        (item) => item.name.toLowerCase() === currentBarberName.toLowerCase()
      );
      setCurrentBarber(b || null);

      // Find current customer in chair or called for this barber
      const activeTicket = queueData.queue.find(
        (ticket) =>
          ticket.assigned_barber === currentBarberName &&
          (ticket.status === 'in_chair' || ticket.status === 'called')
      );
      setCurrentTicket(activeTicket || null);

      // Find 'Next for you' customer
      const upcoming = queueData.queue.find(
        (ticket) =>
          ticket.status === 'waiting' &&
          (ticket.preferred_barber === currentBarberName || ticket.preferred_barber === 'Any')
      );
      setNextTicket(upcoming || null);
    } catch (err) {
      console.error('Failed to load barber view data', err);
    }
  };

  useEffect(() => {
    loadData();

    socket.on('queue:updated', () => {
      loadData();
    });

    return () => {
      socket.off('queue:updated');
    };
  }, [currentBarberName]);

  // Live timer since service started
  useEffect(() => {
    if (currentTicket && currentTicket.status === 'in_chair' && currentTicket.started_at) {
      const startTime = new Date(currentTicket.started_at).getTime();
      const updateTimer = () => {
        const now = Date.now();
        const diffSecs = Math.max(0, Math.floor((now - startTime) / 1000));
        setElapsedSeconds(diffSecs);
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    } else {
      setElapsedSeconds(0);
    }
  }, [currentTicket]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Toggle On Break / Available
  const handleToggleBreak = async () => {
    setActionLoading(true);
    try {
      const res = await api.toggleBreak(currentBarberName);
      if (res.barber) {
        setCurrentBarber(res.barber);
        loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Error toggling break');
    } finally {
      setActionLoading(false);
    }
  };

  // [ Start ] Service
  const handleStartService = async () => {
    if (!currentTicket) return;
    setActionLoading(true);
    try {
      const res = await api.startService(currentTicket.token);
      setCurrentTicket(res.ticket);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error starting service');
    } finally {
      setActionLoading(false);
    }
  };

  // [ Done ] Complete Service
  const handleDoneService = async () => {
    if (!currentTicket) return;
    setActionLoading(true);
    try {
      await api.doneService(currentTicket.token);
      setCurrentTicket(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error completing service');
    } finally {
      setActionLoading(false);
    }
  };

  const isOnBreak = currentBarber?.status === 'break';
  const isInChair = currentTicket?.status === 'in_chair';
  const isCalled = currentTicket?.status === 'called';

  let currentServices: string[] = [];
  if (currentTicket) {
    try {
      currentServices = JSON.parse(currentTicket.services);
    } catch {
      currentServices = [currentTicket.services];
    }
  }

  let nextServices: string[] = [];
  if (nextTicket) {
    try {
      nextServices = JSON.parse(nextTicket.services);
    } catch {
      nextServices = [nextTicket.services];
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* Barber Selector Switcher */}
      <div className="flex items-center justify-between bg-[#081810] p-1.5 rounded-2xl border border-emerald-500/20">
        {barbers.map((b) => (
          <button
            key={b.name}
            onClick={() => navigate(`/barber/${b.name}`)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              b.name.toLowerCase() === currentBarberName.toLowerCase()
                ? 'bg-gradient-to-r from-[#F5C518] to-[#D4A017] text-gray-950 shadow-md font-extrabold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>

      {/* Barber Station Header Card */}
      <div className="p-5 rounded-2xl loki-card border-2 border-[#F5C518]/30 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#163826] to-[#0A1810] border border-[#F5C518] flex items-center justify-center font-cinzel font-black text-[#F5C518] text-lg shadow">
            {currentBarberName[0]}
          </div>
          <div>
            <h1 className="font-cinzel text-lg font-bold text-white flex items-center space-x-2">
              <span>{currentBarberName}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-sans">
                Station #{currentBarber?.id || 1}
              </span>
            </h1>
            <p className="text-xs text-gray-400">{t('barber.pageTitle')}</p>
          </div>
        </div>

        {/* SCREEN 5 MAIN REQUIREMENT: Toggle: On break / Available */}
        <button
          onClick={handleToggleBreak}
          disabled={actionLoading}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 border cursor-pointer ${
            isOnBreak
              ? 'bg-red-950/80 text-red-300 border-red-500/50 hover:bg-red-900/80 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
              : 'bg-emerald-950/80 text-[#00FF87] border-[#00FF87]/40 hover:bg-emerald-900/80 shadow-[0_0_12px_rgba(0,255,135,0.2)]'
          }`}
        >
          {isOnBreak ? (
            <>
              <Coffee className="w-3.5 h-3.5 text-red-400" />
              <span>{t('barber.dutyToggleBreak')}</span>
            </>
          ) : (
            <>
              <UserCheck className="w-3.5 h-3.5 text-[#00FF87]" />
              <span>{t('barber.dutyToggleOn')}</span>
            </>
          )}
        </button>
      </div>

      {/* SCREEN 5 MAIN REQUIREMENT: Current Customer Card */}
      {/* Name, services, timer since start, Big buttons [ Start ] -> [ Done ] */}
      <div className="p-6 rounded-3xl loki-card-gold border-2 border-[#F5C518]/50 shadow-[0_0_35px_rgba(245,197,24,0.2)] space-y-5">
        <div className="flex items-center justify-between border-b border-[#F5C518]/30 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
            <Scissors className="w-4 h-4 text-[#F5C518]" />
            <span>{t('barber.nowServing')}</span>
          </span>
          {currentTicket && (
            <span className="font-cinzel font-black text-xl text-[#F5C518]">
              {currentTicket.token}
            </span>
          )}
        </div>

        {currentTicket ? (
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                {t('barber.guestName')}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white font-cinzel">
                {currentTicket.customer_name}
              </h2>
              <span className="text-xs text-gray-400">{currentTicket.phone}</span>
            </div>

            {/* Requested Services */}
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                {t('barber.services')}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentServices.map((srv, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg bg-[#0F2E1E] text-emerald-300 text-xs font-semibold border border-emerald-500/30"
                  >
                    {srv}
                  </span>
                ))}
              </div>
            </div>

            {/* SCREEN 5 MAIN REQUIREMENT: Timer since start */}
            <div className="p-4 rounded-2xl bg-[#07150E] border border-emerald-500/30 text-center space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                {t('barber.serviceTimer')}
              </span>
              <div className="font-mono text-3xl sm:text-4xl font-black text-[#00FF87] tracking-wider drop-shadow-[0_0_12px_rgba(0,255,135,0.4)]">
                {isInChair ? formatTimer(elapsedSeconds) : '00:00'}
              </div>
              <span className="text-[11px] text-gray-400 block">
                {isInChair ? 'Service active in chair' : 'Called · Awaiting guest arrival'}
              </span>
            </div>

            {/* SCREEN 5 MAIN REQUIREMENT: Big buttons: [ Start ] -> [ Done ] */}
            <div className="pt-2">
              {isCalled ? (
                <button
                  onClick={handleStartService}
                  disabled={actionLoading}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00FF87] via-[#10B981] to-[#047857] text-gray-950 font-black text-base sm:text-lg tracking-wider uppercase shadow-[0_0_25px_rgba(0,255,135,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>{t('barber.startService')}</span>
                </button>
              ) : isInChair ? (
                <button
                  onClick={handleDoneService}
                  disabled={actionLoading}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#F5C518] via-[#FFD700] to-[#D4A017] text-gray-950 font-black text-base sm:text-lg tracking-wider uppercase shadow-[0_0_25px_rgba(245,197,24,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <CheckCircle className="w-5 h-5 font-bold" />
                  <span>{t('barber.finishService')}</span>
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="py-10 text-center space-y-2">
            <User className="w-10 h-10 text-gray-500 mx-auto" />
            <p className="text-gray-400 text-sm font-medium">{t('barber.noOneInChair')}</p>
            <p className="text-xs text-gray-500">
              When reception dispatches or you call next, your guest will appear here.
            </p>
          </div>
        )}
      </div>

      {/* SCREEN 5 MAIN REQUIREMENT: 'Next for you: S-15 Kunal (Haircut)' */}
      <div className="p-5 rounded-2xl loki-card border border-emerald-500/30 space-y-3">
        <div className="flex items-center justify-between border-b border-emerald-950/80 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#F5C518]" />
            <span>{t('barber.upNext')}</span>
          </span>
          {nextTicket && (
            <span className="font-cinzel font-black text-base text-[#F5C518]">
              {nextTicket.token}
            </span>
          )}
        </div>

        {nextTicket ? (
          <div className="p-3.5 rounded-xl bg-[#07150E] border border-emerald-500/20 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base font-cinzel">
                {nextTicket.token} · {nextTicket.customer_name}
              </h3>
              <p className="text-xs text-emerald-400 mt-0.5">
                {nextServices.join(', ')} ({nextTicket.total_duration} {t('min')})
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950 text-[#00FF87] border border-[#00FF87]/30 font-semibold">
              Waiting
            </span>
          </div>
        ) : (
          <p className="text-xs text-gray-500 italic py-2">{t('barber.noNext')}</p>
        )}
      </div>
    </div>
  );
};
