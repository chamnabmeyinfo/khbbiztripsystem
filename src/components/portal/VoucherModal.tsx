import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Printer,
  QrCode,
  Plane,
  Building,
  Calendar,
  Users,
  ShieldCheck,
  PhoneCall,
  Compass,
  Download,
  UserCheck,
  Stamp,
  MessageCircle,
  Send,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { formatMoney } from '../../services/currencyService';
import { getFontFamilyClass } from '../../i18n/translations';
import { QRCodeSVG } from 'qrcode.react';

export const VoucherModal: React.FC = () => {
  const { selectedBooking, bookings, activeModal, setActiveModal, systemSettings, currency, language, t } = useApp();
  const [copiedLink, setCopiedLink] = useState(false);

  if (activeModal !== 'voucher') return null;

  const booking = selectedBooking || bookings[0];
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://khbevents.com';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const verificationUrl = `${origin}${pathname}?verify=voucher&ref=${encodeURIComponent(booking.bookingCode)}&id=${encodeURIComponent(booking.id)}`;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(verificationUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full my-auto max-h-[94vh] flex flex-col overflow-hidden">
        {/* Modal Controls Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/90 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-theme-primary" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
              Official Delegation VIP Travel Pass & Voucher
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-theme-primary hover:bg-theme-primary-hover text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={() => setActiveModal(null)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Body */}
        <div id="printable-voucher" className={`p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 bg-white text-slate-900 print-friendly-headers ${getFontFamilyClass(language)}`}>
          {/* Voucher Header with Brand & Status */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-6 print-friendly-headers">
            <div className="flex items-center gap-3">
              {systemSettings?.companyLogoUrl ? (
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 p-1 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    src={systemSettings.companyLogoUrl}
                    alt={systemSettings.companyName || 'Logo'}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-theme-primary text-white flex items-center justify-center font-bold shadow-md shrink-0">
                  <Compass className="w-7 h-7" />
                </div>
              )}
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-heading">
                  {systemSettings?.companyName || 'KHB Events Co., Ltd.'}
                </h1>
                <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                  {systemSettings?.companyTagline || 'Official Bilateral B2B Trade Delegation'}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Confirmed & Verified
              </span>
              <div className="text-xs text-slate-400 mt-1.5">
                Ref: <strong className="font-mono text-slate-900 text-sm">{booking.bookingCode}</strong>
              </div>
            </div>
          </div>

          {/* Core Booking Summary & QR Code Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center p-5 rounded-2xl bg-slate-50 border border-slate-200 print-friendly-summary">
            <div className="sm:col-span-2 space-y-3">
              <span className="text-xs font-bold text-theme-primary uppercase tracking-wider">
                {booking.packageDestination}
              </span>
              <h2 className="text-lg font-black text-slate-900 leading-tight font-heading">
                {booking.packageTitle}
              </h2>

              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Delegate Name</span>
                  <span className="font-bold text-slate-900">{booking.userName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Delegation Size</span>
                  <span className="font-bold text-slate-900">
                    {booking.numberOfAdults} Delegates{booking.numberOfChildren > 0 ? `, ${booking.numberOfChildren} Accompanying` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Mission Departure</span>
                  <span className="font-bold text-slate-900">{booking.startDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Mission Conclusion</span>
                  <span className="font-bold text-slate-900">{booking.endDate}</span>
                </div>
              </div>
            </div>

            {/* Live Interactive Verification QR Code */}
            <div className="flex flex-col items-center justify-center p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <QRCodeSVG
                value={verificationUrl}
                size={110}
                level="M"
                includeMargin={false}
                className="w-26 h-26 rounded-lg"
              />
              <span className="text-[9.5px] font-mono font-bold text-theme-primary mt-2 uppercase tracking-wide">
                Scan for VIP Badge
              </span>
              <span className="text-[8.5px] text-slate-400 font-mono">
                {booking.bookingCode}
              </span>

              {/* Portal Verification Link Actions (Hidden in Print) */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 w-full flex items-center justify-center gap-1.5 print:hidden">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  title="Copy Verification Link"
                  className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-[10px] font-semibold text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-500" />
                      <span>Link</span>
                    </>
                  )}
                </button>
                <a
                  href={verificationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open in Portal"
                  className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-theme-primary text-[10px] font-bold flex items-center gap-1 transition-colors"
                >
                  <span>Verify</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Lead Coordinator & Official Stamp Card */}
          <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-teal-500 shrink-0 shadow-xs bg-teal-100 flex items-center justify-center">
                {systemSettings?.leadCoordinatorAvatar ? (
                  <img
                    src={systemSettings.leadCoordinatorAvatar}
                    alt={systemSettings.leadCoordinatorName || 'Coordinator'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserCheck className="w-6 h-6 text-teal-700" />
                )}
              </div>
              <div className="text-xs">
                <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
                  Lead Delegation Director
                </span>
                <span className="text-sm font-bold text-slate-900 block">
                  {systemSettings?.leadCoordinatorName || 'Mr. Tim Vutha'}
                </span>
                <span className="text-[11px] text-teal-700 font-semibold block">
                  {systemSettings?.leadCoordinatorPhone || '060 815 515'}
                  {systemSettings?.leadCoordinatorWeChat && ` • WeChat: ${systemSettings.leadCoordinatorWeChat}`}
                </span>
              </div>
            </div>

            {/* Signature / Official Approval Stamp */}
            <div className="text-right flex flex-col items-center sm:items-end">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Authorized Mission Signature
              </span>
              {systemSettings?.leadCoordinatorSignatureUrl ? (
                <div className="h-10 max-w-[140px] flex items-center justify-center">
                  <img
                    src={systemSettings.leadCoordinatorSignatureUrl}
                    alt="Approval Stamp"
                    className="max-h-full object-contain filter contrast-125"
                  />
                </div>
              ) : (
                <div className="px-3 py-1 rounded-lg border border-teal-400/60 bg-white/80 text-[10px] font-mono font-bold text-teal-900 flex items-center gap-1 shadow-2xs">
                  <Stamp className="w-3.5 h-3.5 text-teal-600" />
                  <span>OFFICIALLY CERTIFIED</span>
                </div>
              )}
            </div>
          </div>

          {/* Flight & Hotel Inclusions Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Flight info */}
            {booking.flightStatus && (
              <div className="p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-sky-700 font-bold text-xs uppercase">
                  <Plane className="w-4 h-4" />
                  <span>Scheduled Flight Pass</span>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {booking.flightStatus.airline} — {booking.flightStatus.flightNumber}
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div>Departs: {booking.flightStatus.departureAirport} ({booking.flightStatus.departureTime})</div>
                  <div>Arrives: {booking.flightStatus.arrivalAirport} ({booking.flightStatus.arrivalTime})</div>
                  <div className="text-emerald-600 font-bold">
                    Gate: {booking.flightStatus.gate} | Status: {booking.flightStatus.status}
                  </div>
                </div>
              </div>
            )}

            {/* Hotel info */}
            {booking.hotelStatus && (
              <div className="p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase">
                  <Building className="w-4 h-4" />
                  <span>Hotel Reservation Voucher</span>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {booking.hotelStatus.hotelName}
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div>Room: {booking.hotelStatus.roomType}</div>
                  <div>Confirmation #: {booking.hotelStatus.confirmationCode}</div>
                  <div className="text-slate-500 text-[11px] truncate">{booking.hotelStatus.address}</div>
                </div>
              </div>
            )}
          </div>

          {/* Instructions & Emergency Numbers */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <PhoneCall className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 space-y-1">
              <div className="font-bold">VIP Delegation & On-Ground Protocol</div>
              <p>
                Present this VIP Pass at the airport trade fast-track counter and the {systemSettings?.delegationSupportDesk || 'Hotel Landmark Canton KHB Delegation Desk'}.
              </p>
              <div className="font-semibold text-amber-800 pt-1 font-mono">
                24/7 Helpline: {systemSettings?.emergencyHotline || '+855 60 815 515'} | Email: {systemSettings?.companyEmail || 'contact@khbevents.com'}
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center text-[11px] text-slate-400 pt-2 border-t border-slate-200">
            {systemSettings?.companyName || 'KHB Events Co., Ltd.'} • Issued on {booking.createdAt.split('T')[0]} • Ref #{booking.bookingCode}
          </div>
        </div>
      </div>
    </div>
  );
};
