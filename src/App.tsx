import React, { Component, ErrorInfo, ReactNode } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { AppProvider, useApp } from './context/AppContext';
import { isRTL, getFontFamilyClass } from './i18n/translations';
import { DynamicHead } from './components/common/DynamicHead';
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
import { GlobalToast } from './components/common/GlobalToast';

import { StandaloneAgendaView } from './components/portal/StandaloneAgendaView';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// Global Error Boundary to catch rendering crashes and show a diagnostic screen
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState;
  public props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    (this as any).setState({ errorInfo });
    console.error('React ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, fontFamily: 'system-ui', maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ color: '#dc2626' }}>⚠️ Application Render Error</h2>
          <p style={{ color: '#64748b' }}>The app crashed during rendering. Details below:</p>
          <pre style={{ background: '#f1f5f9', padding: 16, borderRadius: 8, overflow: 'auto', fontSize: 13, color: '#0f172a' }}>
            {this.state.error?.message || 'Unknown error'}
            {'\n\n'}
            {this.state.error?.stack || ''}
            {this.state.errorInfo?.componentStack ? '\n\nComponent Stack:\n' + this.state.errorInfo.componentStack : ''}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 16, padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const MainLayout: React.FC = () => {
  const { activeView, language } = useApp();
  const fontClass = getFontFamilyClass(language);
  const dir = isRTL(language) ? 'rtl' : 'ltr';

  return (
    <div
      dir={dir}
      className={`min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 ${fontClass}`}
    >
      {/* Dynamic SEO Meta & Document Head */}
      <DynamicHead />

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

      {/* Global Toast Notifications for actions like setting default view */}
      <GlobalToast />

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
    <ErrorBoundary>
      <HelmetProvider>
        <AppProvider>
          {isAgendaStandalone ? <StandaloneAgendaView /> : <MainLayout />}
        </AppProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}
