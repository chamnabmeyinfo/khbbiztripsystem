import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatMoney } from '../../services/currencyService';
import {
  Briefcase,
  Calendar,
  Clock,
  Plane,
  Building,
  QrCode,
  FileText,
  Edit3,
  XCircle,
  PhoneCall,
  WifiOff,
  ShieldCheck,
  MapPin,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Download,
  Check
} from 'lucide-react';
import { Booking } from '../../types';
import { generateTourAgendaPdf } from '../../services/pdfAgendaService';

export const CustomerDashboard: React.FC = () => {
  const {
    currentUser,
    bookings,
    packages,
    offlineMode,
    setSelectedPackage,
    setSelectedBooking,
    setSelectedInvoice,
    setActiveModal,
    cancelBooking,
    currency,
    language,
    t
  } = useApp();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [downloadingBookingId, setDownloadingBookingId] = useState<string | null>(null);

  const handleDownloadAgendaPdf = async (b: Booking) => {
    const pkg = packages.find(p => p.id === b.packageId);
    if (!pkg) return;
    try {
      setDownloadingBookingId(b.id);
      await generateTourAgendaPdf({
        packageData: pkg,
        selectedDate: b.startDate,
        travelerName: currentUser?.name || b.userName || 'Valued Business Delegate',
        numberOfAdults: b.numberOfAdults || 1,
        selectedOptionalProgramIds: b.selectedOptionalProgramIds || [],
        currencySymbol: '$',
        language
      });
      setTimeout(() => setDownloadingBookingId(null), 2500);
    } catch (err) {
      console.error('Failed to download PDF:', err);
      setDownloadingBookingId(null);
    }
  };

  // Filter traveler's bookings
  const userBookings = bookings.filter(b => !currentUser || b.userId === currentUser.id || b.userEmail === currentUser.email);
  const upcomingBookings = userBookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
  const pastBookings = userBookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

  const handleOpenVoucher = (b: Booking) => {
    setSelectedBooking(b);
    setActiveModal('voucher');
  };

  const handleOpenInvoice = (b: Booking) => {
    setSelectedBooking(b);
    setActiveModal('invoice');
  };

  const handleOpenModifyDate = (b: Booking) => {
    setSelectedBooking(b);
    setActiveModal('modify_dates');
  };

  const handleCancelBooking = (b: Booking) => {
    cancelBooking(b.id);
  };

  // Find active upcoming package for destination emergency helpline
  const activeUpcomingBooking = upcomingBookings[0];
  const activePkg = activeUpcomingBooking ? packages.find(p => p.id === activeUpcomingBooking.packageId) : packages[0];
  const emergency = activePkg?.emergencyContact;

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('myTrips')}
            </h1>
            {offlineMode && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-bold">
                <WifiOff className="w-3.5 h-3.5" />
                Offline Cache Active
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Manage your booked itineraries, real-time flight gates, travel vouchers, and tax invoices.
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl flex items-center gap-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'upcoming'
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>{t('upcomingTrips')}</span>
            <span className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 text-[10px] flex items-center justify-center">
              {upcomingBookings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('past')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'past'
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>{t('pastTrips')}</span>
            <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] flex items-center justify-center">
              {pastBookings.length}
            </span>
          </button>
        </div>
      </div>

      {/* Emergency Assistance Banner for current destination */}
      {emergency && activeUpcomingBooking && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-sky-900 via-slate-900 to-slate-900 text-white shadow-xl border border-sky-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-sky-600/30 border border-sky-400/30 flex items-center justify-center text-sky-300 shrink-0">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>{emergency.country} Concierge & Emergency Quick-Links</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">
                  Cached Offline
                </span>
              </div>
              <div className="text-sm font-bold text-white mt-0.5">
                Police: <strong className="text-sky-200">{emergency.police}</strong> • Medical/Ambulance: <strong className="text-sky-200">{emergency.ambulance}</strong> • Tourist SOS: <strong className="text-sky-200">{emergency.touristHelpline}</strong>
              </div>
            </div>
          </div>
          <div className="text-xs text-slate-400">
            TripDesk 24/7 Global Helpline: <strong className="text-white">+1 800-TRIP-DESK</strong>
          </div>
        </div>
      )}

      {/* Bookings List */}
      <div className="space-y-6">
        {(activeTab === 'upcoming' ? upcomingBookings : pastBookings).length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
            <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No {activeTab} trips found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Ready to explore? Browse our curated world packages and book with instant confirmation.
            </p>
          </div>
        ) : (
          (activeTab === 'upcoming' ? upcomingBookings : pastBookings).map(booking => {
            const isConfirmed = booking.status === 'confirmed';
            const matchedPkg = packages.find(p => p.id === booking.packageId);
            const displayTitle = matchedPkg?.title || booking.packageTitle;
            const displayDestination = matchedPkg?.destination || booking.packageDestination;
            return (
              <div
                key={booking.id}
                className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/80 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Booking Card Header */}
                <div className="p-6 sm:p-7 border-b border-slate-100 dark:border-slate-700/60 flex flex-col lg:flex-row justify-between gap-6">
                  {/* Left Thumbnail & Info */}
                  <div className="flex items-start gap-4">
                    <img
                      src={booking.packageImage}
                      alt={displayTitle}
                      referrerPolicy="no-referrer"
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shadow-sm shrink-0"
                    />
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                          {displayDestination}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            booking.status === 'confirmed'
                              ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300'
                              : booking.status === 'completed'
                              ? 'bg-sky-100 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300'
                              : 'bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                        {displayTitle}
                      </h3>

                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                          <Calendar className="w-3.5 h-3.5 text-sky-500" />
                          {booking.startDate} — {booking.endDate}
                        </span>
                        <span>•</span>
                        <span>Ref: <strong className="font-mono text-slate-900 dark:text-white">{booking.bookingCode}</strong></span>
                        <span>•</span>
                        <span>{booking.numberOfAdults} Adults</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Price & Quick Actions */}
                  <div className="flex flex-col lg:items-end justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block lg:text-right">
                        Paid Total ({booking.paidCurrency})
                      </span>
                      <div className="text-xl font-black text-slate-900 dark:text-white font-mono lg:text-right">
                        {formatMoney(booking.totalPriceUSD, currency, language)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleOpenVoucher(booking)}
                        className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>{t('downloadVoucher')}</span>
                      </button>

                      <button
                        onClick={() => handleDownloadAgendaPdf(booking)}
                        disabled={downloadingBookingId === booking.id}
                        className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                        title="Download Tour Agenda as PDF"
                      >
                        {downloadingBookingId === booking.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        )}
                        <span>{downloadingBookingId === booking.id ? 'Generating...' : 'Agenda PDF'}</span>
                      </button>

                      <button
                        onClick={() => handleOpenInvoice(booking)}
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="w-4 h-4" />
                        <span>{t('viewInvoice')}</span>
                      </button>

                      {isConfirmed && (
                        <>
                          <button
                            onClick={() => handleOpenModifyDate(booking)}
                            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                            title="Modify departure dates"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>{t('modifyDates')}</span>
                          </button>

                          <button
                            onClick={() => handleCancelBooking(booking)}
                            className="px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                            title="Cancel and receive full refund"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>{t('cancelBooking')}</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Real-time Status Tracker (Flight & Hotel live timeline) */}
                {isConfirmed && (
                  <div className="p-6 bg-slate-50/70 dark:bg-slate-800/40 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Live Flight Gate & Schedule */}
                    {booking.flightStatus && (
                      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold text-xs">
                            <Plane className="w-4 h-4" />
                            <span>Live Flight Status</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                            {booking.flightStatus.status}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {booking.flightStatus.airline} • Flight {booking.flightStatus.flightNumber}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                          <span>Gate: <strong className="text-slate-800 dark:text-slate-200">{booking.flightStatus.gate}</strong></span>
                          <span>Terminal: {booking.flightStatus.terminal}</span>
                          <span>Departs: {booking.flightStatus.departureTime.split(' ')[1]}</span>
                        </div>
                      </div>
                    )}

                    {/* Hotel Reservation */}
                    {booking.hotelStatus && (
                      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
                            <Building className="w-4 h-4" />
                            <span>Hotel Accommodation</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 text-[10px] font-bold">
                            {booking.hotelStatus.status}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {booking.hotelStatus.hotelName}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                          <span>Room: {booking.hotelStatus.roomType}</span>
                          <span>Conf: <strong className="font-mono text-slate-800 dark:text-slate-200">{booking.hotelStatus.confirmationCode}</strong></span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
