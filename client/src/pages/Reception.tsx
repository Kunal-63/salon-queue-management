import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import type { QueueTicket, BarberItem, ServiceItem } from '../services/api';
import { socket } from '../services/socket';
import {
  Scissors,
  Plus,
  Clock,
  AlertTriangle,
  X,
  PhoneCall,
  Search,
  Sparkles,
} from 'lucide-react';

export const Reception: React.FC = () => {
  const { t, language } = useLanguage();

  const [queue, setQueue] = useState<QueueTicket[]>([]);
  const [barbers, setBarbers] = useState<BarberItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Walk-in Modal State
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInServices, setWalkInServices] = useState<string[]>(['Haircut']);
  const [walkInBarber, setWalkInBarber] = useState('Any');
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmittingWalkIn, setIsSubmittingWalkIn] = useState(false);

  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const data = await api.getQueue();
      setQueue(data.queue);
      setBarbers(data.barbers);

      const srv = await api.getServices();
      setServices(srv);
    } catch (err) {
      console.error('Failed to load reception data', err);
    }
  };

  useEffect(() => {
    loadData();

    socket.on('queue:updated', (data) => {
      if (data.queue) setQueue(data.queue);
      if (data.barbers) setBarbers(data.barbers);
    });

    return () => {
      socket.off('queue:updated');
    };
  }, []);

  // Action: Call Next for a Barber
  const handleCallNext = async (barberName: string) => {
    try {
      setActionNotice(null);
      const res = await api.callNext(barberName);
      if (res.ticket) {
        setActionNotice(`Called ${res.ticket.token} (${res.ticket.customer_name}) to ${barberName}`);
        loadData();
      }
    } catch (err: any) {
      setActionNotice(err.message || `No waiting customer available for ${barberName}`);
    }
  };

  // Action: Mark No-show
  const handleMarkNoShow = async (token: string) => {
    try {
      await api.markNoShow(token);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error marking no-show');
    }
  };

  // Action: Cancel ticket
  const handleCancelTicket = async (token: string) => {
    if (!window.confirm(`Cancel token ${token}?`)) return;
    try {
      await api.cancelTicket(token);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error cancelling ticket');
    }
  };

  // Walk-in Submit
  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName.trim()) {
      setModalError(t('join.nameError'));
      return;
    }
    const cleanPhone = walkInPhone.trim().replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setModalError(t('join.phoneError'));
      return;
    }
    if (walkInServices.length === 0) {
      setModalError(t('join.selectOneError'));
      return;
    }

    setIsSubmittingWalkIn(true);
    setModalError(null);

    try {
      await api.joinQueue({
        customer_name: walkInName.trim(),
        phone: cleanPhone,
        preferred_barber: walkInBarber,
        service_names: walkInServices,
        is_walkin: true,
      });

      setShowWalkInModal(false);
      setWalkInName('');
      setWalkInPhone('');
      setWalkInServices(['Haircut']);
      setWalkInBarber('Any');
      loadData();
    } catch (err: any) {
      setModalError(err.message || 'Error adding walk-in');
    } finally {
      setIsSubmittingWalkIn(false);
    }
  };

  const waitingTickets = queue.filter((t) => t.status === 'waiting');
  const filteredWaiting = waitingTickets.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.token.toLowerCase().includes(q) ||
      t.customer_name.toLowerCase().includes(q) ||
      t.phone.includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* SCREEN 4 TOP BAR: Title + [ + Add walk-in ] Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-emerald-900/40 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-[#F5C518]">
              {t('reception.pageTitle')}
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#00FF87]/15 text-[#00FF87] border border-[#00FF87]/30 font-semibold">
              Live Console
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">{t('reception.pageSubtitle')}</p>
        </div>

        <button
          onClick={() => setShowWalkInModal(true)}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#F5C518] to-[#D4A017] hover:from-[#FFDF40] hover:to-[#E5A93C] text-gray-950 font-black text-sm tracking-wide uppercase shadow-[0_0_20px_rgba(245,197,24,0.4)] flex items-center space-x-2 cursor-pointer transition-transform hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4 font-bold" />
          <span>{t('reception.addWalkInBtn')}</span>
        </button>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs sm:text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#F5C518]" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TWO COLUMN WORKSPACE (TABLET OPTIMIZED) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SCREEN 4 LEFT: Barber Cards (Current customer, time left, [Call next]) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h2 className="font-cinzel text-lg font-bold text-[#F5C518] flex items-center space-x-2">
              <Scissors className="w-4 h-4 text-[#00FF87]" />
              <span>{t('reception.barberStations')}</span>
            </h2>
            <span className="text-xs text-gray-400">{barbers.length} Active Chairs</span>
          </div>

          <div className="space-y-4">
            {barbers.map((barber) => {
              const currentTicket = queue.find(
                (t) => t.id === barber.current_ticket_id || (t.assigned_barber === barber.name && (t.status === 'in_chair' || t.status === 'called'))
              );

              const isBreak = barber.status === 'break';
              const isBusy = barber.status === 'busy';

              // Elapsed time or time left calculation
              const minutesElapsed = barber.service_started_at
                ? Math.max(0, Math.round((Date.now() - new Date(barber.service_started_at).getTime()) / 60000))
                : 0;

              const totalDuration = currentTicket ? currentTicket.total_duration : 30;
              const approxMinutesLeft = Math.max(0, totalDuration - minutesElapsed);

              return (
                <div
                  key={barber.name}
                  className={`p-5 rounded-2xl loki-card border transition-all ${
                    isBusy
                      ? 'border-[#F5C518]/50 shadow-[0_0_20px_rgba(245,197,24,0.15)]'
                      : isBreak
                      ? 'border-red-500/30 bg-[#160B0B]'
                      : 'border-emerald-500/40 bg-[#091D13]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3 border-b border-emerald-950 pb-2.5">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-[#163826] border border-[#F5C518]/50 flex items-center justify-center font-cinzel font-bold text-[#F5C518]">
                        {barber.name[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">{barber.name}</h3>
                        <span className="text-[11px] text-gray-400">Chair #{barber.id}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                        isBusy
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : isBreak
                          ? 'bg-red-500/20 text-red-300 border-red-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      {isBusy ? t('home.statusBusy') : isBreak ? t('home.statusBreak') : t('home.statusFree')}
                    </span>
                  </div>

                  {/* Current Customer Info */}
                  <div className="mb-4">
                    {currentTicket ? (
                      <div className="p-3.5 rounded-xl bg-[#07150E] border border-emerald-500/20 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-cinzel font-black text-lg text-[#F5C518]">
                            {currentTicket.token}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-[#F5C518]/20 text-[#F5C518] font-bold">
                            {currentTicket.status === 'called' ? 'Called (Waiting)' : 'In Chair'}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-white">
                          {currentTicket.customer_name}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-[#00FF87]" />
                            <span>
                              {t('reception.timeLeft')}: ~{approxMinutesLeft} {t('min')}
                            </span>
                          </span>
                          <span>{currentTicket.phone}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-5 text-center text-gray-500 text-xs italic bg-[#07150E]/60 rounded-xl border border-dashed border-emerald-950">
                        {isBreak ? 'Barber on Break' : t('reception.chairEmpty')}
                      </div>
                    )}
                  </div>

                  {/* SCREEN 4 MAIN REQUIREMENT: [ Call next ] Button */}
                  <button
                    onClick={() => handleCallNext(barber.name)}
                    disabled={isBreak}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#F5C518] to-[#D4A017] hover:from-[#FFDF40] hover:to-[#E5A93C] text-gray-950 font-bold text-xs uppercase tracking-wider shadow flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{t('reception.callNextBtn')}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* SCREEN 4 RIGHT: Waiting list in order */}
        {/* Token, name, services, preferred barber, waiting time, [No-show] [Cancel] */}
        {/* SCREEN 4 REQUIREMENT: Waiting > 60 min highlighted in amber */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
            <h2 className="font-cinzel text-lg font-bold text-[#F5C518] flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#00FF87]" />
              <span>
                {t('reception.waitingListTitle')} ({waitingTickets.length})
              </span>
            </h2>

            {/* Quick Search */}
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder={t('reception.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#07150E] border border-emerald-500/30 text-white text-xs focus:outline-none focus:border-[#F5C518]"
              />
            </div>
          </div>

          <div className="loki-card overflow-hidden rounded-2xl border border-emerald-500/30 shadow-xl">
            {filteredWaiting.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-sm">
                {t('reception.noWaiters')}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#091D13] text-gray-400 uppercase tracking-wider text-[10px] border-b border-emerald-900/60 font-semibold">
                    <tr>
                      <th className="px-4 py-3.5">{t('reception.colToken')}</th>
                      <th className="px-4 py-3.5">{t('reception.colGuest')}</th>
                      <th className="px-4 py-3.5">{t('reception.colServices')}</th>
                      <th className="px-4 py-3.5">{t('reception.colBarber')}</th>
                      <th className="px-4 py-3.5">{t('reception.colWait')}</th>
                      <th className="px-4 py-3.5 text-right">{t('reception.colActions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-950/60">
                    {filteredWaiting.map((item) => {
                      let srvList: string[] = [];
                      try {
                        srvList = JSON.parse(item.services);
                      } catch {
                        srvList = [item.services];
                      }

                      // Waiting time in minutes
                      const waitMinutes = item.estimated_wait ?? 30;
                      // SCREEN 4 REQUIREMENT: Waiting > 60 min highlighted in amber!
                      const isOver60 = waitMinutes > 60;

                      return (
                        <tr
                          key={item.id}
                          className={`transition-colors ${
                            isOver60
                              ? 'bg-amber-950/30 hover:bg-amber-950/50 border-l-4 border-amber-400'
                              : 'hover:bg-[#0C2216]'
                          }`}
                        >
                          <td className="px-4 py-3.5 font-cinzel font-black text-sm text-[#F5C518] whitespace-nowrap">
                            {item.token}
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="font-semibold text-white block">
                              {item.customer_name}
                            </span>
                            <span className="text-[11px] text-gray-400">{item.phone}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex flex-wrap gap-1 max-w-[150px]">
                              {srvList.map((s, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 whitespace-nowrap"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 font-medium text-gray-300 whitespace-nowrap">
                            {item.preferred_barber}
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span
                              className={`font-bold inline-flex items-center space-x-1 ${
                                isOver60 ? 'text-amber-400 font-black' : 'text-[#00FF87]'
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              <span>~{waitMinutes} min</span>
                            </span>
                            {isOver60 && (
                              <span className="block text-[9px] text-amber-300 font-bold uppercase tracking-wider">
                                {t('reception.overdueWarning')}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1.5">
                            {/* [No-show] Button */}
                            <button
                              onClick={() => handleMarkNoShow(item.token)}
                              className="px-2.5 py-1 rounded-md bg-amber-900/40 hover:bg-amber-800/60 text-amber-300 border border-amber-500/40 text-[11px] font-semibold transition-colors cursor-pointer"
                              title="Mark No-Show"
                            >
                              {t('reception.markNoShow')}
                            </button>
                            {/* [Cancel] Button */}
                            <button
                              onClick={() => handleCancelTicket(item.token)}
                              className="px-2.5 py-1 rounded-md bg-red-950/60 hover:bg-red-900/80 text-red-400 border border-red-500/40 text-[11px] font-semibold transition-colors cursor-pointer"
                              title="Cancel Ticket"
                            >
                              {t('reception.cancelQueue')}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QUICK ADD WALK-IN MODAL */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl loki-card border-2 border-[#F5C518]/50 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3">
              <div>
                <h3 className="font-cinzel text-lg font-bold text-[#F5C518]">
                  {t('reception.walkInModalTitle')}
                </h3>
                <p className="text-xs text-gray-400">{t('reception.walkInModalDesc')}</p>
              </div>
              <button
                onClick={() => setShowWalkInModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleWalkInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                  {t('join.nameLabel')} *
                </label>
                <input
                  type="text"
                  required
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  placeholder="e.g. Ramesh Bhai"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#07150E] border border-emerald-500/30 text-white text-xs focus:outline-none focus:border-[#F5C518]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                  {t('join.phoneLabel')} *
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  value={walkInPhone}
                  onChange={(e) => setWalkInPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="10 digit mobile"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#07150E] border border-emerald-500/30 text-white text-xs focus:outline-none focus:border-[#F5C518]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                  {t('join.servicesLabel')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {services.map((s) => {
                    const isSel = walkInServices.includes(s.name_en);
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => {
                          if (isSel) {
                            if (walkInServices.length > 1) {
                              setWalkInServices(walkInServices.filter((x) => x !== s.name_en));
                            }
                          } else {
                            if (walkInServices.length < 3) {
                              setWalkInServices([...walkInServices, s.name_en]);
                            }
                          }
                        }}
                        className={`p-2 rounded-lg text-left text-xs border transition-colors ${
                          isSel
                            ? 'bg-[#123120] border-[#F5C518] text-[#F5C518] font-bold'
                            : 'bg-[#07150E] border-emerald-500/20 text-gray-300'
                        }`}
                      >
                        {language === 'gu' ? s.name_gu : s.name_en} · ₹{s.price}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                  {t('join.barberLabel')}
                </label>
                <select
                  value={walkInBarber}
                  onChange={(e) => setWalkInBarber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#07150E] border border-emerald-500/30 text-white text-xs focus:outline-none focus:border-[#F5C518]"
                >
                  <option value="Any">{t('join.anyBarber')}</option>
                  {barbers.map((b) => (
                    <option key={b.name} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWalkIn}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#F5C518] to-[#D4A017] text-gray-950 text-xs font-bold shadow disabled:opacity-50"
                >
                  {isSubmittingWalkIn ? '...' : t('confirm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
