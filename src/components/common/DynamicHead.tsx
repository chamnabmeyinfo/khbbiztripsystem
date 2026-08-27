import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useApp } from '../../context/AppContext';
import { TourPackage } from '../../types';

export interface DynamicHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product' | 'event';
  keywords?: string[];
  canonicalUrl?: string;
  customPackage?: TourPackage | null;
  noIndex?: boolean;
}

export const DynamicHead: React.FC<DynamicHeadProps> = ({
  title: propTitle,
  description: propDescription,
  image: propImage,
  url: propUrl,
  type: propType,
  keywords: propKeywords,
  canonicalUrl: propCanonicalUrl,
  customPackage,
  noIndex = false,
}) => {
  const {
    activeView,
    activeModal,
    packages,
    selectedPackage,
    selectedBooking,
    selectedInvoice,
    systemSettings,
    language,
    currency
  } = useApp();

  const pkg = useMemo(() => {
    if (customPackage) return customPackage;
    if (selectedPackage) return selectedPackage;
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const pkgParam = urlParams.get('pkg') || urlParams.get('packageId');
        const hash = window.location.hash;
        const hashParam = hash.startsWith('#package/') ? hash.replace('#package/', '') : (hash.startsWith('#pkg=') ? hash.replace('#pkg=', '') : null);
        const targetId = pkgParam || hashParam;
        if (targetId && packages && packages.length > 0) {
          return packages.find(p => p.id === targetId) || null;
        }
      }
    } catch {}
    return null;
  }, [customPackage, selectedPackage, packages]);

  const companyName = systemSettings?.companyName || 'KHB Events';
  const companyTagline = systemSettings?.companyTagline || 'B2B Trade Delegations & Business Expeditions';
  const defaultLogo = systemSettings?.companyLogoUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80';

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://khbevents.com';
  const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/';
  const fullUrl = propUrl || `${baseUrl}${currentPath}`;
  const canonical = propCanonicalUrl || fullUrl.split('?')[0];

  // Dynamic Contextual Metadata Computation
  const seoData = useMemo(() => {
    let title = `${companyName} • ${companyTagline}`;
    let description = `${companyName} organizes certified B2B business trade missions, Canton Fair delegations, factory sourcing tours, and bilateral executive networking expeditions.`;
    let ogImage = defaultLogo;
    let ogType = propType || 'website';
    const keywordsSet = new Set<string>([
      'KHB Events',
      'Canton Fair 2026',
      'Trade Mission',
      'B2B Sourcing',
      'Business Delegation',
      'Guangzhou Fair',
      'Factory Tours',
      'Executive Networking',
      'Cambodia China Trade',
      'ASEAN Business Expeditions'
    ]);

    // 1. Modals contextual priority
    if (activeModal === 'invoice' && selectedInvoice) {
      title = `Official Tax & VAT Invoice #${selectedInvoice.invoiceNumber} | ${companyName}`;
      description = `Verified corporate invoice for booking ${selectedInvoice.bookingCode} - ${selectedInvoice.customerName}. Settlement status: Paid in Full.`;
    } else if (activeModal === 'voucher' && selectedBooking) {
      title = `VIP Delegation Pass & Voucher #${selectedBooking.bookingCode} | ${companyName}`;
      description = `Official delegate travel pass and verified itinerary credential for ${selectedBooking.tourPackage?.title || 'Trade Expedition'}.`;
    } else if (activeModal === 'agenda_pdf' && pkg) {
      title = `Official Mission Itinerary & Agenda: ${pkg.title} | ${companyName}`;
      description = `Day-by-day business agenda, factory visits, VIP networking sessions, and travel logistics for ${pkg.title}.`;
      if (pkg.images?.[0]) ogImage = pkg.images[0];
      ogType = 'article';
    } else if (activeModal === 'package_detail' && pkg) {
      title = `${pkg.title} — ${pkg.durationDays}D/${pkg.durationNights}N Trade Mission | ${companyName}`;
      description = pkg.description || `Join the official delegation for ${pkg.title} in ${pkg.destination}, ${pkg.country}. Full VIP logistics, hotel, flights & bilateral B2B sessions.`;
      if (pkg.images?.[0]) ogImage = pkg.images[0];
      ogType = 'product';
      keywordsSet.add(pkg.destination);
      keywordsSet.add(pkg.country);
    } else if (activeView === 'package_sales_page' && pkg) {
      // 2. Package Sales / Dedicated Package Page
      title = `${pkg.title} | Official Delegation Registration — ${companyName}`;
      description = `Reserve your delegate seat for ${pkg.title}. ${pkg.durationDays} Days / ${pkg.durationNights} Nights in ${pkg.destination}, ${pkg.country}. Total starting price $${pkg.priceUSD} USD.`;
      if (pkg.videos?.[0]?.thumbnailUrl) {
        ogImage = pkg.videos[0].thumbnailUrl;
      } else if (pkg.images?.[0]) {
        ogImage = pkg.images[0];
      }
      ogType = 'product';
      keywordsSet.add(pkg.title);
      keywordsSet.add(pkg.destination);
      keywordsSet.add(pkg.country);
    } else if (activeView === 'customer_portal') {
      // 3. Delegate / Customer Portal
      title = `Delegate Portal & My Bookings | ${companyName}`;
      description = `Manage your trade mission registrations, download official VAT invoices, view verified flight passes, and track itinerary updates.`;
    } else if (activeView === 'admin_dashboard') {
      // 4. Admin Dashboard
      title = `Admin ERP & Mission Operations Hub | ${companyName}`;
      description = `Operational management console for KHB Events trade missions, bookings, multi-currency ledger, and delegation logistics.`;
    } else {
      // 5. Default Marketing Landing Page
      title = `${companyName} | Premier Bilateral B2B Trade Missions & Canton Fair Delegations`;
      description = `Empowering enterprise leaders with all-inclusive trade missions, guaranteed Canton Fair accreditation, 5-star accommodations, and high-level bilateral B2B matchmaking.`;
    }

    // Direct Prop Overrides
    if (propTitle) title = propTitle;
    if (propDescription) description = propDescription;
    if (propImage) ogImage = propImage;
    if (propKeywords) propKeywords.forEach(k => keywordsSet.add(k));

    // Ensure ogImage is strictly an absolute URL for social crawlers (Telegram, Facebook, WhatsApp)
    const absoluteOgImage = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`;

    return {
      title,
      description,
      ogImage: absoluteOgImage,
      ogType,
      keywords: Array.from(keywordsSet).join(', ')
    };
  }, [
    propTitle,
    propDescription,
    propImage,
    propType,
    propKeywords,
    activeModal,
    activeView,
    pkg,
    selectedBooking,
    selectedInvoice,
    companyName,
    companyTagline,
    defaultLogo
  ]);

  // Structured Data (JSON-LD) for SEO Rich Snippets
  const jsonLd = useMemo(() => {
    if (pkg && (activeView === 'package_sales_page' || activeModal === 'package_detail' || activeModal === 'agenda_pdf')) {
      return {
        '@context': 'https://schema.org',
        '@type': 'TouristTrip',
        'name': pkg.title,
        'description': pkg.description,
        'image': pkg.images || [seoData.ogImage],
        'touristType': ['Business Delegate', 'Corporate Buyer', 'Executive'],
        'offers': {
          '@type': 'Offer',
          'price': pkg.priceUSD,
          'priceCurrency': 'USD',
          'availability': (pkg.seatsAvailable ?? 10) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
          'url': fullUrl
        },
        'provider': {
          '@type': 'Organization',
          'name': companyName,
          'url': baseUrl,
          'logo': defaultLogo
        },
        'itinerary': {
          '@type': 'ItemList',
          'numberOfItems': pkg.itinerary?.length || 0,
          'itemListElement': (pkg.itinerary || []).map((day, idx) => ({
            '@type': 'ListItem',
            'position': idx + 1,
            'name': `Day ${day.day}: ${day.title}`,
            'description': day.description
          }))
        }
      };
    }

    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': companyName,
      'description': seoData.description,
      'url': baseUrl,
      'logo': defaultLogo,
      'contactPoint': {
        '@type': 'ContactPoint',
        'telephone': systemSettings?.contactPhone || '+855 23 888 999',
        'contactType': 'customer service',
        'email': systemSettings?.contactEmail || 'missions@khbevents.com',
        'areaServed': ['KH', 'CN', 'AE', 'VN', 'TH', 'SG'],
        'availableLanguage': ['English', 'Khmer', 'Chinese', 'Japanese', 'Arabic', 'Spanish', 'Hebrew']
      }
    };
  }, [pkg, activeView, activeModal, companyName, seoData, defaultLogo, baseUrl, fullUrl, systemSettings]);

  return (
    <Helmet>
      {/* Primary HTML Meta Tags */}
      <title>{seoData.title}</title>
      <meta name="title" content={seoData.title} />
      <meta name="description" content={seoData.description} />
      <meta name="keywords" content={seoData.keywords} />
      <meta name="author" content={companyName} />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={seoData.ogType} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={seoData.title} />
      <meta property="og:description" content={seoData.description} />
      <meta property="og:image" content={seoData.ogImage} />
      <meta property="og:site_name" content={companyName} />
      <meta property="og:locale" content={language === 'km' ? 'km_KH' : language === 'ja' ? 'ja_JP' : language === 'ar' ? 'ar_AE' : 'en_US'} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={seoData.title} />
      <meta name="twitter:description" content={seoData.description} />
      <meta name="twitter:image" content={seoData.ogImage} />

      {/* Schema.org Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    </Helmet>
  );
};
