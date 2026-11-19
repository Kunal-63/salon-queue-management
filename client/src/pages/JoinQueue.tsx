import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircle2, Clock, IndianRupee, ShieldCheck } from 'lucide-react';

export const JoinQueue: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedServices, setSelectedServices] = useState<number[]>([1]);
  const [selectedBarber, setSelectedBarber] = useState<string>('Any');
  const [errorMsg, setErrorMsg] = useState('');

  const services = [
    { id: 1, name: 'Haircut', duration: 30, price: 150 },
    { id: 2, name: 'Beard trim', duration: 15, price: 80 },
    { id: 3, name: 'Hair spa', duration: 45, price: 400 },
    { id: 4, name: 'Hair color', duration: 60, price: 600 },
  ];

  const barbers = [
    { name: 'Any', label: t('anyBarberFastest') },
    { name: 'Ravi', label: 'Ravi' },
    { name: 'Amit', label: 'Amit' },
    { name: 'Imran', label: 'Imran' },
  ];

  const toggleService = (id: number) => {
    if (selectedServices.includes(id)) {
      if (selectedServices.length === 1) return; // Keep at least one
      setSelectedServices(selectedServices.filter((s) => s !== id));
      setErrorMsg('');
    } else {
      if (selectedServices.length >= 3) {
        setErrorMsg(t('maxServicesReached'));
        return;
      }
      setSelectedServices([...selectedServices, id]);
      setErrorMsg('');
    }
  };

  const selectedList = services.filter((s) => selectedServices.includes(s.id));
  const totalDuration = selectedList.reduce((acc, s) => acc + s.duration, 0);
  const totalPrice = selectedList.reduce((acc, s) => acc + s.price, 0);
  const expectedWait = 35; // placeholder

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg(t('nameRequired'));
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMsg(t('phoneInvalid'));
      return;
    }
    // Navigate to status screen with dummy token
    navigate('/status/S-14');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold text-white tracking-wide">
        {t('joinQueueTitle')}
      </h1>

      <form onSubmit={handleConfirm} className="space-y-6">
        {/* Name and Phone Input */}
        <div className="bg-[#1F2937] border border-gray-700/60 rounded-2xl p-5 space-y-4 shadow-lg">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              {t('fullName')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('namePlaceholder')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A017] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              {t('phone')}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('phonePlaceholder')}
              maxLength={10}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A017] transition-colors"
            />
          </div>
        </div>

        {/* Services Selection (Max 3) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-300">
              {t('serviceSelectLimit')}
            </label>
            <span className="text-xs text-[#D4A017] font-medium">
              {selectedServices.length}/3
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {services.map((service) => {
              const isSelected = selectedServices.includes(service.id);
              return (
                <div
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#1F2937] border-[#D4A017] ring-1 ring-[#D4A017]'
                      : 'bg-[#1F2937]/70 border-gray-700/60 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <CheckCircle2
                      className={`w-5 h-5 ${
                        isSelected ? 'text-[#D4A017]' : 'text-gray-600'
                      }`}
                    />
                    <div>
                      <p className="font-semibold text-white text-sm">
                        {service.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {service.duration} {t('minutesShort')}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-[#D4A017] text-sm">
                    {t('currency')}{service.price}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Barber Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-300">
            {t('selectBarberTitle')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {barbers.map((b) => {
              const isSelected = selectedBarber === b.name;
              return (
                <button
                  type="button"
                  key={b.name}
                  onClick={() => setSelectedBarber(b.name)}
                  className={`p-3 rounded-xl border text-center font-medium text-xs transition-all ${
                    isSelected
                      ? 'bg-[#1F2937] border-[#D4A017] text-[#D4A017] ring-1 ring-[#D4A017]'
                      : 'bg-[#1F2937]/70 border-gray-700 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Error Notice */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Live Summary Card */}
        <div className="bg-[#1F2937] border border-gray-700/60 rounded-2xl p-4 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            {t('liveSummaryTitle')}
          </span>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300 flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-[#D4A017]" />
              <span>{t('totalDuration')}:</span>
            </span>
            <span className="font-bold text-white">
              {totalDuration} {t('minutesShort')}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300 flex items-center space-x-1.5">
              <IndianRupee className="w-4 h-4 text-[#D4A017]" />
              <span>{t('totalPrice')}:</span>
            </span>
            <span className="font-bold text-[#D4A017]">
              {t('currency')}{totalPrice}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-700/50">
            <span className="text-gray-300 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{t('expectedWaitTime')}:</span>
            </span>
            <span className="font-bold text-emerald-400">
              ~{expectedWait} {t('minutesShort')}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3.5 px-5 rounded-2xl bg-[#D4A017] hover:bg-[#E5AE1B] text-gray-950 font-bold text-base shadow-lg transition-all active:scale-95"
        >
          {t('confirmAndJoin')}
        </button>
      </form>
    </div>
  );
};
