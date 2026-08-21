import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CURRENCY_CONFIGS, convertFromUSD, convertToUSD, formatRawMoney } from '../../services/currencyService';
import { CurrencyCode } from '../../types';
import { X, ArrowRightLeft, DollarSign, TrendingUp, Check } from 'lucide-react';

export const CurrencyConverterModal: React.FC = () => {
  const { currency, setCurrency, activeModal, setActiveModal, language, t } = useApp();
  
  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>('USD');
  const [toCurrency, setToCurrency] = useState<CurrencyCode>(currency || 'EUR');
  const [amount, setAmount] = useState<number>(1000);

  if (activeModal !== 'currency') return null;

  // Convert amount
  const amountInUSD = fromCurrency === 'USD' ? amount : convertToUSD(amount, fromCurrency);
  const convertedAmount = convertFromUSD(amountInUSD, toCurrency);

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const handleApplyAsPrimary = (code: CurrencyCode) => {
    setCurrency(code);
    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('currencyConverter')}
              </h3>
              <p className="text-xs text-slate-500">{t('liveExchangeRates')}</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Amount input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Enter Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-lg font-bold focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Currency Selectors */}
          <div className="grid grid-cols-5 gap-2 items-center">
            <div className="col-span-2">
              <label className="block text-[11px] text-slate-500 mb-1">From</label>
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value as CurrencyCode)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {Object.values(CURRENCY_CONFIGS).map(c => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-center pt-5">
              <button
                onClick={swapCurrencies}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-slate-600 dark:text-slate-300 hover:text-sky-600 transition-colors cursor-pointer"
                title="Swap Currencies"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="col-span-2">
              <label className="block text-[11px] text-slate-500 mb-1">To</label>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value as CurrencyCode)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {Object.values(CURRENCY_CONFIGS).map(c => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Result Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-sky-50 to-teal-50 dark:from-slate-800 dark:to-slate-800/80 border border-sky-100 dark:border-slate-700 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {amount} {fromCurrency} =
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {formatRawMoney(convertedAmount, toCurrency, language)}
            </div>
            <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>Live mid-market rate updated every 60s</span>
            </div>
          </div>

          {/* FX Rates Grid */}
          <div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Base Reference Rates (1 USD)
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {Object.values(CURRENCY_CONFIGS).filter(c => c.code !== 'USD').map(c => (
                <div
                  key={c.code}
                  className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 flex flex-col items-center justify-center"
                >
                  <span className="text-slate-500 text-[10px]">{c.flag} {c.code}</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {c.rateFromUSD} {c.symbol}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex gap-2">
            <button
              onClick={() => handleApplyAsPrimary(toCurrency)}
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-sky-500/20"
            >
              <Check className="w-4 h-4" />
              Set {toCurrency} as TripDesk Currency
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
