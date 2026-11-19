import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import type { QueueTicket, BarberItem } from '../services/api';
import { socket } from '../services/socket';
import { Clock, Scissors, Volume2, Sparkles, Bell } from 'lucide-react';

export const DisplayTV: React.FC = () => {
  const { t } = useLanguage();

  const [queue, setQueue] = useState<QueueTicket[]>([]);
  const [barbers, setBarbers] = useState<BarberItem[]>([]);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [calledAlert, setCalledAlert] = useState<{ token: string; barber: string } | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Synthesize royal chime using Web Audio API
  const playChime = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 Asgardian Fanfare Chord
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + idx * 0.12 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 1.3);
      });
    } catch (err) {
      console.log('Audio playback prevented or unsupported', err);
    }
  };

  const loadData = async () => {
    try {
      const data = await api.getQueue();
      setQueue(data.queue);
      setBarbers(data.barbers);
    } catch (err) {
      console.error('Failed to load TV display data', err);
    }
  };

  useEffect(() => {
    loadData();

    // Clock ticker
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    }, 1000);

    // Socket.IO event listeners
    socket.on('queue:updated', (data) => {
      if (data.queue) setQueue(data.queue);
      if (data.barbers) setBarbers(data.barbers);
    });

    // SCREEN 6 MAIN REQUIREMENT: Newly-called token flashes gold + chime
    socket.on('ticket:called', (data: { token: string; barber: string }) => {
      setCalledAlert(data);
      playChime();
      loadData();

      // Flash for 8 seconds then dismiss
      setTimeout(() => {
        setCalledAlert((prev) => (prev?.token === data.token ? null : prev));
      }, 8000);
    });

    return () => {
      clearInterval(timer);
      socket.off('queue:updated');
      socket.off('ticket:called');
    };
  }, []);

  // Up next list of 5 tokens
  const waitingTickets = queue.filter((t) => t.status === 'waiting');
  const upNextFive = waitingTickets.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#050E08] text-white p-4 sm:p-8 flex flex-col justify-between overflow-hidden select-none">
      {/* Top TV Bar: Logo, Title, Live Clock */}
      <div className="flex items-center justify-between border-b border-[#F5C518]/30 pb-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-full p-1 bg-gradient-to-tr from-[#F5C518] via-[#00FF87] to-[#D4A017] shadow-[0_0_25px_rgba(245,197,24,0.4)]">
            <img
              src="/loki-crest.svg"
              alt="Loki Crest"
              className="w-full h-full rounded-full object-cover bg-[#07150E]"
            />
          </div>
          <div>
            <h1 className="font-cinzel text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5A5] via-[#F5C518] to-[#D4A017] tracking-wider">
              {t('display.pageTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-400 font-semibold tracking-widest uppercase">
              {t('salonSubtitle')}
            </p>
          </div>
        </div>

        {/* Live Clock & Audio Test Button */}
        <div className="flex items-center space-x-4">
          <button
            onClick={playChime}
            className="p-2.5 rounded-xl bg-[#0E281A] hover:bg-[#163826] border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-1.5 transition-all cursor-pointer"
            title="Test Chime Sound"
          >
            <Volume2 className="w-4 h-4 text-[#F5C518]" />
            <span className="hidden sm:inline">Chime</span>
          </button>

          <div className="px-5 py-2.5 rounded-2xl bg-[#091D13] border border-[#F5C518]/40 shadow-inner text-right">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
              {t('display.liveClock')}
            </span>
            <span className="font-mono text-xl sm:text-2xl font-black text-[#00FF87] tracking-wider">
              {currentTime || '--:--:--'}
            </span>
          </div>
        </div>
      </div>

      {/* SCREEN 6 MAIN REQUIREMENT: Newly-called token flashes gold */}
      {calledAlert && (
        <div className="mb-6 p-6 rounded-3xl bg-gradient-to-r from-amber-500/30 via-[#F5C518]/30 to-amber-500/30 border-4 border-[#F5C518] text-center shadow-[0_0_60px_rgba(245,197,24,0.9)] animate-gold-flash">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <Bell className="w-8 h-8 text-[#F5C518] animate-bounce" />
            <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#00FF87] px-3 py-1 rounded-full bg-emerald-950/80 border border-[#00FF87]/40">
              {t('display.callingNotification')}
            </span>
          </div>
          <h2 className="font-cinzel text-3xl sm:text-5xl font-black text-[#F5C518] drop-shadow-[0_2px_15px_rgba(245,197,24,0.8)]">
            {t('display.newCallChime', { token: calledAlert.token, barber: calledAlert.barber })}
          </h2>
        </div>
      )}

      {/* 2 COLUMN WIDESCREEN DISPLAY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 items-stretch">
        {/* SCREEN 6 LEFT: Row per barber: photo, name, 'Now: S-12' */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-900/60">
            <h2 className="font-cinzel text-xl sm:text-2xl font-black text-[#F5C518] flex items-center space-x-2">
              <Scissors className="w-6 h-6 text-[#00FF87]" />
              <span>{t('display.nowServing')}</span>
            </h2>
            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              Live Chairs
            </span>
          </div>

          <div className="space-y-4 flex-1 flex flex-col justify-around">
            {barbers.map((barber) => {
              const activeTicket = queue.find(
                (t) =>
                  t.id === barber.current_ticket_id ||
                  (t.assigned_barber === barber.name &&
                    (t.status === 'in_chair' || t.status === 'called'))
              );

              const isBreak = barber.status === 'break';
              const isNewlyCalled = calledAlert?.barber === barber.name;

              return (
                <div
                  key={barber.name}
                  className={`p-6 rounded-3xl loki-card border-2 flex items-center justify-between transition-all ${
                    isNewlyCalled
                      ? 'border-[#F5C518] bg-amber-950/50 shadow-[0_0_40px_rgba(245,197,24,0.7)] animate-gold-flash'
                      : activeTicket
                      ? 'border-emerald-500/40 bg-[#0B2216] shadow-lg'
                      : isBreak
                      ? 'border-red-500/20 bg-[#120808] opacity-70'
                      : 'border-emerald-500/20 bg-[#071810]'
                  }`}
                >
                  {/* Barber Avatar & Info */}
                  <div className="flex items-center space-x-4 sm:space-x-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#163826] to-[#0A1810] border-2 border-[#F5C518]/60 flex items-center justify-center font-cinzel font-black text-2xl text-[#F5C518] shadow">
                      {barber.name[0]}
                    </div>
                    <div>
                      <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-white">
                        {barber.name}
                      </h3>
                      <span className="text-xs sm:text-sm text-gray-400 font-medium">
                        {isBreak ? 'On Break' : 'Master Stylist'}
                      </span>
                    </div>
                  </div>

                  {/* SCREEN 6 MAIN REQUIREMENT: 'Now: S-12' */}
                  <div className="text-right">
                    {activeTicket ? (
                      <div>
                        <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold block mb-1">
                          {activeTicket.status === 'called' ? 'Calling Guest' : 'In Service'}
                        </span>
                        <div className="font-cinzel text-3xl sm:text-5xl font-black text-[#F5C518] tracking-wider drop-shadow-[0_2px_15px_rgba(245,197,24,0.5)]">
                          {t('display.nowServingToken', { token: activeTicket.token })}
                        </div>
                        <span className="text-xs text-gray-300 font-medium block mt-1">
                          {activeTicket.customer_name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm sm:text-base font-semibold text-gray-500 italic">
                        {isBreak ? 'Station Paused' : t('display.chairVacant')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SCREEN 6 RIGHT: 'Up next' list of 5 tokens with estimated times */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-900/60">
            <h2 className="font-cinzel text-xl sm:text-2xl font-black text-[#F5C518] flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-[#00FF87]" />
              <span>{t('display.upNext')}</span>
            </h2>
            <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
              {waitingTickets.length} in queue
            </span>
          </div>

          <div className="loki-card p-6 rounded-3xl border-2 border-emerald-500/30 shadow-xl flex-1 flex flex-col justify-around space-y-3">
            {upNextFive.length === 0 ? (
              <div className="py-20 text-center text-gray-400 font-cinzel text-base">
                No guests in queue. Walk right in!
              </div>
            ) : (
              upNextFive.map((item, index) => {
                let servicesArr: string[] = [];
                try {
                  servicesArr = JSON.parse(item.services);
                } catch {
                  servicesArr = [item.services];
                }

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-[#07160E] border border-emerald-500/25 flex items-center justify-between hover:border-[#F5C518]/50 transition-all"
                  >
                    <div className="flex items-center space-x-3.5">
                      <span className="w-8 h-8 rounded-full bg-[#122F1E] border border-[#F5C518]/40 flex items-center justify-center font-cinzel font-bold text-[#F5C518] text-sm shrink-0">
                        #{index + 1}
                      </span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-cinzel font-black text-xl sm:text-2xl text-white">
                            {item.token}
                          </span>
                          <span className="text-xs text-gray-300 font-semibold">
                            {item.customer_name}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {servicesArr.slice(0, 2).join(', ')} · Prefers: {item.preferred_barber}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-[#00FF87] font-bold text-sm sm:text-base font-cinzel">
                        <Clock className="w-3.5 h-3.5" />
                        <span>~{item.estimated_wait} min</span>
                      </div>
                      <span className="text-[10px] text-gray-400 block uppercase tracking-wider">
                        Est. Wait
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Ambient Cinematic Ticker */}
      <div className="mt-6 pt-3 border-t border-emerald-950 overflow-hidden">
        <div className="whitespace-nowrap text-xs font-cinzel tracking-widest text-emerald-400/80 animate-pulse text-center">
          {t('display.ticker')}
        </div>
      </div>
    </div>
  );
};
