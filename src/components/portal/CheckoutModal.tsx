import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatMoney } from '../../services/currencyService';
import confetti from 'canvas-confetti';
import {
  X,
  CreditCard,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Fingerprint,
  Calendar,
  Users,
  Building,
  Plane,
  Download,
  FileText,
  QrCode,
  Building2,
  Clock,
  RefreshCw,
  Phone,
  Send,
  AlertCircle,
  ArrowRight,
  Check
} from 'lucide-react';
import { Booking } from '../../types';

export const CheckoutModal: React.FC = () => {
  const {
    selectedPackage,
    activeModal,
    setActiveModal,
    currency,
    language,
    currentUser,
    createBooking,
    setSelectedBooking,
    setActiveView,
    systemSettings,
    t
  } = useApp();

  // Dynamic Gateway Definitions based on SystemSettings.paymentGateways
  const availableGateways = useMemo(() => {
    const gateways = systemSettings?.paymentGateways || {
      abaPayWay: true,
      acledaXPay: true,
      wingBank: true,
      cards: true,
      applePay: true,
      googlePay: true,
      biometricWallet: true
    };

    const list: {
      id: 'aba_payway' | 'acleda_xpay' | 'wing_bank' | 'card' | 'apple_pay' | 'biometric_wallet' | 'bank_wire';
      name: string;
      subtitle: string;
      badge: string;
      icon: any;
      brandColor: string;
      bgActive: string;
      borderActive: string;
    }[] = [];

    if (gateways.abaPayWay !== false) {
      list.push({
        id: 'aba_payway',
        name: 'ABA PayWay',
        subtitle: 'KHQR Instant Scan',
        badge: 'Bakong / ABA',
        icon: QrCode,
        brandColor: 'text-sky-600 dark:text-sky-400',
        bgActive: 'bg-sky-50/70 dark:bg-sky-950/40',
        borderActive: 'border-sky-500'
      });
    }

    if (gateways.acledaXPay !== false) {
      list.push({
        id: 'acleda_xpay',
        name: 'ACLEDA X-Pay',
        subtitle: 'ACLEDA Mobile KHQR',
        badge: 'ACLEDA QR',
        icon: Building2,
        brandColor: 'text-blue-700 dark:text-blue-400',
        bgActive: 'bg-blue-50/70 dark:bg-blue-950/40',
        borderActive: 'border-blue-600'
      });
    }

    if (gateways.wingBank !== false) {
      list.push({
        id: 'wing_bank',
        name: 'Wing Bank',
        subtitle: 'WingPay & Account',
        badge: 'WingPay',
        icon: Smartphone,
        brandColor: 'text-lime-600 dark:text-lime-400',
        bgActive: 'bg-lime-50/70 dark:bg-lime-950/40',
        borderActive: 'border-lime-500'
      });
    }

    if (gateways.cards !== false) {
      list.push({
        id: 'card',
        name: 'Credit / Debit',
        subtitle: 'Visa, MC, JCB, UnionPay',
        badge: 'Stripe 3DS',
        icon: CreditCard,
        brandColor: 'text-indigo-600 dark:text-indigo-400',
        bgActive: 'bg-indigo-50/70 dark:bg-indigo-950/40',
        borderActive: 'border-indigo-500'
      });
    }

    if (gateways.applePay !== false || gateways.googlePay !== false) {
      list.push({
        id: 'apple_pay',
        name: 'Apple / Google Pay',
        subtitle: '1-Touch Express Pay',
        badge: 'Mobile Express',
        icon: Smartphone,
        brandColor: 'text-slate-800 dark:text-slate-200',
        bgActive: 'bg-slate-100 dark:bg-slate-800',
        borderActive: 'border-slate-500'
      });
    }

    if (gateways.biometricWallet !== false) {
      list.push({
        id: 'biometric_wallet',
        name: 'Biometric Passkey',
        subtitle: 'WebAuthn FaceID / TouchID',
        badge: 'Passkey',
        icon: Fingerprint,
        brandColor: 'text-amber-600 dark:text-amber-400',
        bgActive: 'bg-amber-50/70 dark:bg-amber-950/40',
        borderActive: 'border-amber-500'
      });
    }

    // Always offer Corporate Bank Wire as an official corporate reservation channel
    list.push({
      id: 'bank_wire',
      name: 'Bank Wire Transfer',
      subtitle: 'Official Corporate MoC Account',
      badge: 'B2B Wire',
      icon: Building,
      brandColor: 'text-emerald-700 dark:text-emerald-400',
      bgActive: 'bg-emerald-50/70 dark:bg-emerald-950/40',
      borderActive: 'border-emerald-600'
    });

    return list;
  }, [systemSettings?.paymentGateways]);

  // Selected payment method with automatic fallback to first enabled gateway
  const [paymentMethod, setPaymentMethod] = useState<'aba_payway' | 'acleda_xpay' | 'wing_bank' | 'card' | 'apple_pay' | 'biometric_wallet' | 'bank_wire'>('aba_payway');

  // Auto-switch payment method if the current selection is disabled in settings
  useEffect(() => {
    if (availableGateways.length > 0) {
      const isCurrentEnabled = availableGateways.some(g => g.id === paymentMethod);
      if (!isCurrentEnabled) {
        setPaymentMethod(availableGateways[0].id);
      }
    }
  }, [availableGateways, paymentMethod]);

  // Card Inputs
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('888');
  const [cardHolder, setCardHolder] = useState(currentUser?.name || 'Sokha Chan');
  
  // KHQR Interactive states
  const [khqrTimer, setKhqrTimer] = useState(899); // 14:59 min countdown
  const [copiedKhqr, setCopiedKhqr] = useState(false);

  // Booking Parameters
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [departureDate, setDepartureDate] = useState(selectedPackage?.availableDates?.[0] || '2026-10-29');
  const [specialRequests, setSpecialRequests] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  const draftStorageKey = useMemo(() => {
    return selectedPackage ? `khb_checkout_draft_${selectedPackage.id}` : null;
  }, [selectedPackage]);

  // Restore draft from localStorage when package changes or on mount
  useEffect(() => {
    if (!draftStorageKey) return;
    try {
      const saved = localStorage.getItem(draftStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.adults === 'number' && parsed.adults >= 1) setAdults(parsed.adults);
        if (typeof parsed.children === 'number' && parsed.children >= 0) setChildren(parsed.children);
        if (typeof parsed.departureDate === 'string' && parsed.departureDate) setDepartureDate(parsed.departureDate);
        if (typeof parsed.specialRequests === 'string') setSpecialRequests(parsed.specialRequests);
        if (typeof parsed.paymentMethod === 'string') setPaymentMethod(parsed.paymentMethod);
        if (typeof parsed.cardHolder === 'string' && parsed.cardHolder) setCardHolder(parsed.cardHolder);
        if (typeof parsed.cardNumber === 'string' && parsed.cardNumber) setCardNumber(parsed.cardNumber);
        if (typeof parsed.expiry === 'string' && parsed.expiry) setExpiry(parsed.expiry);
        if (typeof parsed.cvv === 'string' && parsed.cvv) setCvv(parsed.cvv);
        setHasRestoredDraft(true);
      }
    } catch (e) {
      console.warn('Failed to load checkout draft from localStorage', e);
    }
  }, [draftStorageKey]);

  // Auto-save draft on input change
  useEffect(() => {
    if (!draftStorageKey || confirmedBooking) return;
    try {
      const draftPayload = {
        adults,
        children,
        departureDate,
        specialRequests,
        paymentMethod,
        cardHolder,
        cardNumber,
        expiry,
        cvv,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(draftStorageKey, JSON.stringify(draftPayload));
    } catch (e) {
      console.warn('Failed to save checkout draft to localStorage', e);
    }
  }, [draftStorageKey, adults, children, departureDate, specialRequests, paymentMethod, cardHolder, cardNumber, expiry, cvv, confirmedBooking]);

  const handleClearDraft = () => {
    if (draftStorageKey) {
      localStorage.removeItem(draftStorageKey);
    }
    setAdults(1);
    setChildren(0);
    setDepartureDate(selectedPackage?.availableDates?.[0] || '2026-10-29');
    setSpecialRequests('');
    setPaymentMethod('aba_payway');
    setCardHolder(currentUser?.name || 'Sokha Chan');
    setCardNumber('4242 •••• •••• 4242');
    setExpiry('12/28');
    setCvv('888');
    setHasRestoredDraft(false);
  };

  // Countdown timer for KHQR
  useEffect(() => {
    if (paymentMethod === 'aba_payway' || paymentMethod === 'acleda_xpay' || paymentMethod === 'wing_bank') {
      const interval = setInterval(() => {
        setKhqrTimer(prev => (prev > 0 ? prev - 1 : 900));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [paymentMethod]);

  if (activeModal !== 'checkout' || !selectedPackage) return null;

  const pkg = selectedPackage;
  const unitPriceUSD = pkg.discountPriceUSD || pkg.priceUSD;
  const baseSubtotalUSD = (unitPriceUSD * adults) + (unitPriceUSD * 0.7 * children);
  const taxUSD = Math.round(baseSubtotalUSD * 0.075 * 100) / 100;
  const grandTotalUSD = Math.round((baseSubtotalUSD + taxUSD) * 100) / 100;
  const totalKHR = Math.round(grandTotalUSD * (systemSettings?.defaultExchangeRateKHR || 4100));

  // Calculate return date
  const startObj = new Date(departureDate);
  startObj.setDate(startObj.getDate() + pkg.durationDays);
  const returnDate = startObj.toISOString().split('T')[0];

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simulate Payment Gateway Authorization delay
      await new Promise(r => setTimeout(r, 1200));

      let cardLast4 = undefined;
      if (paymentMethod === 'card') {
        cardLast4 = cardNumber.replace(/\s/g, '').slice(-4) || '4242';
      }

      const newBooking = await createBooking({
        packageId: pkg.id,
        startDate: departureDate,
        endDate: returnDate,
        numberOfAdults: adults,
        numberOfChildren: children,
        specialRequests,
        paymentMethod,
        cardLast4
      });

      // Clear draft upon successful booking
      if (draftStorageKey) {
        localStorage.removeItem(draftStorageKey);
      }

      setIsProcessing(false);
      setConfirmedBooking(newBooking);
      setSelectedBooking(newBooking);

      // Launch celebratory Confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}

    } catch (err) {
      setIsProcessing(false);
    }
  };

  const handleViewMyTrips = () => {
    setActiveModal(null);
    setActiveView('customer_portal');
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full my-auto max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {confirmedBooking ? t('bookingSuccess') : t('secureCheckout')}
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                {systemSettings?.companyNameEn || 'KHB EVENTS CO., LTD.'} • Official Trade Mission Rail
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {confirmedBooking ? (
            /* SUCCESS CONFIRMATION SCREEN */
            <div className="text-center space-y-6 py-4 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                  Payment Authorized & Confirmed
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                  {t('bookingSuccess')}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {t('emailConfirmationSent')}
                </p>
              </div>

              {/* Booking Voucher Summary Card */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">
                      {t('bookingCode')}
                    </div>
                    <div className="text-base font-black text-sky-600 dark:text-sky-400 font-mono">
                      {confirmedBooking.bookingCode}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Amount Paid</div>
                    <div className="text-sm font-black text-slate-900 dark:text-white font-mono">
                      {formatMoney(confirmedBooking.totalPriceUSD, currency, language)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Package</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{pkg.title}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Dates</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {confirmedBooking.startDate} to {confirmedBooking.endDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Lead Traveler</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {confirmedBooking.userName} ({confirmedBooking.numberOfAdults} Adults)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Payment Method</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                      {confirmedBooking.paymentMethod.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Voucher & Invoice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    setActiveModal('voucher');
                  }}
                  className="py-3 px-4 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{t('downloadVoucher')}</span>
                </button>

                <button
                  onClick={() => {
                    setActiveModal('invoice');
                  }}
                  className="py-3 px-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-750 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>{t('viewInvoice')}</span>
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleViewMyTrips}
                  className="text-xs text-sky-600 dark:text-sky-400 font-bold hover:underline cursor-pointer"
                >
                  Go to My Trips Dashboard →
                </button>
              </div>
            </div>
          ) : (
            /* CHECKOUT FORM */
            <form onSubmit={handlePayNow} className="space-y-6">
              {/* Draft Status Strip */}
              {hasRestoredDraft && (
                <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[11px] animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Auto-saved progress restored from your browser storage.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearDraft}
                    className="text-[10.5px] font-bold text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 underline cursor-pointer"
                  >
                    Reset to Defaults
                  </button>
                </div>
              )}

              {/* Trip Overview Pill */}
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <img
                  src={pkg.images[0]}
                  alt={pkg.title}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase">
                      {pkg.destination}
                    </span>
                    {pkg.isCantonFair && pkg.cantonFairPhase && (
                      <span className="px-2 py-0.2 rounded-md bg-red-600 text-white text-[9px] font-black uppercase tracking-wider">
                        🇨🇳 Canton Fair {pkg.cantonFairPhase}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {pkg.title}
                  </h4>
                  <div className="text-[11px] text-slate-500 flex items-center gap-3 mt-1">
                    <span>{pkg.durationDays} Days / {pkg.durationNights} Nights</span>
                    <span>•</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Departure: {departureDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Guest & Date Confirmation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Departure Date
                  </label>
                  <select
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500"
                  >
                    {pkg.availableDates.map(d => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Adults (12+)
                  </label>
                  <select
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>
                        {num} Adult{num > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Children (0-11)
                  </label>
                  <select
                    value={children}
                    onChange={(e) => setChildren(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500"
                  >
                    {[0, 1, 2, 3, 4].map(num => (
                      <option key={num} value={num}>
                        {num} Children
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Payment Method Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {t('paymentMethod')}
                  </label>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    ⚡ {availableGateways.length} Gateways Active
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {availableGateways.map(gw => {
                    const isSelected = paymentMethod === gw.id;
                    const IconComp = gw.icon;
                    return (
                      <button
                        key={gw.id}
                        type="button"
                        onClick={() => setPaymentMethod(gw.id)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                          isSelected
                            ? `${gw.borderActive} ${gw.bgActive} shadow-sm ring-1 ring-sky-500/20`
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 opacity-80'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <IconComp className={`w-4 h-4 ${gw.brandColor}`} />
                          <span className="text-[8px] font-extrabold uppercase px-1 py-0.5 rounded bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
                            {gw.badge}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                          {gw.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {gw.subtitle}
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── 1. ABA PAYWAY / KHQR INTERACTIVE VIEW ── */}
              {paymentMethod === 'aba_payway' && (
                <div className="p-5 rounded-2xl bg-gradient-to-b from-sky-50/80 to-white dark:from-slate-800 dark:to-slate-900 border border-sky-200 dark:border-slate-700 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-sky-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-xs shadow-md">
                        KHQR
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900 dark:text-white">
                          ABA PayWay • Bakong KHQR
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          Scan with ABA Mobile App or any Bakong-enabled bank
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-100/80 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-mono text-[11px] font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatTimer(khqrTimer)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    {/* Simulated Authentic KHQR Graphic */}
                    <div className="p-3 bg-white rounded-2xl shadow-lg border border-slate-200 text-center shrink-0 w-44">
                      {/* KHQR Header */}
                      <div className="bg-red-600 text-white text-[10px] font-black py-1 px-2 rounded-t-lg tracking-wider mb-2">
                        KHQR • BAKONG
                      </div>
                      {/* QR Pattern Simulation */}
                      <div className="relative w-36 h-36 mx-auto bg-slate-900 rounded-lg p-2 flex items-center justify-center">
                        <div className="grid grid-cols-6 gap-1 w-full h-full opacity-90 p-1">
                          {Array.from({ length: 36 }).map((_, i) => (
                            <div
                              key={i}
                              className={`rounded-xs ${
                                (i % 2 === 0 || i % 5 === 0 || i === 0 || i === 5 || i === 30 || i === 35)
                                  ? 'bg-white'
                                  : 'bg-transparent'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-black text-[10px] shadow-lg border border-white">
                            ABA
                          </div>
                        </div>
                      </div>
                      <div className="text-[9px] font-bold text-slate-600 mt-2 truncate">
                        {systemSettings?.companyNameKh || 'KHB EVENTS CO., LTD.'}
                      </div>
                    </div>

                    {/* QR Details & Step-by-Step Instructions */}
                    <div className="space-y-2.5 text-xs flex-1">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1 font-mono">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">Amount in USD:</span>
                          <span className="font-bold text-sky-600 dark:text-sky-400">{formatMoney(grandTotalUSD, 'USD', language)}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">Amount in KHR:</span>
                          <span className="font-bold text-slate-900 dark:text-white">៛{totalKHR.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700">
                          <span>Merchant ID:</span>
                          <span className="text-slate-600 dark:text-slate-300">khb_events@aba</span>
                        </div>
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 text-[10px] font-bold flex items-center justify-center">1</span>
                          <span>Open <strong>ABA Mobile App</strong> on your smartphone.</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 text-[10px] font-bold flex items-center justify-center">2</span>
                          <span>Tap the <strong>QR Pay</strong> scanner icon on the home screen.</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 text-[10px] font-bold flex items-center justify-center">3</span>
                          <span>Scan the KHQR code and tap <strong>Pay Now</strong>.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── 2. ACLEDA X-PAY VIEW ── */}
              {paymentMethod === 'acleda_xpay' && (
                <div className="p-5 rounded-2xl bg-gradient-to-b from-blue-50/80 to-white dark:from-slate-800 dark:to-slate-900 border border-blue-200 dark:border-slate-700 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-blue-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                      <div>
                        <div className="text-xs font-black text-slate-900 dark:text-white">
                          ACLEDA X-Pay • Direct Mobile Checkout
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          ACLEDA Bank Plc. Official Merchant Gateway
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                      POS #098812
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500">Payable Total:</span>
                      <span className="font-bold text-blue-700 dark:text-blue-400 text-sm">
                        {formatMoney(grandTotalUSD, 'USD', language)} (៛{totalKHR.toLocaleString()} KHR)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      When you click Pay Now, you will authorize payment securely using ACLEDA Mobile or KHQR digital token authorization.
                    </p>
                  </div>
                </div>
              )}

              {/* ── 3. WING BANK VIEW ── */}
              {paymentMethod === 'wing_bank' && (
                <div className="p-5 rounded-2xl bg-gradient-to-b from-lime-50/80 to-white dark:from-slate-800 dark:to-slate-900 border border-lime-200 dark:border-slate-700 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-lime-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-6 h-6 text-lime-600 dark:text-lime-400" />
                      <div>
                        <div className="text-xs font-black text-slate-900 dark:text-white">
                          Wing Bank • WingPay Digital Checkout
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          Instant Wing Account & Visa/Mastercard processing
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-lime-800 dark:text-lime-300 bg-lime-100 dark:bg-lime-950/60 px-2 py-0.5 rounded-md">
                      Merchant #034899
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500">Total Charged:</span>
                      <span className="font-bold text-lime-700 dark:text-lime-400 text-sm">
                        {formatMoney(grandTotalUSD, 'USD', language)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Authorize using your 8-digit Wing Account Number or tap to scan Wing KHQR on your Wing Bank app.
                    </p>
                  </div>
                </div>
              )}

              {/* ── 4. CREDIT & DEBIT CARD VIEW ── */}
              {paymentMethod === 'card' && (
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      International & Corporate Cards
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Visa • Mastercard • JCB • UnionPay
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      required
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Sarah Jenkins"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Card Number
                    </label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4242 •••• •••• 4242"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        required
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        CVV / CVC
                      </label>
                      <input
                        type="text"
                        required
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        placeholder="123"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── 5. APPLE PAY / GOOGLE PAY VIEW ── */}
              {paymentMethod === 'apple_pay' && (
                <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black">1-Touch Express Device Payment</h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Pay instantly with Apple Pay or Google Wallet linked cards with TouchID / FaceID authentication.
                    </p>
                  </div>
                  <div className="text-base font-black font-mono text-emerald-400">
                    {formatMoney(grandTotalUSD, currency, language)}
                  </div>
                </div>
              )}

              {/* ── 6. BIOMETRIC PASSKEY WALLET VIEW ── */}
              {paymentMethod === 'biometric_wallet' && (
                <div className="p-5 rounded-2xl bg-teal-950 text-white space-y-4 text-center border border-teal-800">
                  <div className="w-12 h-12 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center mx-auto border border-teal-500/30 animate-pulse">
                    <Fingerprint className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black">W3C WebAuthn Biometric Passkey</h4>
                    <p className="text-xs text-teal-200/80 mt-1">
                      Touch your fingerprint sensor or verify FaceID hardware key for cryptographic zero-friction instant settlement.
                    </p>
                  </div>
                  <div className="text-base font-black font-mono text-teal-300">
                    {formatMoney(grandTotalUSD, currency, language)}
                  </div>
                </div>
              )}

              {/* ── 7. CORPORATE BANK WIRE VIEW ── */}
              {paymentMethod === 'bank_wire' && (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                    <Building className="w-5 h-5 text-emerald-600" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        Official Trade Mission Corporate Bank Account
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Ministry of Commerce Registered B2B Entity
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 block font-sans">Bank Name:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{systemSettings?.bankName || 'ABA Bank (Advanced Bank of Asia)'}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 block font-sans">Account Name:</span>
                      <span className="font-bold text-slate-900 dark:text-white truncate block">{systemSettings?.bankAccountName || 'KHB EVENTS CO., LTD.'}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 block font-sans">Account Number:</span>
                      <span className="font-bold text-sky-600 dark:text-sky-400">{systemSettings?.bankAccountNumber || '000 892 119'}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 block font-sans">SWIFT Code:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{systemSettings?.swiftCode || 'ABAKKHPP'}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Payment reference: <strong className="font-mono text-slate-700 dark:text-slate-200">B2B-{pkg.id.slice(0, 6).toUpperCase()}-{adults}PAX</strong>. A formal tax invoice and payment voucher will be generated upon completion.
                  </p>
                </div>
              )}

              {/* Special Requests */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Special Requests / Dietary Needs (Optional)
                </label>
                <textarea
                  rows={2}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. Vegetarian diet, factory translator request, high floor hotel room..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              {/* Price Breakdown */}
              <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-slate-800/80 border border-sky-100 dark:border-slate-700 space-y-2">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>Tour Package Subtotal ({adults} Adults{children > 0 ? `, ${children} Children` : ''})</span>
                  <span className="font-mono">{formatMoney(baseSubtotalUSD, currency, language)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>Tourism VAT & Local Destination Tax ({systemSettings?.defaultTaxRatePercent || 7.5}%)</span>
                  <span className="font-mono">{formatMoney(taxUSD, currency, language)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-sm font-black text-slate-900 dark:text-white">
                  <span>{t('totalPrice')} ({currency})</span>
                  <div className="text-right">
                    <span className="font-mono text-sky-600 dark:text-sky-400 text-base block">
                      {formatMoney(grandTotalUSD, currency, language)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ≈ ៛{totalKHR.toLocaleString()} KHR
                    </span>
                  </div>
                </div>
              </div>

              {/* Terms & Conditions Acceptance */}
              <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    defaultChecked
                    className="mt-0.5 rounded text-sky-600 focus:ring-sky-500 border-amber-300"
                  />
                  <span>
                    {language === 'km'
                      ? 'ខ្ញុំបានអាន និងយល់ព្រមលើ លក្ខខណ្ឌ និងគោលការណ៍នៃដំណើរបេសកកម្ម (លិខិតឆ្លងដែនលើស ៦ ខែ, ការតម្កល់ប្រាក់កក់ និងគោលការណ៍បង្វិលសង)'
                      : 'I have read and agree to the Tour Package Terms & Conditions (6+ months passport validity, deposit schedule, and cancellation policies).'}
                  </span>
                </label>
              </div>

              {/* Pay Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white font-bold text-sm shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Authorizing {paymentMethod.replace('_', ' ').toUpperCase()} & Generating Invoice...</span>
                  </div>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>
                      {t('payNow')} ({formatMoney(grandTotalUSD, currency, language)})
                    </span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
