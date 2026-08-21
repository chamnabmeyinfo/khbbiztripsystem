/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { isRTL, getFontFamilyClass } from './i18n/translations';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { LandingPage } from './components/marketing/LandingPage';
import { PackageSalesLandingPage } from './components/marketing/PackageSalesLandingPage';
import { CustomerDashboard } from './components/portal/CustomerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuthModal } from './components/common/AuthModal';
import { CurrencyConverterModal } from './components/common/CurrencyConverterModal';
import { PackageDetailModal } from './components/portal/PackageDetailModal';
import { CheckoutModal } from './components/portal/CheckoutModal';
import { VoucherModal } from './components/portal/VoucherModal';
import { InvoiceModal } from './components/portal/InvoiceModal';
import { ModifyDatesModal } from './components/portal/ModifyDatesModal';
import { ProfileSettingsModal } from './components/portal/ProfileSettingsModal';
import { AgendaPdfModal } from './components/portal/AgendaPdfModal';
import { SupportChatWidget } from './components/portal/SupportChatWidget';
import { AiFloatingCopilot } from './components/common/AiFloatingCopilot';

import { StandaloneAgendaView } from './components/portal/StandaloneAgendaView';

const MainLayout: React.FC = () => {
  const { activeView, language } = useApp();
  const fontClass = getFontFamilyClass(language);
  const dir = isRTL(language) ? 'rtl' : 'ltr';

  return (
    <div
      dir={dir}
      className={`min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 ${fontClass}`}
    >
      {/* Navigation Header */}
      <Header />

      {/* Main Content View Switcher */}
      <main className="flex-1">
        {activeView === 'marketing' && <LandingPage />}
        {activeView === 'package_sales_page' && <PackageSalesLandingPage />}
        {activeView === 'customer_portal' && <CustomerDashboard />}
        {activeView === 'admin_dashboard' && <AdminDashboard />}
      </main>

      {/* Global Modals */}
      <AuthModal />
      <CurrencyConverterModal />
      <PackageDetailModal />
      <CheckoutModal />
      <VoucherModal />
      <InvoiceModal />
      <ModifyDatesModal />
      <ProfileSettingsModal />
      <AgendaPdfModal />

      {/* KHB AI Operations Assistant (Auto-CRUD) */}
      <AiFloatingCopilot />

      {/* 24/7 Concierge Support Chat Widget */}
      <SupportChatWidget />

      {/* Global Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  const isAgendaStandalone = typeof window !== 'undefined' && (() => {
    const params = new URLSearchParams(window.location.search);
    return (
      params.has('a') ||
      params.has('agenda') ||
      params.has('p') ||
      params.has('pkg') ||
      window.location.hash.startsWith('#/agenda') ||
      window.location.hash.startsWith('#/a/') ||
      window.location.pathname.startsWith('/agenda') ||
      window.location.pathname.startsWith('/a/')
    );
  })();

  return (
    <AppProvider>
      {isAgendaStandalone ? <StandaloneAgendaView /> : <MainLayout />}
    </AppProvider>
  );
}
