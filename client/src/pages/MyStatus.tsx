import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import type { QueueTicket } from '../services/api';
import { socket } from '../services/socket';
import {
  Clock,
  Sparkles,
  AlertTriangle,
  Scissors,
  XCircle,
  Navigation,
  Crown,
  BellRing,
} from 'lucide-react';

export const MyStatus: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();

  const [ticket, setTicket] = useState<QueueTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [calledBarber, setCalledBarber] = useState<string | null>(null);

  const tokenToFetch = id || 'S-14';

  const fetchTicket = async () => {
    try {
      const data = await api.getTicket(tokenToFetch);
      if (data) {
        setTicket(data);
        if (data.status === 'called' && data.assigned_barber) {
          setCalledBarber(data.assigned_barber);
        }
      }
    } catch (err) {
      console.error('Failed to load ticket', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();

    socket.on('queue:updated', () => {
      fetchTicket();
    });

    socket.on('ticket:called', (data: { token: string; barber: string }) => {
      if (ticket && (ticket.token === data.token || tokenToFetch.toLowerCase() === data.token.toLowerCase())) {
        setCalledBarber(data.barber);
        fetchTicket();
      }
    });

    return () => {
      socket.off('queue:updated');
      socket.off('ticket:called');
    };
  }, [tokenToFetch]);

  const handleCancelSpot = async () => {
    if (!ticket) return;
    setCancelling(true);
    try {
      const res = await api.cancelTicket(ticket.token);
      setTicket(res.ticket);
      setShowCancelModal(false);
    } catch (err) {
      console.error('Error cancelling spot', err);
    } finally {
      setCancelling(false);
    }
  };

  if (loading && !ticket) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 mx-auto rounded-full border-4 border-[#F5C518] border-t-transparent animate-spin mb-4" />
        <p className="text-gray-400 font-cinzel tracking-wider">Locating Sacred Token...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-8 loki-card border border-red-500/30">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h2 className="font-cinzel text-xl font-bold text-white mb-2">{t('status.ticketNotFound')}</h2>
          <p className="text-xs text-gray-400 mb-6">Token {tokenToFetch} is either finished or invalid.</p>
          <Link
            to="/join"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#F5C518] to-[#D4A017] text-gray-950 font-bold text-sm shadow"
          >
            {t('routes.join')}
          </Link>
        </div>
      </div>
    );
  }

  // Parse services list
  let servicesList: string[] = [];
  try {
    servicesList = JSON.parse(ticket.services);
  } catch {
    servicesList = [ticket.services];
  }

  const isCalled = ticket.status === 'called';
  const isInChair = ticket.status === 'in_chair';
  const isDone = ticket.status === 'done';
  const isCancelled = ticket.status === 'cancelled';
  const isNoShow = ticket.status === 'noshow';

  // 2nd in line condition (position === 2)
  const isSecondInLine = ticket.position === 2 && ticket.status === 'waiting';

  // Circular progress calculations (assuming 60 min base gauge)
  const currentWait = ticket.estimated_wait ?? 35;
  const maxGaugeMinutes = 60;
  const progressRatio = Math.max(0, Math.min(1, currentWait / maxGaugeMinutes));
  const strokeDashoffset = 440 * (1 - progressRatio);

  return (
    <div className="max-w-md mx-auto px-4 py-6 sm:py-10 space-y-6">
      {/* SCREEN 3 MAIN REQUIREMENT: When called -> Full-screen Gold Banner / Alert */}
      {isCalled && (
        <div className="fixed inset-0 z-50 bg-[#07150E]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-gold-flash">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#F5C518] to-[#FFD700] flex items-center justify-center text-gray-950 shadow-[0_0_60px_rgba(245,197,24,0.9)] mb-6 animate-bounce">
            <BellRing className="w-12 h-12 stroke-[2.5]" />
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-[#00FF87] mb-2 px-3.5 py-1 rounded-full bg-emerald-950/80 border border-[#00FF87]/40">
            {t('status.modalTurnTitle')}
          </span>

          <h2 className="font-cinzel text-4xl sm:text-5xl font-black text-[#F5C518] tracking-wider mb-3 drop-shadow-[0_2px_20px_rgba(245,197,24,0.8)]">
            {ticket.token}
          </h2>

          <p className="text-lg text-white font-medium max-w-xs mb-2">
            {t('status.modalTurnDesc')}{' '}
            <strong className="text-[#00FF87] text-2xl font-cinzel block mt-1">
              {ticket.assigned_barber || calledBarber || 'Your Master Barber'}
            </strong>
          </p>

          <p className="text-xs text-gray-400 max-w-xs mb-8">
            Please proceed to the styling chair immediately. Your throne is prepared!
          </p>

          <button
            onClick={() => {
              setCalledBarber(null);
            }}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#F5C518] via-[#FFD700] to-[#D4A017] text-gray-950 font-black tracking-wider uppercase text-sm shadow-[0_0_30px_rgba(245,197,24,0.6)] cursor-pointer hover:scale-105 transition-transform"
          >
            {t('status.modalTurnBtn')}
          </button>
        </div>
      )}

      {/* SCREEN 3 MAIN REQUIREMENT: When 2nd in line -> Banner 'Start coming to the salon' */}
      {isSecondInLine && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-[#F5C518]/20 to-amber-500/20 border-2 border-[#F5C518] shadow-[0_0_25px_rgba(245,197,24,0.35)] flex items-start space-x-3.5 animate-pulse">
          <Navigation className="w-6 h-6 text-[#F5C518] shrink-0 mt-0.5" />
          <div>
            <h3 className="font-cinzel text-base font-black text-[#F5C518]">
              {t('status.bannerNext')}
            </h3>
            <p className="text-xs text-gray-200 mt-1 leading-relaxed">
              {t('status.bannerNextDesc')}
            </p>
          </div>
        </div>
      )}

      {/* In Chair Banner */}
      {isInChair && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-[#00FF87]/50 text-emerald-200 text-sm flex items-center space-x-3 shadow-[0_0_20px_rgba(0,255,135,0.2)]">
          <Scissors className="w-5 h-5 text-[#00FF87] shrink-0 animate-spin" />
          <span>{t('status.inChairBanner', { barber: ticket.assigned_barber || 'Master Barber' })}</span>
        </div>
      )}

      {/* Completed Banner */}
      {isDone && (
        <div className="p-5 rounded-2xl bg-emerald-950/80 border border-[#00FF87] text-center space-y-2">
          <Crown className="w-10 h-10 text-[#F5C518] mx-auto" />
          <h3 className="font-cinzel text-lg font-bold text-[#F5C518]">{t('status.doneBanner')}</h3>
          <p className="text-xs text-gray-400">Hope you loved your royal grooming experience.</p>
        </div>
      )}

      {/* Cancelled Banner */}
      {isCancelled && (
        <div className="p-4 rounded-2xl bg-gray-900 border border-gray-700 text-center text-gray-400 text-sm">
          <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <span>{t('status.cancelledBanner')}</span>
        </div>
      )}

      {/* No-show Banner */}
      {isNoShow && (
        <div className="p-4 rounded-2xl bg-red-950/70 border border-red-500/40 text-center text-red-200 text-sm">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <span>{t('status.noshowBanner')}</span>
        </div>
      )}

      {/* MAIN CARD: Token + Circular Countdown + Position */}
      <div className="relative overflow-hidden rounded-3xl loki-card border-2 border-[#F5C518]/40 p-6 sm:p-8 text-center shadow-[0_0_40px_rgba(16,185,129,0.15)] space-y-6">
        {/* Token Header */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400/90 block mb-1">
            {t('status.tokenLabel')}
          </span>
          {/* SCREEN 3 MAIN REQUIREMENT: Token 'S-14' large */}
          <div className="font-cinzel text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5A5] via-[#F5C518] to-[#D4A017] tracking-wider drop-shadow-[0_2px_15px_rgba(245,197,24,0.4)]">
            {ticket.token}
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            {ticket.customer_name} · {ticket.phone}
          </span>
        </div>

        {/* SCREEN 3 MAIN REQUIREMENT: Circular Countdown */}
        {ticket.status === 'waiting' && (
          <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              {/* Background circle track */}
              <circle
                cx="80"
                cy="80"
                r="70"
                className="text-emerald-950 stroke-current"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Animated Progress Circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="url(#countdownGrad)"
                strokeWidth="10"
                strokeDasharray="440"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="countdownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00FF87" />
                  <stop offset="50%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#F5C518" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <Clock className="w-5 h-5 text-[#00FF87] mb-1 animate-pulse" />
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                {t('status.timeRemaining')}
              </span>
              <span className="font-cinzel text-2xl font-black text-white">
                ~{ticket.estimated_wait} {t('min')}
              </span>
            </div>
          </div>
        )}

        {/* SCREEN 3 MAIN REQUIREMENT: Position '4th in line' */}
        {ticket.status === 'waiting' && (
          <div className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#0E281A] border border-[#F5C518]/40 shadow-inner">
            <Sparkles className="w-4 h-4 text-[#F5C518]" />
            <span className="text-sm font-bold text-white">
              {ticket.position === 1
                ? t('status.positionFirst')
                : `${ticket.position}${
                    ticket.position === 2
                      ? 'nd'
                      : ticket.position === 3
                      ? 'rd'
                      : 'th'
                  } ${t('status.positionSuffix')}`}
            </span>
          </div>
        )}

        {/* Treatment Details */}
        <div className="p-4 rounded-xl bg-[#081810] border border-emerald-500/20 text-left space-y-3">
          <div className="flex items-center justify-between text-xs border-b border-emerald-950/80 pb-2">
            <span className="text-gray-400">{t('status.assignedBarber')}</span>
            <span className="font-bold text-[#F5C518]">
              {ticket.preferred_barber === 'Any' ? t('status.anyBarber') : ticket.preferred_barber}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
              {t('status.servicesChosen')}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {servicesList.map((srv, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md bg-[#0F2D1E] text-emerald-300 text-xs font-medium border border-emerald-500/30"
                >
                  {srv}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-emerald-950/80">
            <span className="text-gray-400">Total Duration & Investment</span>
            <span className="font-bold text-white">
              {ticket.total_duration} {t('min')} · ₹{ticket.total_price}
            </span>
          </div>
        </div>

        {/* SCREEN 3 MAIN REQUIREMENT: [ Cancel my spot ] with confirmation */}
        {ticket.status === 'waiting' && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="w-full py-3 rounded-xl border border-red-500/30 hover:border-red-500 text-red-400 hover:text-red-300 hover:bg-red-950/30 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            {t('status.cancelBtn')}
          </button>
        )}
      </div>

      {/* Confirmation Pop-up Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl loki-card border border-red-500/40 p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-cinzel text-lg font-bold text-white">
              {t('status.cancelConfirmTitle')}
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              {t('status.cancelConfirmDesc')}
            </p>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold"
              >
                {t('status.cancelConfirmNo')}
              </button>
              <button
                onClick={handleCancelSpot}
                disabled={cancelling}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow disabled:opacity-50"
              >
                {cancelling ? '...' : t('status.cancelConfirmYes')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
