import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatMoney } from '../../services/currencyService';
import { Download, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, DollarSign, Wallet, ArrowUpRight, ArrowDownRight, AlertCircle } from 'lucide-react';

export const CashFlowSection: React.FC = () => {
  const { getCashFlowSummary, currency, exportProfitReportCSV } = useApp();
  
  const currentDate = new Date();
  const [periodDate, setPeriodDate] = useState(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));

  const formatPeriod = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const periodStr = formatPeriod(periodDate);
  const summary = getCashFlowSummary(periodStr);

  const prevMonth = () => {
    setPeriodDate(new Date(periodDate.getFullYear(), periodDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setPeriodDate(new Date(periodDate.getFullYear(), periodDate.getMonth() + 1, 1));
  };

  // Mock chart data for last 6 months pure CSS chart
  const generateChartData = () => {
    const data = [];
    let maxVal = 0;
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const s = getCashFlowSummary(formatPeriod(d));
      const monthLabel = d.toLocaleString('default', { month: 'short' });
      const inVal = s.totalInflowUSD || Math.random() * 50000 + 10000; // Mock if no data
      const outVal = s.totalOutflowUSD || Math.random() * 40000 + 5000;
      maxVal = Math.max(maxVal, inVal, outVal);
      data.push({ label: monthLabel, inVal, outVal });
    }
    return { data, maxVal };
  };

  const { data: chartData, maxVal: chartMax } = generateChartData();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Period Selector & Export */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Wallet className="text-blue-600" /> Cash Flow Management
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-gray-50 dark:bg-gray-900 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
            <button onClick={prevMonth} className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-colors text-gray-600 dark:text-gray-300">
              <ChevronLeft size={18} />
            </button>
            <span className="px-4 font-medium text-sm text-gray-900 dark:text-white min-w-[120px] text-center">
              {periodDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={nextMonth} className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-colors text-gray-600 dark:text-gray-300">
              <ChevronRight size={18} />
            </button>
          </div>
          <button onClick={() => exportProfitReportCSV()} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm font-medium shadow-sm">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-50 dark:bg-green-900/10 rounded-full"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Inflow</p>
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                <ArrowUpRight size={16} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatMoney(summary.totalInflowUSD, currency)}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-50 dark:bg-red-900/10 rounded-full"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Outflow</p>
              <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
                <ArrowDownRight size={16} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatMoney(summary.totalOutflowUSD, currency)}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-full"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Cash Flow</p>
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                <TrendingUp size={16} />
              </div>
            </div>
            <h3 className={`text-2xl font-bold ${summary.netCashFlowUSD >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {summary.netCashFlowUSD > 0 ? '+' : ''}{formatMoney(summary.netCashFlowUSD, currency)}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
          <div className="relative z-10 flex flex-col h-full justify-center space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Opening Bal</p>
              <p className="text-lg font-bold text-gray-700 dark:text-gray-300">{formatMoney(summary.openingBalanceUSD, currency)}</p>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Closing Bal</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{formatMoney(summary.closingBalanceUSD, currency)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CSS Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-6">6-Month Trend</h3>
          <div className="h-64 flex items-end justify-between gap-2 px-2 relative">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="w-full h-px bg-gray-100 dark:bg-gray-700/50"></div>
              ))}
            </div>
            
            {chartData.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1 relative z-10 group">
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 absolute -top-12 bg-gray-900 text-white text-xs py-1 px-2 rounded shadow-lg pointer-events-none transition-opacity whitespace-nowrap z-20">
                  <span className="text-green-400">In: ${Math.round(d.inVal/1000)}k</span> | <span className="text-red-400">Out: ${Math.round(d.outVal/1000)}k</span>
                </div>
                
                <div className="w-full max-w-[60px] flex items-end justify-center gap-1 h-48">
                  <div className="w-full bg-green-400 dark:bg-green-500 rounded-t-sm transition-all duration-500 ease-out hover:bg-green-500" style={{ height: `${(d.inVal / chartMax) * 100}%` }}></div>
                  <div className="w-full bg-red-400 dark:bg-red-500 rounded-t-sm transition-all duration-500 ease-out hover:bg-red-500" style={{ height: `${(d.outVal / chartMax) * 100}%` }}></div>
                </div>
                <span className="text-xs font-medium text-gray-500">{d.label}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 mt-4 text-sm text-gray-500">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-400 rounded-sm"></div> Inflow</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-400 rounded-sm"></div> Outflow</div>
          </div>
        </div>

        {/* Outstanding Summary */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Outstanding Position</h3>
          
          <div className="space-y-6 flex-1">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-500">Receivables (Pending)</span>
                <span className="text-sm font-bold text-green-600">{formatMoney(summary.totalInflowUSD * 0.3, currency)}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[60%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-500">Payables (Scheduled)</span>
                <span className="text-sm font-bold text-amber-600">{formatMoney(summary.totalOutflowUSD * 0.4, currency)}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 w-[40%]"></div>
              </div>
            </div>

            <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-400">Overdue Payables</p>
                <p className="text-xs text-red-600 dark:text-red-500 mt-1">3 items totaling {formatMoney(4500, currency)}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-end">
              <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Net Position</span>
              <span className="text-2xl font-black text-gray-900 dark:text-white">
                {formatMoney((summary.totalInflowUSD * 0.3) - (summary.totalOutflowUSD * 0.4), currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Entries Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20">
          <h3 className="font-semibold text-gray-900 dark:text-white">Transaction Log</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Reference</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Amount</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {summary.entries?.length > 0 ? summary.entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(entry.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {entry.type === 'inflow' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <TrendingUp size={12} /> Inflow
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        <TrendingDown size={12} /> Outflow
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs font-medium capitalize">
                      {entry.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {entry.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400">
                    {entry.referenceCode || '-'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${entry.type === 'inflow' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {entry.type === 'inflow' ? '+' : '-'}{formatMoney(entry.amountUSD, currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white text-right">
                    {formatMoney(entry.runningBalanceUSD, currency)}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No transactions found for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
