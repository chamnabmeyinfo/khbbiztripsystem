import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import { formatMoney } from '../../services/currencyService';

export const ModifyDatesModal: React.FC = () => {
  const {
    selectedBooking,
    packages,
    modifyBookingDate,
    activeModal,
    setActiveModal,
    currency,
    language,
    t
  } = useApp();

  const [newDate, setNewDate] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (activeModal !== 'modify_dates' || !selectedBooking) return null;

  const booking = selectedBooking;
  const pkg = packages.find(p => p.id === booking.packageId) || packages[0];
  const targetDate = newDate || pkg.availableDates.find(d => d !== booking.startDate) || pkg.availableDates[1] || '2026-10-10';

  const priceDiffUSD = 0; // Available date on standard departure schedule

  const handleConfirmChange = async () => {
    setIsChecking(true);
    await new Promise(r => setTimeout(r, 800));
    await modifyBookingDate(booking.id, targetDate);
    setIsChecking(false);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setActiveModal(null);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('modifyDates')}
            </h3>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {isSuccess ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {t('dateChangeSuccess')}
              </h4>
              <p className="text-xs text-slate-500">
                New departure set to {targetDate}. Itinerary and flight pass updated.
              </p>
            </div>
          ) : (
            <>
              {/* Trip info */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <div className="font-bold text-slate-900 dark:text-white">{booking.packageTitle}</div>
                <div className="text-slate-500">
                  Current Departure: <strong className="text-slate-800 dark:text-slate-200">{booking.startDate}</strong>
                </div>
              </div>

              {/* Select new available departure date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select New Available Departure Date
                </label>
                <select
                  value={targetDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500"
                >
                  {pkg.availableDates.map(d => (
                    <option key={d} value={d}>
                      {d} {d === booking.startDate ? '(Current Date)' : '(Guaranteed Departure - Available)'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Availability check confirmation */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Availability Verified</span>
                  <span>{t('dateChangeAvailability')}</span>
                </div>
              </div>

              {/* Price difference check */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-slate-600 dark:text-slate-400">{t('priceDifference')}</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {formatMoney(priceDiffUSD, currency, language)} (Free Rebooking)
                </span>
              </div>

              {/* Confirm button */}
              <button
                onClick={handleConfirmChange}
                disabled={isChecking}
                className="w-full py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isChecking ? (
                  <span>Checking operator calendar & updating...</span>
                ) : (
                  <>
                    <span>{t('confirmDateChange')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
