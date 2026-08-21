import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatMoney } from '../../services/currencyService';
import { Download, Eye, TrendingUp, TrendingDown, DollarSign, Activity, X, FileText, PieChart } from 'lucide-react';
import { TripProfitReport } from '../../types';

export const ProfitLossSection: React.FC = () => {
  const { bookings, currency, getTripProfitReport, exportProfitReportCSV } = useApp();
  const [selectedReport, setSelectedReport] = useState<TripProfitReport | null>(null);

  // Computed totals for Overall Summary Cards
  const summary = useMemo(() => {
    let totalRevenue = 0;
    let totalEstCost = 0;
    let totalActCost = 0;
    let totalExpenses = 0;

    const reports = bookings?.map(b => getTripProfitReport(b.id)).filter(Boolean) as TripProfitReport[];
    
    reports?.forEach(r => {
      totalRevenue += r.totalRevenueUSD;
      totalEstCost += r.estimatedCostUSD;
      totalActCost += r.actualCostUSD;
      totalExpenses += r.adHocExpensesUSD;
    });

    const grossProfit = totalRevenue - totalEstCost;
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const netProfit = totalRevenue - totalActCost - totalExpenses;
    const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return { totalRevenue, totalEstCost, grossProfit, grossMargin, netProfit, netMargin, reports };
  }, [bookings, getTripProfitReport]);

  const getMarginColor = (margin: number) => {
    if (margin > 20) return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
    if (margin >= 10) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
    return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
  };

  const getMarginTextColor = (margin: number) => {
    if (margin > 20) return 'text-green-600 dark:text-green-400';
    if (margin >= 10) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Overall Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-full group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatMoney(summary.totalRevenue, currency)}</h3>
              <p className="text-xs text-gray-500 mt-2">All confirmed bookings</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <DollarSign size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-gray-50 dark:bg-gray-700/50 rounded-full group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Estimated Cost</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatMoney(summary.totalEstCost, currency)}</h3>
              <p className="text-xs text-gray-500 mt-2">Based on cost templates</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
              <Activity size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 dark:bg-indigo-900/10 rounded-full group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Gross Profit</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatMoney(summary.grossProfit, currency)}</h3>
              <div className="mt-2 flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getMarginColor(summary.grossMargin)}`}>
                  {summary.grossMargin.toFixed(1)}% Margin
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <PieChart size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-50 dark:bg-green-900/10 rounded-full group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Net Profit</p>
              <h3 className={`text-2xl font-bold ${getMarginTextColor(summary.netMargin)}`}>
                {formatMoney(summary.netProfit, currency)}
              </h3>
              <div className="mt-2 flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getMarginColor(summary.netMargin)}`}>
                  {summary.netMargin.toFixed(1)}% Margin
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
              {summary.netProfit >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            </div>
          </div>
        </div>
      </div>

      {/* Booking P&L Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900 dark:text-white">Trip P&L Analysis</h3>
          <button onClick={() => exportProfitReportCSV()} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
            <Download size={16} /> Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Booking</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Destination / Date</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Pax</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Revenue</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Est. Cost</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Actual Cost</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Gross Profit</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Net Profit</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Margin %</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {summary.reports?.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-600 dark:text-gray-300">
                    {r.bookingCode}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{r.destination}</div>
                    <div className="text-xs text-gray-500">{new Date(r.travelStartDate).toLocaleDateString()}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">
                    {r.totalPax}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-white">
                    ${r.totalRevenueUSD.toFixed(0)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                    ${r.estimatedCostUSD.toFixed(0)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                    ${r.actualCostUSD.toFixed(0)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-white">
                    ${r.grossProfitUSD.toFixed(0)}
                  </td>
                  <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-bold ${getMarginTextColor(r.netMarginPercent)}`}>
                    ${r.netProfitUSD.toFixed(0)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getMarginColor(r.netMarginPercent)}`}>
                      {r.netMarginPercent.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <button 
                      onClick={() => setSelectedReport(r)}
                      className="inline-flex items-center justify-center p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Details"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {(!summary.reports || summary.reports.length === 0) && (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                    No P&L data available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* P&L Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText size={20} className="text-blue-600" /> P&L Detail: {selectedReport.bookingCode}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{selectedReport.packageTitle} • {selectedReport.destination}</p>
              </div>
              <button onClick={() => setSelectedReport(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-2 bg-white dark:bg-gray-700 rounded-full shadow-sm">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30 dark:bg-gray-900/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Revenue Section */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b pb-2 dark:border-gray-700">Revenue Analysis</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span className="text-gray-700 dark:text-gray-300">Total Revenue</span>
                      <span className="text-gray-900 dark:text-white">{formatMoney(selectedReport.totalRevenueUSD, currency)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Received</span>
                      <span className="text-green-600 font-medium">{formatMoney(selectedReport.receivedRevenueUSD, currency)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Outstanding Receivable</span>
                      <span className="text-amber-600 font-medium">{formatMoney(selectedReport.outstandingReceivableUSD, currency)}</span>
                    </div>
                  </div>
                </div>

                {/* Cost Section */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b pb-2 dark:border-gray-700">Cost Analysis</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Estimated Cost</span>
                      <span className="text-gray-700 dark:text-gray-300">{formatMoney(selectedReport.estimatedCostUSD, currency)}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span className="text-gray-700 dark:text-gray-300">Actual Cost</span>
                      <span className="text-gray-900 dark:text-white">{formatMoney(selectedReport.actualCostUSD, currency)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t pt-2 mt-2 dark:border-gray-700">
                      <span className="text-gray-500">Ad-hoc Expenses</span>
                      <span className="text-red-500 font-medium">{formatMoney(selectedReport.adHocExpensesUSD, currency)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Outstanding Payable</span>
                      <span className="text-amber-600 font-medium">{formatMoney(selectedReport.outstandingPayableUSD, currency)}</span>
                    </div>
                  </div>
                </div>

                {/* Cost Breakdown Chart (Simple CSS) */}
                <div className="col-span-1 md:col-span-2 bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Cost Breakdown (Actual)</h4>
                  <div className="flex flex-col gap-3">
                    {(Object.entries(selectedReport.costBreakdown) as [string, number][]).filter(([_, val]) => val > 0).sort((a, b) => b[1] - a[1]).map(([key, value]) => {
                      const totalCost = selectedReport.actualCostUSD || 1;
                      const percentage = Math.min(100, Math.round((value / totalCost) * 100));
                      return (
                        <div key={key} className="flex items-center text-sm">
                          <div className="w-24 capitalize text-gray-600 dark:text-gray-400 font-medium">{key}</div>
                          <div className="flex-1 mx-4 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percentage}%` }}></div>
                          </div>
                          <div className="w-24 text-right font-medium text-gray-900 dark:text-white">{formatMoney(value as number, currency)}</div>
                          <div className="w-12 text-right text-gray-500 text-xs">{percentage}%</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Summary Section */}
                <div className="col-span-1 md:col-span-2 bg-gray-900 dark:bg-black rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none text-9xl leading-none font-black translate-x-4 translate-y-4">%</div>
                  <div className="grid grid-cols-2 gap-8 relative z-10">
                    <div>
                      <p className="text-gray-400 text-sm mb-1 uppercase tracking-wider font-bold">Gross Profit</p>
                      <div className="flex items-end gap-3">
                        <span className="text-3xl font-bold">{formatMoney(selectedReport.grossProfitUSD, currency)}</span>
                        <span className="text-lg text-blue-400 font-medium mb-1">{selectedReport.grossMarginPercent.toFixed(1)}% Margin</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Revenue − Estimated Cost</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1 uppercase tracking-wider font-bold">Net Profit</p>
                      <div className="flex items-end gap-3">
                        <span className={`text-4xl font-black ${selectedReport.netProfitUSD >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatMoney(selectedReport.netProfitUSD, currency)}
                        </span>
                        <span className={`text-xl font-bold mb-1 ${selectedReport.netProfitUSD >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {selectedReport.netMarginPercent.toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Revenue − Actual Cost − Expenses</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <button 
                onClick={() => exportProfitReportCSV()} 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2"
              >
                <Download size={18} /> Export Full Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
