import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Fingerprint,
  Mail,
  Phone,
  Lock,
  User,
  Shield,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Building2,
  Smartphone,
  Globe,
  KeyRound
} from 'lucide-react';

const COUNTRY_CODES = [
  { code: '+855', flag: '🇰🇭', name: 'Cambodia' },
  { code: '+86', flag: '🇨🇳', name: 'China' },
  { code: '+84', flag: '🇻🇳', name: 'Vietnam' },
  { code: '+66', flag: '🇹🇭', name: 'Thailand' },
  { code: '+65', flag: '🇸🇬', name: 'Singapore' },
  { code: '+60', flag: '🇲🇾', name: 'Malaysia' },
  { code: '+1', flag: '🇺🇸', name: 'USA / Canada' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+82', flag: '🇰🇷', name: 'South Korea' },
  { code: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' }
];

export const AuthModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    signInWithGoogle,
    loginWithEmail,
    loginWithPhone,
    registerPublicUser,
    authenticateBiometric,
    t
  } = useApp();

  // Primary portal tab: 'public' (Travelers & Delegates) vs 'staff' (Corporate Google SSO)
  const [activeTab, setActiveTab] = useState<'public' | 'staff'>('public');
  
  // Public sub-method: 'email' vs 'phone'
  const [publicMethod, setPublicMethod] = useState<'email' | 'phone'>('email');
  
  // Public flow: 'signin' vs 'signup'
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [countryCode, setCountryCode] = useState('+855');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Status & loading states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);

  if (activeModal !== 'auth') return null;

  const handleSendOtp = () => {
    if (!phoneNumber.trim()) {
      setErrorMessage('Please enter your mobile phone number first.');
      return;
    }
    setErrorMessage(null);
    setOtpSent(true);
    setOtpTimer(60);
    setOtpCode('889922'); // Pre-fill simulation OTP for smooth testing
    const interval = setInterval(() => {
      setOtpTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handlePublicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      if (publicMethod === 'email') {
        if (!email.trim()) {
          setErrorMessage('Please provide an email address.');
          setLoading(false);
          return;
        }

        if (authMode === 'signup') {
          const res = await registerPublicUser({
            name: name.trim(),
            email: email.trim(),
            phone: phoneNumber ? `${countryCode} ${phoneNumber.trim()}` : undefined,
            password
          });
          if (!res.success) {
            setErrorMessage(res.error || 'Registration failed.');
            setLoading(false);
            return;
          }
        } else {
          await loginWithEmail(email.trim(), 'traveler', name.trim(), phoneNumber ? `${countryCode} ${phoneNumber.trim()}` : undefined);
        }
      } else {
        // Phone Authentication
        const fullPhone = `${countryCode} ${phoneNumber.trim()}`;
        if (!phoneNumber.trim()) {
          setErrorMessage('Please enter your mobile phone number.');
          setLoading(false);
          return;
        }

        if (authMode === 'signup') {
          const res = await registerPublicUser({
            name: name.trim() || `Delegate ${phoneNumber.slice(-4)}`,
            phone: fullPhone,
            password
          });
          if (!res.success) {
            setErrorMessage(res.error || 'Phone registration failed.');
            setLoading(false);
            return;
          }
        } else {
          const res = await loginWithPhone(fullPhone, name.trim());
          if (!res.success) {
            setErrorMessage(res.error || 'Phone sign-in failed.');
            setLoading(false);
            return;
          }
        }
      }

      setActiveModal(null);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMessage(null);
    setGoogleLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res && !res.success) {
        setErrorMessage(res.error || 'Google Sign-In failed.');
      } else {
        setActiveModal(null);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Google authentication failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    setErrorMessage(null);
    setBiometricLoading(true);
    const success = await authenticateBiometric();
    setBiometricLoading(false);
    if (success) {
      setBiometricSuccess(true);
      setTimeout(() => {
        setActiveModal(null);
        setBiometricSuccess(false);
      }, 600);
    } else {
      setErrorMessage('Passkey biometric authentication was not recognized or was cancelled.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-850/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 text-[10px] font-extrabold uppercase tracking-wider border border-amber-500/20">
                KHB Portal
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Account Sign In & Registration
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Select your access portal to manage bookings, visas & corporate trade missions.
            </p>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audience Tab Navigation */}
        <div className="p-4 pb-0 bg-slate-50/80 dark:bg-slate-850/80 border-b border-slate-200/80 dark:border-slate-800">
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setActiveTab('public');
                setErrorMessage(null);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'public'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs border border-slate-200/60 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Public Delegates & Travelers</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('staff');
                setErrorMessage(null);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'staff'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs border border-slate-200/60 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Staff Login (Google SSO)</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Error Banner Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* ================= PUBLIC PORTAL TAB ================= */}
          {activeTab === 'public' && (
            <div className="space-y-4">
              {/* Method Switch: Email vs Phone */}
              <div className="flex items-center justify-between gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-750">
                <button
                  type="button"
                  onClick={() => setPublicMethod('email')}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    publicMethod === 'email'
                      ? 'bg-white dark:bg-slate-750 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5 text-sky-500" />
                  <span>Email Sign Up / Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPublicMethod('phone')}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    publicMethod === 'phone'
                      ? 'bg-white dark:bg-slate-750 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Phone Number (SMS / OTP)</span>
                </button>
              </div>

              {/* Form Mode Toggle: Sign In vs Register */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {authMode === 'signin' ? 'Sign in with your credentials' : 'Register a new delegate account'}
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setAuthMode('signin')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      authMode === 'signin'
                        ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Sign In
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => setAuthMode('signup')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      authMode === 'signup'
                        ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Register
                  </button>
                </div>
              </div>

              {/* Public User Form */}
              <form onSubmit={handlePublicSubmit} className="space-y-3.5">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name / Trade Delegate Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Sopheak Meng / John Anderson"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                )}

                {/* Email Fields */}
                {publicMethod === 'email' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="traveler@example.com or delegate@company.com"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                )}

                {/* Phone Fields */}
                {publicMethod === 'phone' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Mobile Phone Number *
                    </label>
                    <div className="flex gap-2">
                      <div className="relative w-36">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="w-full pl-2 pr-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none font-medium cursor-pointer"
                        >
                          {COUNTRY_CODES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.flag} {c.code}
                            </option>
                          ))}
                        </select>
                        <Globe className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
                      </div>

                      <div className="relative flex-1">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="tel"
                          required
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="12 888 999"
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                    </div>

                    {/* Verification OTP Trigger */}
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpTimer > 0}
                        className="py-1.5 px-3 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold hover:bg-emerald-100 cursor-pointer disabled:opacity-50 transition-colors"
                      >
                        {otpTimer > 0 ? `Resend Code (${otpTimer}s)` : 'Send Verification OTP'}
                      </button>
                      {otpSent && (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> SMS Code Sent (Simulation: 889922)
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Password / OTP Input */}
                {publicMethod === 'email' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        required={authMode === 'signup'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      6-Digit SMS Verification Code
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="889922"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                )}

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
                >
                  <span>
                    {loading
                      ? 'Processing...'
                      : authMode === 'signup'
                      ? 'Create Delegate Account'
                      : publicMethod === 'phone'
                      ? 'Verify & Sign In via Phone'
                      : 'Sign In to Trade Mission Portal'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Biometric WebAuthn Passkey */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleBiometricAuth}
                  disabled={biometricLoading || biometricSuccess}
                  className="w-full p-2.5 rounded-2xl border-2 border-dashed border-teal-300 dark:border-teal-700 bg-teal-50/50 dark:bg-teal-950/20 hover:bg-teal-100/50 dark:hover:bg-teal-950/40 text-teal-800 dark:text-teal-300 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                >
                  {biometricSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 animate-bounce" />
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {t('biometricSuccess')}
                      </span>
                    </>
                  ) : (
                    <>
                      <Fingerprint className={`w-4 h-4 text-teal-600 dark:text-teal-400 ${biometricLoading ? 'animate-pulse' : ''}`} />
                      <span className="text-xs font-bold">{t('loginWithBiometrics')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ================= CORPORATE STAFF SSO TAB ================= */}
          {activeTab === 'staff' && (
            <div className="space-y-4">
              {/* Domain Restriction Notice Box */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-800 dark:text-emerald-300">
                  <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>KHB Corporate Single Sign-On (SSO)</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Google authentication is strictly reserved for authorized corporate personnel. Only accounts ending in the following company domains are permitted:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-mono text-xs font-bold border border-emerald-300 dark:border-emerald-700">
                    @khbmedia.asia
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-mono text-xs font-bold border border-emerald-300 dark:border-emerald-700">
                    @khbevents.com
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1">
                  * Public travelers and trade delegates must use the <strong className="text-sky-600 dark:text-sky-400 not-italic cursor-pointer" onClick={() => setActiveTab('public')}>Public Delegates tab</strong> to register using Phone or Email.
                </p>
              </div>

              {/* Google Workspace SSO Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={googleLoading}
                className="w-full p-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-white flex items-center justify-center gap-3 transition-all shadow-xs cursor-pointer group"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span className="text-xs font-bold">
                  {googleLoading ? 'Verifying Corporate Credentials...' : 'Sign In with Google Workspace'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
