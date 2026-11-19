import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import type { ServiceItem, BarberItem } from '../services/api';
import {
  Scissors,
  CheckCircle2,
  Clock,
  User,
  Phone,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const JoinQueue: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>(['Haircut']);
  const [barbers, setBarbers] = useState<BarberItem[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<string>('Any');
  const [isOnlineOpen, setIsOnlineOpen] = useState(true);
  const [expectedWait, setExpectedWait] = useState(35);

  const [errors, setErrors] = useState<{ name?: string; phone?: string; services?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverNotice, setServerNotice] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const queueRes = await api.getQueue();
        setBarbers(queueRes.barbers);
        setIsOnlineOpen(queueRes.isOnlineOpen);
        setExpectedWait(queueRes.stats.approxWait || 35);

        const servRes = await api.getServices();
        setServices(servRes);
      } catch (err) {
        console.error('Error fetching join queue data', err);
      }
    };
    fetchData();
  }, []);

  // Multi-select toggle (Max 3)
  const toggleService = (serviceName: string) => {
    setErrors((prev) => ({ ...prev, services: undefined }));
    if (selectedServices.includes(serviceName)) {
      if (selectedServices.length === 1) {
        setErrors((prev) => ({ ...prev, services: t('join.selectOneError') }));
        return;
      }
      setSelectedServices(selectedServices.filter((s) => s !== serviceName));
    } else {
      if (selectedServices.length >= 3) {
        setErrors((prev) => ({ ...prev, services: t('join.maxReached') }));
        return;
      }
      setSelectedServices([...selectedServices, serviceName]);
    }
  };

  // Calculate live summary
  const totalDuration = selectedServices.reduce((sum, name) => {
    const s = services.find((item) => item.name_en === name);
    return sum + (s ? s.duration : 30);
  }, 0);

  const totalPrice = selectedServices.reduce((sum, name) => {
    const s = services.find((item) => item.name_en === name);
    return sum + (s ? s.price : 150);
  }, 0);

  // Form Validation
  const validateForm = (): boolean => {
    const newErrors: { name?: string; phone?: string; services?: string } = {};

    if (!name.trim()) {
      newErrors.name = t('join.nameError');
    }

    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      newErrors.phone = t('join.phoneError');
    }

    if (selectedServices.length === 0) {
      newErrors.services = t('join.selectOneError');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!isOnlineOpen) {
      setServerNotice(t('join.closedMsg'));
      return;
    }

    setIsSubmitting(true);
    setServerNotice(null);

    try {
      const res = await api.joinQueue({
        customer_name: name.trim(),
        phone: phone.trim().replace(/\D/g, ''),
        preferred_barber: selectedBarber,
        service_names: selectedServices,
      });

      if (res.ticket) {
        navigate(`/status/${res.ticket.token}`);
      }
    } catch (err: any) {
      setServerNotice(err.message || 'Error joining queue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const chosenBarberObj = barbers.find((b) => b.name === selectedBarber);
  const isChosenBarberOnBreak = chosenBarberObj?.status === 'break';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Page Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0E281A] border border-[#00FF87]/30 text-[#00FF87] text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#F5C518]" />
          <span>{t('routes.join')}</span>
        </div>
        <h1 className="font-cinzel text-2xl sm:text-4xl font-extrabold text-[#F5C518] tracking-wide mb-2">
          {t('join.pageTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto">
          {t('join.pageSubtitle')}
        </p>
      </div>

      {!isOnlineOpen && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/70 border border-red-500/50 flex items-center space-x-3 text-red-200 text-sm">
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
          <span>{t('join.closedMsg')}</span>
        </div>
      )}

      {serverNotice && (
        <div className="mb-6 p-4 rounded-xl bg-amber-950/70 border border-amber-500/50 flex items-center space-x-3 text-amber-200 text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{serverNotice}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Customer Identification */}
        <div className="loki-card p-6 sm:p-8 space-y-5">
          <h2 className="font-cinzel text-base sm:text-lg font-bold text-[#F5C518] border-b border-emerald-900/40 pb-2.5 flex items-center space-x-2">
            <User className="w-4 h-4 text-[#00FF87]" />
            <span>1. {t('join.nameLabel')}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                {t('join.nameLabel')} *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  placeholder={t('join.namePlaceholder')}
                  className={`w-full px-4 py-3 rounded-xl bg-[#07150E] border text-white text-sm focus:outline-none transition-all ${
                    errors.name
                      ? 'border-red-500 focus:border-red-400 focus:ring-1 focus:ring-red-400'
                      : 'border-emerald-500/30 focus:border-[#F5C518] focus:ring-1 focus:ring-[#F5C518]/50'
                  }`}
                />
              </div>
              {errors.name && <p className="text-red-400 text-xs mt-1.5">{errors.name}</p>}
            </div>

            {/* Mobile Phone (10 digits validated) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                {t('join.phoneLabel')} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 text-sm">
                  +91
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, '');
                    setPhone(cleaned);
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                  }}
                  placeholder={t('join.phonePlaceholder')}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl bg-[#07150E] border text-white text-sm focus:outline-none transition-all ${
                    errors.phone
                      ? 'border-red-500 focus:border-red-400 focus:ring-1 focus:ring-red-400'
                      : 'border-emerald-500/30 focus:border-[#F5C518] focus:ring-1 focus:ring-[#F5C518]/50'
                  }`}
                />
                <Phone className="absolute right-3.5 top-3.5 w-4 h-4 text-gray-500" />
              </div>
              {errors.phone && <p className="text-red-400 text-xs mt-1.5">{errors.phone}</p>}
            </div>
          </div>
        </div>

        {/* Step 2: Service Cards (Multi-select, Max 3) */}
        <div className="loki-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-900/40 pb-2.5">
            <h2 className="font-cinzel text-base sm:text-lg font-bold text-[#F5C518] flex items-center space-x-2">
              <Scissors className="w-4 h-4 text-[#00FF87]" />
              <span>2. {t('join.servicesLabel')}</span>
            </h2>
            <span className="text-xs text-emerald-400 font-semibold">
              {selectedServices.length}/3 {language === 'en' ? 'Selected' : 'પસંદ કરેલ'}
            </span>
          </div>

          <p className="text-xs text-gray-400">{t('join.servicesSubtitle')}</p>

          {errors.services && (
            <p className="text-red-400 text-xs bg-red-950/40 p-2.5 rounded-lg border border-red-500/30">
              {errors.services}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
            {services.map((service) => {
              const isSelected = selectedServices.includes(service.name_en);
              return (
                <div
                  key={service.id}
                  onClick={() => toggleService(service.name_en)}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-br from-[#123120] to-[#0A2015] border-[#F5C518] shadow-[0_0_15px_rgba(245,197,24,0.3)] scale-[1.02]'
                      : 'bg-[#081810] border-emerald-500/20 hover:border-emerald-500/50 hover:bg-[#0C2217]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-bold text-sm text-gray-100">
                      {language === 'gu' ? service.name_gu : service.name_en}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ml-2 ${
                        isSelected
                          ? 'bg-[#F5C518] text-gray-950'
                          : 'border border-gray-600 bg-transparent'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 font-bold" />}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-emerald-900/40">
                    <span className="flex items-center space-x-1 text-gray-400">
                      <Clock className="w-3 h-3 text-[#00FF87]" />
                      <span>
                        {service.duration} {t('min')}
                      </span>
                    </span>
                    <span className="font-cinzel font-black text-[#F5C518] text-sm">
                      ₹{service.price}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 3: Barber Picker ('Any barber' or specific barber) */}
        <div className="loki-card p-6 sm:p-8 space-y-4">
          <h2 className="font-cinzel text-base sm:text-lg font-bold text-[#F5C518] border-b border-emerald-900/40 pb-2.5 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#00FF87]" />
            <span>3. {t('join.barberLabel')}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 pt-2">
            {/* Any Barber (Fastest) */}
            <div
              onClick={() => setSelectedBarber('Any')}
              className={`p-4 rounded-xl cursor-pointer transition-all border flex flex-col justify-between ${
                selectedBarber === 'Any'
                  ? 'bg-gradient-to-br from-[#123120] to-[#0A2015] border-[#F5C518] shadow-[0_0_15px_rgba(245,197,24,0.3)]'
                  : 'bg-[#081810] border-emerald-500/20 hover:border-emerald-500/50'
              }`}
            >
              <div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F5C518] to-[#B3860F] flex items-center justify-center text-gray-950 mb-2 font-bold shadow">
                  ⚡
                </div>
                <h3 className="font-bold text-sm text-white">{t('join.anyBarber')}</h3>
                <p className="text-[11px] text-gray-400 mt-1">{t('join.anyBarberDesc')}</p>
              </div>
              <span className="text-[11px] font-semibold text-[#00FF87] mt-3 block">
                ⚡ Fastest Turnaround
              </span>
            </div>

            {/* Individual Barbers */}
            {barbers.map((barber) => {
              const isSelected = selectedBarber === barber.name;
              const isOnBreak = barber.status === 'break';
              return (
                <div
                  key={barber.name}
                  onClick={() => setSelectedBarber(barber.name)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-br from-[#123120] to-[#0A2015] border-[#F5C518] shadow-[0_0_15px_rgba(245,197,24,0.3)]'
                      : 'bg-[#081810] border-emerald-500/20 hover:border-emerald-500/50'
                  }`}
                >
                  <div>
                    <div className="w-10 h-10 rounded-full bg-[#163826] border border-[#F5C518]/40 flex items-center justify-center text-[#F5C518] font-cinzel font-bold text-sm mb-2 shadow">
                      {barber.name[0]}
                    </div>
                    <h3 className="font-bold text-sm text-white">{barber.name}</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Master Barber</p>
                  </div>

                  <div className="mt-3">
                    {isOnBreak ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-500/30">
                        {t('home.statusBreak')}
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                        {t('home.statusFree')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Warning if selected barber is on break */}
          {isChosenBarberOnBreak && (
            <div className="p-3 rounded-lg bg-amber-950/50 border border-amber-500/40 text-amber-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                {t('join.barberOnBreak')} — {selectedBarber} is on break. You can still book them, or choose 'Any barber' for fastest service.
              </span>
            </div>
          )}
        </div>

        {/* SCREEN 2 MAIN REQUIREMENT: Live Summary Card */}
        {/* 'Total 45 min · ₹230 · Expected wait ~35 min' */}
        <div className="loki-card-gold p-6 sm:p-8 border-2 border-[#F5C518]/60 shadow-[0_0_30px_rgba(245,197,24,0.25)] space-y-5">
          <div className="flex items-center justify-between border-b border-[#F5C518]/30 pb-3">
            <h3 className="font-cinzel text-base sm:text-lg font-bold text-[#F5C518]">
              {t('join.summaryTitle')}
            </h3>
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#F5C518]/20 text-[#F5C518] font-bold border border-[#F5C518]/40">
              Live Quote
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
            <div className="p-3 rounded-xl bg-[#091A11]/80 border border-emerald-500/20">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                {t('join.totalDuration')}
              </span>
              <span className="text-xl sm:text-2xl font-black text-white font-cinzel">
                {totalDuration} {t('min')}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#091A11]/80 border border-emerald-500/20">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                {t('join.totalPrice')}
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#F5C518] font-cinzel">
                ₹{totalPrice}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#091A11]/80 border border-emerald-500/20">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                {t('join.expectedWait')}
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#00FF87] font-cinzel">
                ~{expectedWait} {t('min')}
              </span>
            </div>
          </div>

          {/* SCREEN 2 MAIN REQUIREMENT: [ Confirm ] Button */}
          <button
            type="submit"
            disabled={isSubmitting || !isOnlineOpen}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#F5C518] via-[#FFD700] to-[#D4A017] hover:from-[#FFDF40] hover:to-[#E5A93C] text-gray-950 font-black text-base sm:text-lg tracking-wider uppercase shadow-[0_0_25px_rgba(245,197,24,0.5)] hover:shadow-[0_0_35px_rgba(245,197,24,0.8)] transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isSubmitting ? t('join.submittingBtn') : t('join.submitBtn')}</span>
            <ArrowRight className="w-5 h-5 font-bold" />
          </button>
        </div>
      </form>
    </div>
  );
};
