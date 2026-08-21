import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Printer,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Compass,
  CreditCard,
  Building2,
  PhoneCall,
  Mail,
  Landmark,
  ExternalLink,
  QrCode,
  Copy,
  Check
} from 'lucide-react';
import { formatMoney } from '../../services/currencyService';
import { getFontFamilyClass } from '../../i18n/translations';
import { QRCodeSVG } from 'qrcode.react';

export const InvoiceModal: React.FC = () => {
  const { selectedInvoice, selectedBooking, invoices, activeModal, setActiveModal, systemSettings, currency, language, t } = useApp();
  const [copiedLink, setCopiedLink] = useState(false);

  if (activeModal !== 'invoice') return null;

  const invoice = selectedInvoice || (selectedBooking ? invoices.find(i => i.bookingId === selectedBooking.id) : invoices[0]);
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://khbevents.com';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const verificationUrl = `${origin}${pathname}?verify=invoice&ref=${encodeURIComponent(invoice.bookingCode)}&inv=${encodeURIComponent(invoice.invoiceNumber)}`;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(verificationUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full my-auto max-h-[94vh] flex flex-col overflow-hidden">
        {/* Controls Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/90 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Official Tax & VAT Invoice ({invoice.invoiceNumber})
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
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

        {/* Printable Official Invoice Body */}
        <div id="printable-invoice" className={`p-8 sm:p-10 space-y-8 overflow-y-auto flex-1 bg-white text-slate-900 ${getFontFamilyClass(language)}`}>
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-8">
            <div className="flex items-center gap-4">
              {systemSettings?.companyLogoUrl ? (
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 p-1 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    src={systemSettings.companyLogoUrl}
                    alt={systemSettings.companyName || 'Logo'}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 via-teal-500 to-amber-500 flex items-center justify-center text-white font-bold shadow-md shrink-0">
                  <Compass className="w-8 h-8" />
                </div>
              )}
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  {systemSettings?.companyName || 'KHB Events Co., Ltd.'}
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  {systemSettings?.companyTagline || 'Official Bilateral B2B Trade Delegation'}
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Tax VAT: <strong>{systemSettings?.taxVatNumber || 'VAT-KHB-2026-8899'}</strong>
                  {systemSettings?.companyRegistrationNumber && ` • MoC: ${systemSettings.companyRegistrationNumber}`}
                </p>
              </div>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
                PAID IN FULL
              </span>
              <div className="text-xs text-slate-500">Invoice Number: <strong className="text-slate-900 font-mono">{invoice.invoiceNumber}</strong></div>
              <div className="text-xs text-slate-500">Issue Date: <span className="text-slate-800 font-medium">{invoice.issueDate}</span></div>
              <div className="text-xs text-slate-500">Booking Ref: <strong className="text-sky-600 font-mono">{invoice.bookingCode}</strong></div>
            </div>
          </div>

          {/* Billed To / Company Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">
                Billed To (Delegate / Corporate Entity)
              </span>
              <div className="font-bold text-slate-900 text-sm">{invoice.customerName}</div>
              <div className="text-slate-600">{invoice.customerEmail}</div>
              <div className="text-slate-500">{invoice.customerAddress || 'Verified Delegate Registration'}</div>
            </div>

            <div className="space-y-1 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">
                Issuing Organization & Banking Rails
              </span>
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-slate-500" />
                <span>{systemSettings?.bankName || 'ABA Bank Plc.'}</span>
              </div>
              <div className="text-slate-500 font-mono text-[11px]">
                A/C: {systemSettings?.bankAccountNumber || '000 888 999'} • {systemSettings?.bankAccountName || 'KHB EVENTS CO., LTD.'}
              </div>
              <div className="text-emerald-700 font-semibold text-[11px]">
                Settlement Status: Direct Settlement Cleared
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Item Description</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Unit Price (USD)</th>
                  <th className="py-3 px-4 text-right">Total (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {item.description}
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-600 font-mono">
                      {item.quantity}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-600 font-mono">
                      ${item.unitPriceUSD.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono">
                      ${item.totalUSD.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Calculation Totals Box & QR Code Verification Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-stretch">
            {/* Direct Portal Verification QR Code Card */}
            <div className="sm:col-span-7 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-sky-50/40 border border-slate-200 flex flex-col justify-between gap-3 text-xs">
              <div className="flex items-start gap-3.5">
                <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-2xs shrink-0 flex flex-col items-center">
                  <QRCodeSVG
                    value={verificationUrl}
                    size={84}
                    level="M"
                    includeMargin={false}
                    className="w-20 h-20"
                  />
                  <span className="text-[8.5px] font-mono font-bold text-sky-700 mt-1 uppercase tracking-tight">
                    Scan to Verify
                  </span>
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Live Portal Verification</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Scan with any mobile camera or QR reader to verify payment settlement directly in the KHB Customer Portal.
                  </p>
                  <div className="text-[10.5px] text-slate-500 font-mono pt-0.5">
                    Ref: <strong className="text-slate-900">{invoice.bookingCode}</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Link Sharing */}
              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-2 flex-wrap print:hidden">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-[10.5px] font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-500" />
                      <span>Copy Verification Link</span>
                    </>
                  )}
                </button>
                <a
                  href={verificationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-[10.5px] font-bold flex items-center gap-1 transition-colors"
                >
                  <span>Open Online</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Financial Calculations Box */}
            <div className="sm:col-span-5 space-y-2.5 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex flex-col justify-center">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (USD)</span>
                <span className="font-mono font-semibold">${invoice.subtotalUSD.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>VAT / Tourism Tax ({invoice.taxRatePercent}%)</span>
                <span className="font-mono font-semibold">${invoice.taxAmountUSD.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-300 flex justify-between font-bold text-slate-900 text-sm">
                <span>Grand Total (USD)</span>
                <span className="font-mono text-base text-sky-600">${invoice.totalUSD.toFixed(2)}</span>
              </div>
              <div className="pt-1 flex justify-between text-slate-500 text-[11px]">
                <span>Paid in {invoice.paidCurrency}</span>
                <span className="font-mono font-bold">
                  {formatMoney(invoice.totalUSD, invoice.paidCurrency, language)}
                </span>
              </div>
            </div>
          </div>

          {/* Tax Compliance Certification Note & Coordinator Contact */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-2">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
              <div>
                <div className="font-bold text-slate-700">Official Tax Statement & Accreditation</div>
                <p className="mt-0.5">
                  {systemSettings?.tradeMissionAccreditation || 'Official B2B Tour Operator & Delegation Partner — Approved by MoT & MoC.'} All statutory taxes and VAT have been remitted.
                </p>
              </div>
              <div className="sm:text-right shrink-0 text-[10px] text-slate-600 font-mono">
                <div>Lead Coordinator: <strong>{systemSettings?.leadCoordinatorName || 'Mr. Tim Vutha'}</strong></div>
                <div>Hotline: {systemSettings?.emergencyHotline || systemSettings?.leadCoordinatorPhone || '060 815 515'}</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-[11px] text-slate-400 pt-4 border-t border-slate-200">
            {systemSettings?.companyName || 'KHB Events Co., Ltd.'} • {systemSettings?.companyAddress || 'Phnom Penh, Cambodia'} • {systemSettings?.companyEmail || 'contact@khbevents.com'}
          </div>
        </div>
      </div>
    </div>
  );
};
