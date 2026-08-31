import {
  TourPackage,
  Review,
  Booking,
  Invoice,
  SupportChat,
  User,
  Supplier,
  CostTemplate,
  PurchaseOrder,
  CustomerPayment,
  SupplierPayment,
  Expense,
  DeletedItemRecord,
  SystemSettings,
  PackageCategory
} from '../types';

export const SEED_USERS: User[] = [
  {
    id: 'usr_chamnab_mey',
    name: 'Chamnab Mey',
    email: 'chamnabmey.info@gmail.com',
    phone: '+855 12 345 678',
    role: 'super_admin',
    status: 'active',
    department: 'Executive Leadership',
    jobTitle: 'Executive Director & Founder',
    preferredLanguage: 'km',
    preferredCurrency: 'USD',
    hasBiometrics: true,
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    createdAt: '2026-01-01T00:00:00.000Z',
    lastLoginAt: '2026-08-17T07:25:00.000Z'
  },
  {
    id: 'usr_vutha_tim',
    name: 'Tim Vutha',
    email: 'vutha.tim@khbmedia.asia',
    phone: '060 815 515',
    role: 'super_admin',
    status: 'active',
    department: 'Executive Leadership',
    jobTitle: 'Chief Executive Officer (CEO)',
    preferredLanguage: 'km',
    preferredCurrency: 'USD',
    hasBiometrics: true,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    createdAt: '2026-02-15T00:00:00.000Z',
    lastLoginAt: '2026-08-25T07:00:00.000Z'
  },
  {
    id: 'usr_sokha_ly',
    name: 'Ly Sokha',
    email: 'sokha.ly@khbevents.com',
    phone: '+855 17 888 222',
    role: 'procurement_officer',
    status: 'active',
    department: 'Procurement & Sourcing',
    jobTitle: 'Senior Procurement & Vendor Lead',
    preferredLanguage: 'km',
    preferredCurrency: 'USD',
    hasBiometrics: false,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    createdAt: '2026-03-01T00:00:00.000Z',
    lastLoginAt: '2026-08-16T14:15:00.000Z'
  },
  {
    id: 'usr_dany_chhea',
    name: 'Chhea Dany',
    email: 'dany.chhea@khbevents.com',
    phone: '+855 89 555 123',
    role: 'finance_officer',
    status: 'active',
    department: 'Finance & Accounting',
    jobTitle: 'Financial Controller & Tax Auditor',
    preferredLanguage: 'en',
    preferredCurrency: 'USD',
    hasBiometrics: true,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    createdAt: '2026-03-10T00:00:00.000Z',
    lastLoginAt: '2026-08-17T05:10:00.000Z'
  },
  {
    id: 'usr_sophal_heng',
    name: 'Heng Sophal',
    email: 'sophal.heng@khbevents.com',
    phone: '+855 11 999 444',
    role: 'support_agent',
    status: 'active',
    department: 'Customer Experience',
    jobTitle: 'Concierge & VIP Support Officer',
    preferredLanguage: 'km',
    preferredCurrency: 'USD',
    hasBiometrics: false,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    createdAt: '2026-04-05T00:00:00.000Z',
    lastLoginAt: '2026-08-16T18:00:00.000Z'
  },
  {
    id: 'usr_admin_1',
    name: 'KHB Operations Lead',
    email: 'admin@khbevents.com',
    phone: '+855 23 888 999',
    role: 'admin',
    status: 'active',
    department: 'Executive Leadership',
    jobTitle: 'Operations Executive',
    preferredLanguage: 'km',
    preferredCurrency: 'USD',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    createdAt: '2026-01-15T00:00:00.000Z',
    lastLoginAt: '2026-08-15T09:00:00.000Z'
  },
  {
    id: 'usr_delegate_1',
    name: 'Dr. Mengly J. Quach',
    email: 'mengly.delegate@businesscambodia.org',
    phone: '+855 12 777 999',
    role: 'traveler',
    status: 'active',
    department: 'Trade Delegates',
    jobTitle: 'B2B Trade Delegate & Investor',
    preferredLanguage: 'km',
    preferredCurrency: 'USD',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
    createdAt: '2026-05-01T00:00:00.000Z',
    lastLoginAt: '2026-08-14T11:30:00.000Z'
  }
];

export const OFFICIAL_BIZTRIP_PACKAGE: TourPackage = {
  id: 'pkg_vietnam_biztrip_2026',
  status: 'active',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  version: 1,
  title: 'ដំណើរទស្សនៈកិច្ចពាណិជ្ជកម្មពិសេស: តែ កាហ្វេ ដុតនំ ការលក់រាយ & Franchise (Ho Chi Minh + Phu Quoc)',
  titleKm: 'ដំណើរទស្សនៈកិច្ចពាណិជ្ជកម្មពិសេស: តែ កាហ្វេ ដុតនំ ការលក់រាយ & Franchise (Ho Chi Minh + Phu Quoc)',
  titleEn: 'Special Trade Mission: Coffee, Tea, Bakery, Retail & Franchise Expo (Ho Chi Minh + Phu Quoc)',
  destination: 'ហូជីមិញ + កោះត្រល់ (Ho Chi Minh & Phu Quoc)',
  destinationKm: 'ហូជីមិញ + កោះត្រល់ (Ho Chi Minh & Phu Quoc)',
  destinationEn: 'Ho Chi Minh City & Phu Quoc Island, Vietnam',
  country: 'Vietnam',
  countryKm: 'ប្រទេសវៀតណាម (Vietnam)',
  countryEn: 'Vietnam',
  category: 'trade_mission',
  categoryKm: 'បេសកកម្មពាណិជ្ជកម្ម B2B',
  categoryEn: 'B2B Trade Mission',
  durationDays: 4,
  durationNights: 3,
  priceUSD: 350,
  discountPriceUSD: 299, // Early bird before 31/08/2026
  rating: 5.0,
  reviewCount: 32,
  bookedThisMonth: 18,
  availableDates: ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01'],
  flightIncluded: true, // Includes Domestic Flight SGN -> PQC & High-Speed Ferry to Kampot
  hotelStars: 4,
  featuredVideoUrl: 'https://www.youtube.com/watch?v=21X5lGlDOfg',
  videos: [
    {
      id: 'vid_vietnam_expo_2026',
      title: 'Vietnam International Coffee & Bakery Expo 2026 Walkthrough',
      titleKm: 'ទិដ្ឋភាពទូទៅនៃពិព័រណ៍កាហ្វេ & Bakery អន្តរជាតិ 2026',
      titleEn: 'Vietnam International Coffee & Bakery Expo 2026 Walkthrough',
      url: 'https://www.youtube.com/watch?v=21X5lGlDOfg',
      duration: '03:45',
      thumbnailUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80',
      isFeatured: true
    },
    {
      id: 'vid_vietrf_franchise',
      title: 'VIETRF Retail & Franchise Expo B2B Matchmaking',
      titleKm: 'កម្មវិធីជំនួបពាណិជ្ជកម្ម Franchise & RetailTech',
      titleEn: 'VIETRF Retail & Franchise Expo B2B Matchmaking',
      url: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
      duration: '02:30',
      thumbnailUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
      isFeatured: false
    }
  ],
  images: [
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1511081692775-05d0f180a065?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&auto=format&fit=crop&q=80'
  ],
  description: 'ដំណើរទស្សនៈកិច្ចពាណិជ្ជកម្មពិសេស ដើម្បីទស្សនា និងស្វែងរកដៃគូអាជីវកម្មលើវិស័យធំៗចំនួន ៤៖ តែ កាហ្វេ ដុតនំ ការលក់រាយ និង Franchise នៅប្រទេសវៀតណាម (ហូជីមិញ + កោះត្រល់)។ ស្វែងរកផលិតផលបោះដុំ សម្ភារៈឧបករណ៍ឆុងកាហ្វេ ធ្វើនំ បច្ចេកវិទ្យាលក់រាយ និងប្រេនល្បីៗសម្រាប់ Franchise មកកម្ពុជា។ ឈប់ទទួលចុះឈ្មោះត្រឹមថ្ងៃទី 15/09/2026 ឬគ្រប់ចំនួនកំណត់ 30 នាក់។',
  descriptionKm: 'ដំណើរទស្សនៈកិច្ចពាណិជ្ជកម្មពិសេស ដើម្បីទស្សនា និងស្វែងរកដៃគូអាជីវកម្មលើវិស័យធំៗចំនួន ៤៖ តែ កាហ្វេ ដុតនំ ការលក់រាយ និង Franchise នៅប្រទេសវៀតណាម (ហូជីមិញ + កោះត្រល់)។ ស្វែងរកផលិតផលបោះដុំ សម្ភារៈឧបករណ៍ឆុងកាហ្វេ ធ្វើនំ បច្ចេកវិទ្យាលក់រាយ និងប្រេនល្បីៗសម្រាប់ Franchise មកកម្ពុជា។ ឈប់ទទួលចុះឈ្មោះត្រឹមថ្ងៃទី 15/09/2026 ឬគ្រប់ចំនួនកំណត់ 30 នាក់។',
  descriptionEn: 'Exclusive bilateral trade mission to explore wholesale suppliers, commercial coffee & bakery equipment, retail tech automation, and premier franchise licensing across 4 major industries in Vietnam (Ho Chi Minh City + Phu Quoc Island). Features VIP access to 3 international exhibitions, B2B matchmaking, domestic flight, 4-star lodging, and dedicated bilingual escorts. Registration closes Sep 15, 2026 (Max 30 delegates).',
  highlights: [
    '🤝 ស្វែងរកផលិតផលបោះដុំពាក់ព័ន្ធនឹង តែ កាហ្វេ ការដុតនំ និងការលក់រាយ (Wholesale Sourcing)',
    '⚙️ សម្ភារៈ និងឧបករណ៍ឆុងកាហ្វេ ធ្វើនំ និងបច្ចេកវិទ្យាពាក់ព័ន្ធនឹងលក់រាយ (Equipment & RetailTech)',
    '🏢 ប្រេនល្បីៗនៅវៀតណាម និងអន្តរជាតិសម្រាប់ទិញសិទ្ធិ Franchise មកកម្ពុជា (Franchise Opportunities)',
    '☕ ចូលរួមព្រឹត្តិការណ៍ពិព័រណ៍អន្តរជាតិធំៗទាំង ៣ ក្នុងពេលតែមួយ (Coffee Expo, Tea-Bakery & VIETRF 2026)',
    '✈️ រួមបញ្ចូលសំបុត្រយន្តហោះ ហូជីមិញ-កោះត្រល់ + កប៉ាល់ល្បឿនលឿនមកកំពត + រថយន្ត VIP ភ្នំពេញ',
    '💥 តម្លៃពិសេសត្រឹម $299/ម្នាក់ សម្រាប់ការចុះឈ្មោះមុនថ្ងៃ 31/08/2026 (តម្លៃធម្មតា $350)'
  ],
  highlightsKm: [
    '🤝 ស្វែងរកផលិតផលបោះដុំពាក់ព័ន្ធនឹង តែ កាហ្វេ ការដុតនំ និងការលក់រាយ (Wholesale Sourcing)',
    '⚙️ សម្ភារៈ និងឧបករណ៍ឆុងកាហ្វេ ធ្វើនំ និងបច្ចេកវិទ្យាពាក់ព័ន្ធនឹងលក់រាយ (Equipment & RetailTech)',
    '🏢 ប្រេនល្បីៗនៅវៀតណាម និងអន្តរជាតិសម្រាប់ទិញសិទ្ធិ Franchise មកកម្ពុជា (Franchise Opportunities)',
    '☕ ចូលរួមព្រឹត្តិការណ៍ពិព័រណ៍អន្តរជាតិធំៗទាំង ៣ ក្នុងពេលតែមួយ (Coffee Expo, Tea-Bakery & VIETRF 2026)',
    '✈️ រួមបញ្ចូលសំបុត្រយន្តហោះ ហូជីមិញ-កោះត្រល់ + កប៉ាល់ល្បឿនលឿនមកកំពត + រថយន្ត VIP ភ្នំពេញ',
    '💥 តម្លៃពិសេសត្រឹម $299/ម្នាក់ សម្រាប់ការចុះឈ្មោះមុនថ្ងៃ 31/08/2026 (តម្លៃធម្មតា $350)'
  ],
  highlightsEn: [
    '🤝 Direct wholesale sourcing for specialty coffee, premium teas, bakery ingredients & retail supply chains',
    '⚙️ Commercial espresso machines, industrial ovens, robotic kitchenware & retail POS tech',
    '🏢 Top regional and global brand licensing & master franchise expansion rights into Cambodia',
    '☕ Full VIP VIP access to 3 major concurrent expos: Coffee Expo, Tea-Bakery Show & VIETRF 2026 at SECC',
    '✈️ Includes domestic flight (HCMC to Phu Quoc) + High-speed international ferry to Kampot + VIP coach',
    '💥 Early-bird special $299/pax for registration before Aug 31, 2026 (Regular: $350)'
  ],
  whoShouldJoin: [
    '☕ ម្ចាស់អាជីវកម្ម និងសហគ្រិនក្នុងវិស័យ ហាងកាហ្វេ តែ ភេសជ្ជៈ និងហាងនំប៉័ង (Café & Bakery Shop Owners)',
    '🏢 អ្នកវិនិយោគ និងធុរជនដែលចង់ទិញសិទ្ធិអាជីវកម្ម Franchise ល្បីៗមកបើកនៅកម្ពុជា (Franchise Investors & Master Licensees)',
    '📦 អ្នកនាំចូល អ្នកចែកចាយ និងអ្នកផ្គត់ផ្គង់វត្ថុធាតុដើមម្ហូបអាហារ និងភេសជ្ជៈ (F&B Raw Material Importers & Distributors)',
    '🏨 ម្ចាស់ភោជនីយដ្ឋាន សណ្ឋាគារ និងអាជីវកម្មបដិសណ្ឋារកិច្ច (Restaurant & Hospitality Management)',
    '⚙️ សហគ្រិនដែលចង់ស្វែងរកម៉ាស៊ីនឆុងកាហ្វេ ឧបករណ៍ធ្វើនំ និងប្រព័ន្ធ POS RetailTech ទំនើប (Equipment & RetailTech Sourcing)'
  ],
  whoShouldJoinKm: [
    '☕ ម្ចាស់អាជីវកម្ម និងសហគ្រិនក្នុងវិស័យ ហាងកាហ្វេ តែ ភេសជ្ជៈ និងហាងនំប៉័ង (Café & Bakery Shop Owners)',
    '🏢 អ្នកវិនិយោគ និងធុរជនដែលចង់ទិញសិទ្ធិអាជីវកម្ម Franchise ល្បីៗមកបើកនៅកម្ពុជា (Franchise Investors & Master Licensees)',
    '📦 អ្នកនាំចូល អ្នកចែកចាយ និងអ្នកផ្គត់ផ្គង់វត្ថុធាតុដើមម្ហូបអាហារ និងភេសជ្ជៈ (F&B Raw Material Importers & Distributors)',
    '🏨 ម្ចាស់ភោជនីយដ្ឋាន សណ្ឋាគារ និងអាជីវកម្មបដិសណ្ឋារកិច្ច (Restaurant & Hospitality Management)',
    '⚙️ សហគ្រិនដែលចង់ស្វែងរកម៉ាស៊ីនឆុងកាហ្វេ ឧបករណ៍ធ្វើនំ និងប្រព័ន្ធ POS RetailTech ទំនើប (Equipment & RetailTech Sourcing)'
  ],
  whoShouldJoinEn: [
    '☕ Café, Specialty Coffee, Tea & Bakery Enterprise Owners and Operators',
    '🏢 Prospective Master Franchise Investors, Brand Developers & Commercial Licensees',
    '📦 F&B Wholesale Importers, Supply Chain Distributors & Raw Material Traders',
    '🏨 Hospitality, Hotel & Restaurant General Managers and F&B Directors',
    '⚙️ Entrepreneurs Sourcing Commercial Espresso Machines, Bakery Automation & Retail POS Tech'
  ],
  whyShouldJoin: [
    '💰 ទទួលបានតម្លៃបោះដុំផ្ទាល់ពីរោងចក្រផលិត និងអ្នកផ្គត់ផ្គង់ធំៗនៅវៀតណាម និងអន្តរជាតិ (Direct Wholesale Factory Pricing)',
    '🤝 ជួបចរចាទល់មុខជាមួយម្ចាស់ប្រេន Franchise ល្បីៗ និងទទួលបានការបញ្ចុះតម្លៃសិទ្ធិអាជីវកម្មពិសេស (Exclusive Franchise Matchmaking)',
    '🎟️ ទស្សនាពិព័រណ៍អន្តរជាតិធំៗទាំង ៣ ក្នុងពេលតែមួយ (Coffee Expo, Tea-Bakery & VIETRF 2026) ដោយឥតគិតថ្លៃ',
    '🗣️ មានអ្នកសម្របសម្រួល និងអ្នកបកប្រែពាណិជ្ជកម្មខ្មែរ-វៀតណាម-អង់គ្លេស ជួយចរចាតម្លៃ និងពិនិត្យកិច្ចសន្យា (Dedicated Business Translators)',
    '🚀 សេវាសម្រួលការធ្វើដំណើរ VIP Fast-Track កាត់បន្ថយការចំណាយ និងពេលវេលា ព្រមទាំងបង្កើតបណ្តាញទំនាក់ទំនងជាមួយសហគ្រិនឆ្នើមៗ (VIP Fast-Track & Elite Networking)'
  ],
  whyShouldJoinKm: [
    '💰 ទទួលបានតម្លៃបោះដុំផ្ទាល់ពីរោងចក្រផលិត និងអ្នកផ្គត់ផ្គង់ធំៗនៅវៀតណាម និងអន្តរជាតិ (Direct Wholesale Factory Pricing)',
    '🤝 ជួបចរចាទល់មុខជាមួយម្ចាស់ប្រេន Franchise ល្បីៗ និងទទួលបានការបញ្ចុះតម្លៃសិទ្ធិអាជីវកម្មពិសេស (Exclusive Franchise Matchmaking)',
    '🎟️ ទស្សនាពិព័រណ៍អន្តរជាតិធំៗទាំង ៣ ក្នុងពេលតែមួយ (Coffee Expo, Tea-Bakery & VIETRF 2026) ដោយឥតគិតថ្លៃ',
    '🗣️ មានអ្នកសម្របសម្រួល និងអ្នកបកប្រែពាណិជ្ជកម្មខ្មែរ-វៀតណាម-អង់គ្លេស ជួយចរចាតម្លៃ និងពិនិត្យកិច្ចសន្យា (Dedicated Business Translators)',
    '🚀 សេវាសម្រួលការធ្វើដំណើរ VIP Fast-Track កាត់បន្ថយការចំណាយ និងពេលវេលា ព្រមទាំងបង្កើតបណ្តាញទំនាក់ទំនងជាមួយសហគ្រិនឆ្នើមៗ (VIP Fast-Track & Elite Networking)'
  ],
  whyShouldJoinEn: [
    '💰 Secure direct wholesale procurement prices from top regional manufacturers without middleman markups',
    '🤝 1-on-1 private matchmaking sessions with verified international brand franchisors and master licensors',
    '🎟️ Free VIP all-access passes to 3 concurrent premier expos: Coffee Expo, Tea-Bakery Show & VIETRF 2026',
    '🗣️ Dedicated trilingual business escorts (Khmer/Vietnamese/English) for contract negotiations and logistics clarity',
    '🚀 Turnkey VIP logistics with domestic flights, 4-star lodging, fast-track border clearance, and high-value delegate networking'
  ],
    inclusions: [
    'សំបុត្រយន្តហោះទៅ-មក ភ្នំពេញ - ក្វាងចូវ (Roundtrip Flight PNH - CAN)',
    'សណ្ឋាគារប្រណិតកម្រិត ៥ ផ្កាយ (៥ យប់ នៅក្រុងក្វាងចូវ)',
    'សេវាបំពេញបែបបទ និងទទួលកាត Buyer Badge ផ្លូវការចូល Canton Fair',
    'រថយន្តក្រុង VIP ជូនដំណើរពេញដំណើរកម្សាន្ត និងទៅ Pazhou Complex រាល់ថ្ងៃ',
    'អាហារប៊ូហ្វេពេលព្រឹក និងអាហារពេលល្ងាចម្ហូបក្វាងទុងពិសេស (Guangdong Banquets)',
    'មគ្គុទ្ទេសក៍ទេសចរណ៍ និងអ្នកបកប្រែភាសាចិន-ខ្មែរ ជំនាញចរចាពាណិជ្ជកម្ម',
    'ធានារ៉ាប់រងការធ្វើដំណើរបេសកកម្មអន្តរជាតិ (International Travel Insurance)'
  ],
  inclusionsKm: [
    'សំបុត្រយន្តហោះទៅ-មក ភ្នំពេញ - ក្វាងចូវ (Roundtrip Flight PNH - CAN)',
    'សណ្ឋាគារប្រណិតកម្រិត ៥ ផ្កាយ (៥ យប់ នៅក្រុងក្វាងចូវ)',
    'សេវាបំពេញបែបបទ និងទទួលកាត Buyer Badge ផ្លូវការចូល Canton Fair',
    'រថយន្តក្រុង VIP ជូនដំណើរពេញដំណើរកម្សាន្ត និងទៅ Pazhou Complex រាល់ថ្ងៃ',
    'អាហារប៊ូហ្វេពេលព្រឹក និងអាហារពេលល្ងាចម្ហូបក្វាងទុងពិសេស (Guangdong Banquets)',
    'មគ្គុទ្ទេសក៍ទេសចរណ៍ និងអ្នកបកប្រែភាសាចិន-ខ្មែរ ជំនាញចរចាពាណិជ្ជកម្ម',
    'ធានារ៉ាប់រងការធ្វើដំណើរបេសកកម្មអន្តរជាតិ (International Travel Insurance)'
  ],
  inclusionsEn: [
    'Roundtrip International Flights: Phnom Penh (PNH) to Guangzhou (CAN) with luggage',
    '5-Star Luxury Hotel Accommodations (5 Nights in Tianhe / Pazhou District)',
    'Official Canton Fair VIP Buyer Badge pre-issuance & expedited entrance pass',
    'Dedicated VIP air-conditioned coach transfers for all scheduled itinerary trips',
    'Daily Hotel Buffet Breakfasts & Authentic Cantonese Executive Dinners / Banquets',
    'Trilingual Commercial Business Interpreters (Khmer, Mandarin Chinese, English)',
    'Comprehensive International Business Travel & Medical Insurance Coverage'
  ],
  exclusions: [
    'ទិដ្ឋាការចូលប្រទេសចិន China Visa Fee (KHB ជួយរៀបចំឯកសារអញ្ជើញ Official Invitation Letter)',
    'ការចំណាយផ្ទាល់ខ្លួនក្រៅពីកម្មវិធី និងទម្ងន់វ៉ាលីសលើសកំណត់',
    'ថ្លៃដឹកជញ្ជូនទំនិញគំរូ ឬការកុម្ម៉ង់ទិញទំនិញផ្ទាល់ខ្លួន'
  ],
  exclusionsKm: [
    'ទិដ្ឋាការចូលប្រទេសចិន China Visa Fee (KHB ជួយរៀបចំឯកសារអញ្ជើញ Official Invitation Letter)',
    'ការចំណាយផ្ទាល់ខ្លួនក្រៅពីកម្មវិធី និងទម្ងន់វ៉ាលីសលើសកំណត់',
    'ថ្លៃដឹកជញ្ជូនទំនិញគំរូ ឬការកុម្ម៉ង់ទិញទំនិញផ្ទាល់ខ្លួន'
  ],
  exclusionsEn: [
    'China Entry Visa processing fee (KHB provides Official Corporate Invitation Letter)',
    'Personal expenditures (souvenirs, private laundry, telecommunications, minibar)',
    'International freight, shipping container fees, or commercial sample cargo costs'
  ],
  termsAndConditions: [
    'លិខិតឆ្លងដែន (Passport) ត្រូវតែមានសុពលភាពយ៉ាងតិច ៦ ខែ គិតចាប់ពីថ្ងៃចេញដំណើរ។',
    'ការកក់កន្លែង និងធានាសិទ្ធិចូលរួម ត្រូវតម្កល់ប្រាក់កក់យ៉ាងតិច 50% នៃតម្លៃសរុបពេលចុះឈ្មោះ។',
    'ការបង់ប្រាក់បង្គ្រប់ 100% ត្រូវធ្វើឡើងយ៉ាងតិច ៧ ថ្ងៃ មុនកាលបរិច្ឆេទចេញដំណើរ។',
    'ករណីលុបចោលការធ្វើដំណើរមុន ១៥ ថ្ងៃ នឹងទទួលបានការបង្វិលប្រាក់វិញ 70%។ ករណីលុបចោលក្រោម ៧ ថ្ងៃ មិនអាចបង្វិលប្រាក់បានទេ។',
    'អ្នកចូលរួមត្រូវគោរពតាមពេលវេលា និងការណែនាំរបស់មគ្គុទ្ទេសក៍ និងអ្នកសម្របសម្រួលបេសកកម្ម។',
    'ក្រុមហ៊ុនសូមរក្សាសិទ្ធិកែប្រែកាលវិភាគ ឬសណ្ឋាគារក្នុងកម្រិតស្មើគ្នា ករណីមានប្រធានសក្តិ ឬហេតុការណ៍ចៃដន្យ។'
  ],
  termsAndConditionsKm: [
    'លិខិតឆ្លងដែន (Passport) ត្រូវតែមានសុពលភាពយ៉ាងតិច ៦ ខែ គិតចាប់ពីថ្ងៃចេញដំណើរ។',
    'ការកក់កន្លែង និងធានាសិទ្ធិចូលរួម ត្រូវតម្កល់ប្រាក់កក់យ៉ាងតិច 50% នៃតម្លៃសរុបពេលចុះឈ្មោះ។',
    'ការបង់ប្រាក់បង្គ្រប់ 100% ត្រូវធ្វើឡើងយ៉ាងតិច ៧ ថ្ងៃ មុនកាលបរិច្ឆេទចេញដំណើរ។',
    'ករណីលុបចោលការធ្វើដំណើរមុន ១៥ ថ្ងៃ នឹងទទួលបានការបង្វិលប្រាក់វិញ 70%។ ករណីលុបចោលក្រោម ៧ ថ្ងៃ មិនអាចបង្វិលប្រាក់បានទេ។',
    'អ្នកចូលរួមត្រូវគោរពតាមពេលវេលា និងការណែនាំរបស់មគ្គុទ្ទេសក៍ និងអ្នកសម្របសម្រួលបេសកកម្ម។',
    'ក្រុមហ៊ុនសូមរក្សាសិទ្ធិកែប្រែកាលវិភាគ ឬសណ្ឋាគារក្នុងកម្រិតស្មើគ្នា ករណីមានប្រធានសក្តិ ឬហេតុការណ៍ចៃដន្យ។'
  ],
  termsAndConditionsEn: [
    'All delegates must hold a valid passport with at least 6 months validity from departure date.',
    'A 50% deposit is required at registration to secure seat, domestic flights, and official VIP expo badges.',
    'Full settlement of balance must be completed at least 7 days prior to the scheduled departure.',
    'Cancellation 15+ days prior receives a 70% refund. Cancellations within 7 days are strictly non-refundable.',
    'Delegates are expected to adhere to scheduled assembly times, dress codes, and coordinator protocols.',
    'KHB reserves the right to adjust sequence of activities or lodging to equivalent 4-star standards under unforeseen events or force majeure.'
  ],
  coordinates: {
    lat: 10.8231,
    lng: 106.6297,
    mapX: 74,
    mapY: 62
  },
  tags: ['trending', 'popular', 'cultural', 'luxury'],
  emergencyContact: {
    country: 'Vietnam (Ho Chi Minh City & Phu Quoc)',
    police: '113',
    ambulance: '115',
    touristHelpline: '060 815 515 (Mr. Tim Vutha)',
    embassySupport: '+84 28 3829 2751 (Royal Embassy of Cambodia in Vietnam)'
  },
  tourGuide: {
    name: 'Mr. Tim Vutha & Senior Escort Team',
    nameKm: 'លោក ធីម វុទ្ធា និងក្រុមការងារសម្របសម្រួលជាន់ខ្ពស់',
    nameEn: 'Mr. Tim Vutha & Senior Operations Escort Team',
    title: 'Lead Trade Mission Coordinator & Certified Tour Director',
    titleKm: 'ប្រធានសម្របសម្រួលបេសកកម្មពាណិជ្ជកម្ម & ប្រធានដឹកនាំគណៈប្រតិភូ',
    titleEn: 'Lead Trade Mission Coordinator & Certified Tour Director',
    phone: '060 815 515',
    telegram: '@VuthaTim',
    languages: ['Khmer', 'Vietnamese', 'English'],
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    badgeNumber: 'KHB-TM-2026-01',
    emergencyContact: '060 815 515',
    bio: 'អ្នកសម្របសម្រួលបេសកកម្មពាណិជ្ជកម្មជាន់ខ្ពស់ និងជាប្រធានដឹកនាំគណៈប្រតិភូពាណិជ្ជកម្មកម្ពុជា-វៀតណាម ប្រកបដោយបទពិសោធន៍ជាង ១២ ឆ្នាំ។',
    bioKm: 'អ្នកសម្របសម្រួលបេសកកម្មពាណិជ្ជកម្មជាន់ខ្ពស់ និងជាប្រធានដឹកនាំគណៈប្រតិភូពាណិជ្ជកម្មកម្ពុជា-វៀតណាម ប្រកបដោយបទពិសោធន៍ជាង ១២ ឆ្នាំ។',
    bioEn: 'Senior trade mission coordinator and seasoned Cambodia-Vietnam bilateral delegate lead with over 12 years of cross-border trade escort experience.',
    briefingMeetingPoint: 'រាជធានីភ្នំពេញ (ចំណុចប្រមូលផ្តុំ KHB Head Office / រថយន្ត VIP) - ម៉ោង ០៦:០០ ព្រឹក',
    briefingMeetingPointKm: 'រាជធានីភ្នំពេញ (ចំណុចប្រមូលផ្តុំ KHB Head Office / រថយន្ត VIP) - ម៉ោង ០៦:០០ ព្រឹក',
    briefingMeetingPointEn: 'Phnom Penh (KHB Head Office Departure Bay / VIP Charter Coach) - 06:00 AM',
    briefingTime: '06:00 AM (ថ្ងៃទី 29/10/2026)',
    briefingTimeKm: '06:00 ព្រឹក (ថ្ងៃទី 29/10/2026)',
    briefingTimeEn: '06:00 AM (October 29, 2026)'
  },
  optionalPrograms: [
    {
      id: 'opt_vip_matchmaking',
      title: 'កម្មវិធី B2B VIP Matchmaking & ជំនួបពាណិជ្ជកម្មទល់មុខ',
      titleKm: 'កម្មវិធី B2B VIP Matchmaking & ជំនួបពាណិជ្ជកម្មទល់មុខ',
      titleEn: 'VIP B2B Matchmaking & Private Enterprise Meeting',
      description: 'ការរៀបចំជំនួបផ្ទាល់ជាមួយម្ចាស់សហគ្រាសក្នុងស្រុក 3-5 ក្រុមហ៊ុន និងអាហារពេលល្ងាចបណ្តាញពាណិជ្ជកម្ម VIP',
      descriptionKm: 'ការរៀបចំជំនួបផ្ទាល់ជាមួយម្ចាស់សហគ្រាសក្នុងស្រុក 3-5 ក្រុមហ៊ុន និងអាហារពេលល្ងាចបណ្តាញពាណិជ្ជកម្ម VIP',
      descriptionEn: 'Tailored 1-on-1 boardroom meetings with 3-5 verified Vietnamese suppliers, manufacturers, or brand owners with bilingual translation and executive dinner.',
      additionalCostUSD: 120,
      durationHours: 3.5,
      recommendedAudience: 'Business Owners & Franchise Investors',
      recommendedAudienceKm: 'ម្ចាស់អាជីវកម្ម និងវិនិយោគិន Franchise',
      recommendedAudienceEn: 'Business Owners & Franchise Investors',
      highlights: [
        'Dedicated bilingual translator & negotiator',
        'Private conference lounge with coffee service',
        'Curated buyer directory & company profiles'
      ],
      highlightsKm: [
        'អ្នកបកប្រែផ្ទាល់ខ្លួនជំនាញចរចាពាណិជ្ជកម្ម',
        'បន្ទប់ប្រជុំ VIP ឯកជនជាមួយសេវាកាហ្វេ និងភេសជ្ជៈ',
        'បញ្ជីទម្រង់ក្រុមហ៊ុន និងទិន្នន័យទំនាក់ទំនងម្ចាស់សហគ្រាស'
      ],
      highlightsEn: [
        'Dedicated bilingual commercial interpreter & negotiation support',
        'Private executive conference lounge with coffee & refreshment service',
        'Curated manufacturer directories & verified company dossier'
      ],
      includesGuide: true,
      includedMeals: ['VIP Executive Banquet'],
      includedMealsKm: ['អាហារពេលល្ងាច VIP Banquet'],
      includedMealsEn: ['VIP Executive Banquet Dinner'],
      meetingPoint: 'Hotel Executive Conference Lounge (5:30 PM)',
      meetingPointKm: 'បន្ទប់ប្រជុំ VIP សណ្ឋាគារ (ម៉ោង ០៥:៣០ ល្ងាច)',
      meetingPointEn: 'Hotel Executive Conference Lounge (5:30 PM)'
    },
    {
      id: 'opt_night_market_foodie',
      title: 'ដំណើរកម្សាន្តពេលរាត្រី & ភ្លក់រសជាតិម្ហូបតំបន់ល្បីៗ',
      titleKm: 'ដំណើរកម្សាន្តពេលរាត្រី & ភ្លក់រសជាតិម្ហូបតំបន់ល្បីៗ',
      titleEn: 'Saigon Night Discovery & Gourmet Street Food Experience',
      description: 'ដំណើរទស្សនកិច្ចពេលល្ងាចជាមួយមគ្គុទ្ទេសក៍ទេសចរណ៍ទៅកាន់ផ្សាររាត្រី និងតំបន់ទេសចរណ៍វប្បធម៌ល្បីៗនៅហូជីមិញ',
      descriptionKm: 'ដំណើរទស្សនកិច្ចពេលល្ងាចជាមួយមគ្គុទ្ទេសក៍ទេសចរណ៍ទៅកាន់ផ្សាររាត្រី និងតំបន់ទេសចរណ៍វប្បធម៌ល្បីៗនៅហូជីមិញ',
      descriptionEn: 'Guided evening walking tour to celebrated night markets, historic French quarter landmarks, and tasting of authentic Saigon culinary street delicacies.',
      additionalCostUSD: 45,
      durationHours: 3,
      recommendedAudience: 'All Delegates & Travelers',
      recommendedAudienceKm: 'គណៈប្រតិភូ និងអ្នករួមដំណើរទាំងអស់',
      recommendedAudienceEn: 'All Delegates & Travelers',
      highlights: [
        'Safe private chauffeured transport',
        'Certified English & Khmer speaking guide',
        'Tasting of 5 traditional Vietnamese specialties'
      ],
      highlightsKm: [
        'រថយន្ត VIP ជូនដំណើរប្រកបដោយសុវត្ថិភាពខ្ពស់',
        'មគ្គុទ្ទេសក៍ទេសចរណ៍និយាយភាសាខ្មែរ-អង់គ្លេស-វៀតណាម',
        'ភ្លក់រសជាតិម្ហូបប្រពៃណីល្បីៗចំនួន ៥ មុខ'
      ],
      highlightsEn: [
        'Safe private chauffeured transport in prime Saigon quarters',
        'Certified trilingual culinary guide',
        'Tasting of 5 famous regional Vietnamese specialties & artisanal dessert'
      ],
      includesGuide: true,
      includedMeals: ['Tasting samples & specialty drinks'],
      includedMealsKm: ['អាហារសម្រន់ & ភេសជ្ជៈពិសេស'],
      includedMealsEn: ['Specialty street food samples & traditional drinks'],
      meetingPoint: 'Hotel Main Lobby (6:45 PM)',
      meetingPointKm: 'ឡប់ប៊ីធំសណ្ឋាគារ (ម៉ោង ០៦:៤៥ យប់)',
      meetingPointEn: 'Hotel Main Lobby (6:45 PM)'
    },
    {
      id: 'opt_factory_visit',
      title: 'ដំណើរចុះពិនិត្យរោងចក្រកែច្នៃ & មជ្ឈមណ្ឌលភស្តុភារ Logistics',
      titleKm: 'ដំណើរចុះពិនិត្យរោងចក្រកែច្នៃ & មជ្ឈមណ្ឌលភស្តុភារ Logistics',
      titleEn: 'Automated Processing Plant & Cross-Border Logistics Tour',
      description: 'ដំណើរទស្សនកិច្ចផ្ទាល់ទៅកាន់តំបន់សេដ្ឋកិច្ចពិសេស និងរោងចក្រផលិត/វេចខ្ចប់តែ និងកាហ្វេស្វ័យប្រវត្តិកម្មទំនើប',
      descriptionKm: 'ដំណើរទស្សនកិច្ចផ្ទាល់ទៅកាន់តំបន់សេដ្ឋកិច្ចពិសេស និងរោងចក្រផលិត/វេចខ្ចប់តែ និងកាហ្វេស្វ័យប្រវត្តិកម្មទំនើប',
      descriptionEn: 'On-site technical tour of high-tech roasting plants, automated packaging lines, and cross-border logistics distribution hubs connecting to Phnom Penh.',
      additionalCostUSD: 85,
      durationHours: 4,
      recommendedAudience: 'Importers, Exporters & Coffee/Tea Entrepreneurs',
      recommendedAudienceKm: 'អ្នកនាំចូល-ចេញ និងសហគ្រិនតែ-កាហ្វេ',
      recommendedAudienceEn: 'Importers, Exporters & Coffee/Tea Entrepreneurs',
      highlights: [
        'Factory floor briefing by Plant Operations Manager',
        'Logistics tariff & customs clearance guide to Cambodia',
        'Round-trip VIP bus transport'
      ],
      highlightsKm: [
        'បទបង្ហាញផ្ទាល់ពីរោងចក្រដោយប្រធានគ្រប់គ្រងផលិតកម្ម',
        'ការណែនាំអំពីពន្ធគយ និងបែបបទនាំចូលមកកម្ពុជា',
        'រថយន្ត VIP ជូនដំណើរទៅ-មក'
      ],
      highlightsEn: [
        'Factory floor briefing by Plant Operations Directors',
        'Cambodia import tariffs, certificate of origin & customs procedure guide',
        'Round-trip VIP charter bus transport'
      ],
      includesGuide: true,
      includedMeals: ['Networking Coffee & Refreshments'],
      includedMealsKm: ['កាហ្វេបណ្តាញពាណិជ្ជកម្ម & អាហារសម្រន់'],
      includedMealsEn: ['Networking Coffee & Refreshments'],
      meetingPoint: 'Hotel Front Driveway (1:30 PM)',
      meetingPointKm: 'ច្រកចូលមុខសណ្ឋាគារ (ម៉ោង ០១:៣០ រសៀល)',
      meetingPointEn: 'Hotel Front Driveway (1:30 PM)'
    }
  ],
  itinerary: [
    {
      day: 1,
      title: 'ភ្នំពេញ - ឆ្លងដែន VIP - ទីក្រុងហូជីមិញ & ពិធីស្វាគមន៍គណៈប្រតិភូ',
      titleKm: 'ភ្នំពេញ - ឆ្លងដែន VIP - ទីក្រុងហូជីមិញ & ពិធីស្វាគមន៍គណៈប្រតិភូ',
      titleEn: 'Phnom Penh - VIP Fast-Track Border - Ho Chi Minh City & Delegation Gala',
      description: 'ចេញដំណើរពីរាជធានីភ្នំពេញដោយរថយន្តក្រុង VIP ឆ្លងកាត់ច្រកទ្វារព្រំដែនបាវិត/ម៉ុកបៃ ជាមួយនឹងសេវាសម្រួលបែបបទឆ្លងដែនរហ័ស។ មកដល់ទីក្រុងហូជីមិញ ចូលឆែកអ៊ីនសណ្ឋាគារ ៤ ផ្កាយ និងពិសារអាហារពេលល្ងាចស្វាគមន៍។',
      descriptionKm: 'ចេញដំណើរពីរាជធានីភ្នំពេញដោយរថយន្តក្រុង VIP ឆ្លងកាត់ច្រកទ្វារព្រំដែនបាវិត/ម៉ុកបៃ ជាមួយនឹងសេវាសម្រួលបែបបទឆ្លងដែនរហ័ស។ មកដល់ទីក្រុងហូជីមិញ ចូលឆែកអ៊ីនសណ្ឋាគារ ៤ ផ្កាយ និងពិសារអាហារពេលល្ងាចស្វាគមន៍។',
      descriptionEn: 'Depart Phnom Penh aboard luxury VIP coach with fast-track border clearance at Bavet/Moc Bai. Arrive in Ho Chi Minh City, check in to 4-star boutique hotel in District 1, and attend the welcome orientation delegation dinner.',
      hotelName: 'Grand Saigon Riverside Boutique Hotel (4-Star)',
      hotelNameKm: 'សណ្ឋាគារ Grand Saigon Riverside Boutique (កម្រិត ៤ ផ្កាយ)',
      hotelNameEn: 'Grand Saigon Riverside Boutique Hotel (4-Star)',
      mealsIncluded: ['Breakfast', 'Welcome Dinner'],
      mealsIncludedKm: ['អាហារពេលព្រឹក', 'អាហារពេលល្ងាចស្វាគមន៍'],
      mealsIncludedEn: ['Light Breakfast', 'Welcome Gala Dinner'],
      guideAgenda: [
        {
          time: '06:00 AM - 06:30 AM',
          activity: 'ជួបជុំគណៈប្រតិភូនៅភ្នំពេញ & ចែកកាតសម្គាល់បេសកកម្ម',
          activityKm: 'ជួបជុំគណៈប្រតិភូនៅភ្នំពេញ & ចែកកាតសម្គាល់បេសកកម្ម',
          activityEn: 'Delegation Assembly at Phnom Penh & Official Mission Badge Distribution',
          location: 'KHB Head Office Departure Bay',
          locationKm: 'ចំណុចប្រមូលផ្តុំ KHB Head Office រាជធានីភ្នំពេញ',
          locationEn: 'KHB Head Office Departure Bay, Phnom Penh',
          notes: 'សូមរៀបចំលិខិតឆ្លងដែន Passport ឱ្យបានរួចរាល់',
          notesKm: 'សូមរៀបចំលិខិតឆ្លងដែន Passport ឱ្យបានរួចរាល់ (សុពលភាពលើស ៦ ខែ)',
          notesEn: 'Please ensure valid passports with at least 6 months remaining validity'
        },
        {
          time: '06:30 AM - 10:30 AM',
          activity: 'ធ្វើដំណើរតាមរថយន្ត VIP ឆ្ពោះទៅច្រកទ្វារព្រំដែនបាវិត-ម៉ុកបៃ',
          activityKm: 'ធ្វើដំណើរតាមរថយន្ត VIP ឆ្ពោះទៅច្រកទ្វារព្រំដែនបាវិត-ម៉ុកបៃ',
          activityEn: 'VIP Coach Scenic Transit along National Road 1 to Bavet Border',
          location: 'National Road 1',
          locationKm: 'ផ្លូវជាតិលេខ ១',
          locationEn: 'National Highway 1',
          notes: 'មានចែកអាហារសម្រន់ & ភេសជ្ជៈលើរថយន្ត',
          notesKm: 'មានចែកអាហារសម្រន់ & ភេសជ្ជៈលើរថយន្ត',
          notesEn: 'Complimentary onboard refreshments & executive mission briefing'
        },
        {
          time: '10:30 AM - 11:30 AM',
          activity: 'សម្រួលបែបបទឆ្លងដែន VIP Fast-Track & ចូលប្រទេសវៀតណាម',
          activityKm: 'សម្រួលបែបបទឆ្លងដែន VIP Fast-Track & ចូលប្រទេសវៀតណាម',
          activityEn: 'VIP Fast-Track Customs & Border Immigration Clearance',
          location: 'Bavet - Moc Bai Border Checkpoint',
          locationKm: 'ច្រកទ្វារព្រំដែនអន្តរជាតិបាវិត-ម៉ុកបៃ',
          locationEn: 'Bavet - Moc Bai International Border Checkpoint',
          notes: 'មគ្គុទ្ទេសក៍ KHB សម្រួលបែបបទជូន',
          notesKm: 'មគ្គុទ្ទេសក៍ KHB សម្រួលបែបបទជូន',
          notesEn: 'Expedited VIP lanes escorted by KHB border liaison officers'
        },
        {
          time: '12:00 PM - 01:30 PM',
          activity: 'ទទួលទានអាហារថ្ងៃត្រង់ពិសេសនៅតំបន់ត្រាងបាង (Trang Bang Specialty)',
          activityKm: 'ទទួលទានអាហារថ្ងៃត្រង់ពិសេសនៅតំបន់ត្រាងបាង (Trang Bang Specialty)',
          activityEn: 'Deluxe Regional Cuisine Lunch at Trang Bang Culinary Center',
          location: 'Trang Bang Culinary Center',
          locationKm: 'មជ្ឈមណ្ឌលម្ហូបប្រចាំតំបន់ត្រាងបាង',
          locationEn: 'Trang Bang Culinary Center'
        },
        {
          time: '02:00 PM - 03:30 PM',
          activity: 'មកដល់ទីក្រុងហូជីមិញ និងចូលឆែកអ៊ីនសណ្ឋាគារ ៤ ផ្កាយ',
          activityKm: 'មកដល់ទីក្រុងហូជីមិញ និងចូលឆែកអ៊ីនសណ្ឋាគារ ៤ ផ្កាយ',
          activityEn: 'Arrival in Saigon District 1 & Hotel Check-in',
          location: 'District 1, Ho Chi Minh City',
          locationKm: 'ខណ្ឌទី១ ទីក្រុងហូជីមិញ',
          locationEn: 'District 1, Ho Chi Minh City'
        },
        {
          time: '05:30 PM - 08:30 PM',
          activity: 'កម្មវិធីណែនាំគណៈប្រតិភូ Orientation & អាហារពេលល្ងាចស្វាគមន៍',
          activityKm: 'កម្មវិធីណែនាំគណៈប្រតិភូ Orientation & អាហារពេលល្ងាចស្វាគមន៍',
          activityEn: 'Mission Orientation Briefing & Welcome Gala Dinner',
          location: 'Hotel Grand Banquet Hall',
          locationKm: 'សាលពិធីធំសណ្ឋាគារ',
          locationEn: 'Hotel Grand Banquet Hall',
          notes: 'ណែនាំគម្រោងពិព័រណ៍ និងចែកកាតចូលរួម',
          notesKm: 'ណែនាំគម្រោងពិព័រណ៍ និងចែកកាតចូលរួម VIP Expo Passes',
          notesEn: 'Distribution of SECC VIP visitor passes and expo map navigation kits'
        }
      ]
    },
    {
      day: 2,
      title: 'ទស្សនាពិព័រណ៍អន្តរជាតិ Coffee Expo, Tea-Bakery & Retailtech/Franchise Show 2026',
      titleKm: 'ទស្សនាពិព័រណ៍អន្តរជាតិ Coffee Expo, Tea-Bakery & Retailtech/Franchise Show 2026',
      titleEn: 'International Coffee Expo, Tea-Bakery & RetailTech / VIETRF Franchise Expo 2026',
      description: 'ពេញមួយថ្ងៃទស្សនា និងជួបពិភាក្សាធុរកិច្ច B2B នៅមជ្ឈមណ្ឌលពិព័រណ៍អន្តរជាតិ SECC Saigon លើវិស័យតែ កាហ្វេ ដុតនំ បច្ចេកវិទ្យាលក់រាយ និងម៉ាក Franchise ល្បីៗ។',
      descriptionKm: 'ពេញមួយថ្ងៃទស្សនា និងជួបពិភាក្សាធុរកិច្ច B2B នៅមជ្ឈមណ្ឌលពិព័រណ៍អន្តរជាតិ SECC Saigon លើវិស័យតែ កាហ្វេ ដុតនំ បច្ចេកវិទ្យាលក់រាយ និងម៉ាក Franchise ល្បីៗ។',
      descriptionEn: 'Full-day VIP exhibition exploration and B2B matchmaking sessions at Saigon Exhibition & Convention Center (SECC), covering Coffee Expo Vietnam, International Tea & Bakery, and VIETRF Franchise Show.',
      hotelName: 'Grand Saigon Riverside Boutique Hotel (4-Star)',
      hotelNameKm: 'សណ្ឋាគារ Grand Saigon Riverside Boutique (កម្រិត ៤ ផ្កាយ)',
      hotelNameEn: 'Grand Saigon Riverside Boutique Hotel (4-Star)',
      mealsIncluded: ['Breakfast', 'Networking Coffee'],
      mealsIncludedKm: ['អាហារពេលព្រឹកប៊ូហ្វេ', 'កាហ្វេបណ្តាញធុរកិច្ច'],
      mealsIncludedEn: ['Hotel Buffet Breakfast', 'Executive Networking Coffee'],
      guideAgenda: [
        {
          time: '07:00 AM - 08:30 AM',
          activity: 'អាហារពេលព្រឹកប៊ូហ្វេនៅសណ្ឋាគារ',
          activityKm: 'អាហារពេលព្រឹកប៊ូហ្វេនៅសណ្ឋាគារ',
          activityEn: 'International Buffet Breakfast at Hotel Restaurant',
          location: 'Hotel Restaurant',
          locationKm: 'ភោជនីយដ្ឋានសណ្ឋាគារ',
          locationEn: 'Hotel Restaurant'
        },
        {
          time: '08:45 AM - 09:15 AM',
          activity: 'រថយន្ត VIP ដឹកជញ្ជូនគណៈប្រតិភូទៅកាន់មជ្ឈមណ្ឌលពិព័រណ៍ SECC',
          activityKm: 'រថយន្ត VIP ដឹកជញ្ជូនគណៈប្រតិភូទៅកាន់មជ្ឈមណ្ឌលពិព័រណ៍ SECC',
          activityEn: 'Private Coach Shuttle to SECC Exhibition Grounds',
          location: 'Saigon Exhibition & Convention Center (SECC)',
          locationKm: 'មជ្ឈមណ្ឌលពិព័រណ៍ SECC',
          locationEn: 'Saigon Exhibition & Convention Center (SECC)'
        },
        {
          time: '09:30 AM - 12:30 PM',
          activity: 'ចូលទស្សនាពិព័រណ៍ Coffee Expo Vietnam & Vietnam International Coffee-Tea-Bakery 2026',
          activityKm: 'ចូលទស្សនាពិព័រណ៍ Coffee Expo Vietnam & Vietnam International Coffee-Tea-Bakery 2026',
          activityEn: 'VIP Access: Coffee Expo Vietnam & International Coffee-Tea-Bakery Show 2026',
          location: 'Hall A & B - SECC',
          locationKm: 'សាល A & B មជ្ឈមណ្ឌល SECC',
          locationEn: 'Hall A & B - SECC',
          notes: 'ស្វែងរកប្រភពផលិតផលបោះដុំ និងម៉ាស៊ីនឆុងកាហ្វេទំនើប',
          notesKm: 'ស្វែងរកប្រភពផលិតផលបោះដុំ និងម៉ាស៊ីនឆុងកាហ្វេទំនើប',
          notesEn: 'Wholesale sourcing for raw beans, syrups, roasting machinery & espresso equipment'
        },
        {
          time: '12:30 PM - 02:00 PM',
          activity: 'សម្រាកអាហារថ្ងៃត្រង់ & ពិភាក្សាបណ្តាញធុរកិច្ច',
          activityKm: 'សម្រាកអាហារថ្ងៃត្រង់ & ពិភាក្សាបណ្តាញធុរកិច្ច',
          activityEn: 'Networking Lunch Break & Delegate Discussion',
          location: 'SECC Executive Food Court',
          locationKm: 'មជ្ឈមណ្ឌលអាហារ SECC',
          locationEn: 'SECC Executive Food Court'
        },
        {
          time: '02:00 PM - 05:00 PM',
          activity: 'ទស្សនាពិព័រណ៍ Retailtech & Franchise Show 2026 (VIETRF)',
          activityKm: 'ទស្សនាពិព័រណ៍ Retailtech & Franchise Show 2026 (VIETRF)',
          activityEn: 'VIP Access: VIETRF RetailTech & International Franchise Expo 2026',
          location: 'Hall C - SECC',
          locationKm: 'សាល C មជ្ឈមណ្ឌល SECC',
          locationEn: 'Hall C - SECC',
          notes: 'ជួបម្ចាស់ប្រេនល្បីៗ និងស្វែងយល់ពីប្រព័ន្ធគ្រប់គ្រងការលក់ POS/AI',
          notesKm: 'ជួបម្ចាស់ប្រេនល្បីៗ និងស្វែងយល់ពីប្រព័ន្ធគ្រប់គ្រងការលក់ POS/AI',
          notesEn: 'Meet regional brand licensors, AI POS kiosks, packaging automation & logistics partners'
        },
        {
          time: '05:30 PM - 08:30 PM',
          activity: 'រថយន្តជូនត្រឡប់មកសណ្ឋាគារ / ជម្រើសកម្មវិធី B2B VIP Matchmaking & អាហារពេលល្ងាច',
          activityKm: 'រថយន្តជូនត្រឡប់មកសណ្ឋាគារ / ជម្រើសកម្មវិធី B2B VIP Matchmaking & អាហារពេលល្ងាច',
          activityEn: 'Return Coach to Hotel / Optional Private B2B Matchmaking Banquet',
          location: 'District 1',
          locationKm: 'ខណ្ឌទី១ ហូជីមិញ',
          locationEn: 'District 1, Ho Chi Minh City'
        }
      ]
    },
    {
      day: 3,
      title: 'ហោះហើរ ហូជីមិញ ទៅ កោះត្រល់ (Phu Quoc) - ទស្សនកិច្ចគំរូអាជីវកម្ម & រាត្រីកម្សាន្ត Grand World',
      titleKm: 'ហោះហើរ ហូជីមិញ ទៅ កោះត្រល់ (Phu Quoc) - ទស្សនកិច្ចគំរូអាជីវកម្ម & រាត្រីកម្សាន្ត Grand World',
      titleEn: 'Flight to Phu Quoc Island - Agri-Business Enterprise Tour & Grand World Sleepless City',
      description: 'ជិះយន្តហោះពីទីក្រុងហូជីមិញទៅកាន់កោះត្រល់ (Phu Quoc)។ ចូលទស្សនាគំរូអាជីវកម្មសេវាកម្ម កសិដ្ឋានកែច្នៃកាហ្វេ/ម្រេច និងតំបន់ពាណិជ្ជកម្មរាត្រី Grand World Sleepless City។',
      descriptionKm: 'ជិះយន្តហោះពីទីក្រុងហូជីមិញទៅកាន់កោះត្រល់ (Phu Quoc)។ ចូលទស្សនាគំរូអាជីវកម្មសេវាកម្ម កសិដ្ឋានកែច្នៃកាហ្វេ/ម្រេច និងតំបន់ពាណិជ្ជកម្មរាត្រី Grand World Sleepless City។',
      descriptionEn: 'Domestic scheduled flight from Saigon to Phu Quoc Island. Check into 4-star beach resort, inspect agricultural processing hubs & retail models, followed by an evening at Grand World Sleepless City & Venice Water Show.',
      hotelName: 'Phu Quoc Emerald Bay Luxury Beach Resort (4-Star)',
      hotelNameKm: 'រីសត Phu Quoc Emerald Bay Luxury Beach (កម្រិត ៤ ផ្កាយ)',
      hotelNameEn: 'Phu Quoc Emerald Bay Luxury Beach Resort (4-Star)',
      mealsIncluded: ['Breakfast', 'Seafood Banquet'],
      mealsIncludedKm: ['អាហារពេលព្រឹក', 'អាហារគ្រឿងសមុទ្រស្រស់'],
      mealsIncludedEn: ['Resort Breakfast', 'Fresh Coastal Seafood Banquet'],
      guideAgenda: [
        {
          time: '07:00 AM - 08:00 AM',
          activity: 'អាហារពេលព្រឹក និងឆែកអោតសណ្ឋាគារ',
          activityKm: 'អាហារពេលព្រឹក និងឆែកអោតសណ្ឋាគារ',
          activityEn: 'Breakfast & Hotel Express Checkout',
          location: 'Hotel Lobby',
          locationKm: 'ឡប់ប៊ីសណ្ឋាគារ',
          locationEn: 'Hotel Lobby'
        },
        {
          time: '08:15 AM - 09:30 AM',
          activity: 'រថយន្តជូនដំណើរទៅព្រលានយន្តហោះ Tan Son Nhat',
          activityKm: 'រថយន្តជូនដំណើរទៅព្រលានយន្តហោះ Tan Son Nhat',
          activityEn: 'Airport Transfer to Tan Son Nhat Domestic Terminal',
          location: 'Domestic Terminal',
          locationKm: 'ព្រលានយន្តហោះ Tan Son Nhat',
          locationEn: 'Tan Son Nhat Domestic Terminal (SGN)'
        },
        {
          time: '10:30 AM - 11:35 AM',
          activity: 'ជើងហោះហើរក្នុងស្រុក ហូជីមិញ ទៅ កោះត្រល់ (Phu Quoc)',
          activityKm: 'ជើងហោះហើរក្នុងស្រុក ហូជីមិញ ទៅ កោះត្រល់ (Phu Quoc)',
          activityEn: 'Scheduled Domestic Flight: Ho Chi Minh (SGN) to Phu Quoc (PQC)',
          location: 'Flight SGN -> PQC',
          locationKm: 'ជើងហោះហើរ SGN -> PQC',
          locationEn: 'Flight SGN -> PQC',
          notes: 'សំបុត្រយន្តហោះត្រូវបានរួមបញ្ចូលរួចជាស្រេច',
          notesKm: 'សំបុត្រយន្តហោះត្រូវបានរួមបញ្ចូលរួចជាស្រេច',
          notesEn: 'Domestic flight ticket & baggage allowance included'
        },
        {
          time: '12:00 PM - 01:30 PM',
          activity: 'មកដល់កោះត្រល់ ទទួលទានអាហារថ្ងៃត្រង់គ្រឿងសមុទ្រស្រស់ៗ',
          activityKm: 'មកដល់កោះត្រល់ ទទួលទានអាហារថ្ងៃត្រង់គ្រឿងសមុទ្រស្រស់ៗ',
          activityEn: 'Phu Quoc Island Arrival & Fresh Coastal Seafood Lunch',
          location: 'Phu Quoc Coastal Restaurant',
          locationKm: 'ភោជនីយដ្ឋានមាត់សមុទ្រកោះត្រល់',
          locationEn: 'Phu Quoc Coastal Restaurant'
        },
        {
          time: '02:00 PM - 05:00 PM',
          activity: 'ទស្សនកិច្ចសិក្សាគំរូអាជីវកម្មកែច្នៃកសិផល & តំបន់ទេសចរណ៍ពាណិជ្ជកម្ម',
          activityKm: 'ទស្សនកិច្ចសិក្សាគំរូអាជីវកម្មកែច្នៃកសិផល & តំបន់ទេសចរណ៍ពាណិជ្ជកម្ម',
          activityEn: 'Field Study: Agri-Processing Export Models & Commercial Tourism Concepts',
          location: 'Phu Quoc Enterprise Center',
          locationKm: 'មជ្ឈមណ្ឌលសហគ្រាសកោះត្រល់',
          locationEn: 'Phu Quoc Enterprise Center'
        },
        {
          time: '06:00 PM - 09:30 PM',
          activity: 'ទស្សនាក្រុងមិនដែលដេក Grand World Phu Quoc & ការសម្តែងសិល្បៈទឹក Water Show',
          activityKm: 'ទស្សនាក្រុងមិនដែលដេក Grand World Phu Quoc & ការសម្តែងសិល្បៈទឹក Water Show',
          activityEn: 'Grand World Sleepless City Tour, Venice Canals & Illuminated Water Symphony',
          location: 'Grand World Phu Quoc',
          locationKm: 'ក្រុងមិនដែលដេក Grand World កោះត្រល់',
          locationEn: 'Grand World Phu Quoc'
        }
      ]
    },
    {
      day: 4,
      title: 'កោះត្រល់ - ជិះកប៉ាល់ល្បឿនលឿនមកកំពត - រថយន្ត VIP ត្រឡប់មកភ្នំពេញ',
      titleKm: 'កោះត្រល់ - ជិះកប៉ាល់ល្បឿនលឿនមកកំពត - រថយន្ត VIP ត្រឡប់មកភ្នំពេញ',
      titleEn: 'Phu Quoc - International High-Speed Ferry to Kampot - Return to Phnom Penh',
      description: 'ជិះកប៉ាល់ល្បឿនលឿន (Speed Ferry) ពីកោះត្រល់ មកកាន់កំពង់ផែអន្តរជាតិកំពត។ រថយន្តក្រុង VIP ទទួល និងជូនដំណើរត្រឡប់មកកាន់រាជធានីភ្នំពេញដោយសុវត្ថិភាព។',
      descriptionKm: 'ជិះកប៉ាល់ល្បឿនលឿន (Speed Ferry) ពីកោះត្រល់ មកកាន់កំពង់ផែអន្តរជាតិកំពត។ រថយន្តក្រុង VIP ទទួល និងជូនដំណើរត្រឡប់មកកាន់រាជធានីភ្នំពេញដោយសុវត្ថិភាព។',
      descriptionEn: 'Board the international high-speed passenger ferry from Phu Quoc Island to Kampot International Port. Savor a farewell lunch at Kampot riverside followed by comfortable VIP coach transit back to Phnom Penh.',
      hotelName: 'Trip Completion (Phnom Penh Arrival)',
      hotelNameKm: 'បញ្ចប់ដំណើរបេសកកម្ម (មកដល់ភ្នំពេញ)',
      hotelNameEn: 'Mission Completion (Arrival in Phnom Penh)',
      mealsIncluded: ['Breakfast', 'Farewell Lunch'],
      mealsIncludedKm: ['អាហារពេលព្រឹកនៅរីសត', 'អាហារថ្ងៃត្រង់លាគ្នានៅកំពត'],
      mealsIncludedEn: ['Resort Breakfast', 'Kampot Riverside Farewell Lunch'],
      guideAgenda: [
        {
          time: '07:00 AM - 08:30 AM',
          activity: 'អាហារពេលព្រឹកនៅរីសត & ឆែកអោត',
          activityKm: 'អាហារពេលព្រឹកនៅរីសត & ឆែកអោត',
          activityEn: 'Resort Breakfast & Morning Checkout',
          location: 'Resort Dining',
          locationKm: 'ភោជនីយដ្ឋានរីសត',
          locationEn: 'Resort Dining Room'
        },
        {
          time: '09:00 AM - 11:00 AM',
          activity: 'ជិះកប៉ាល់ល្បឿនលឿនពីកោះត្រល់ មកកាន់កំពង់ផែអន្តរជាតិខេត្តកំពត',
          activityKm: 'ជិះកប៉ាល់ល្បឿនលឿនពីកោះត្រល់ មកកាន់កំពង់ផែអន្តរជាតិខេត្តកំពត',
          activityEn: 'High-Speed International Ferry Cruise: Phu Quoc to Kampot Port',
          location: 'Phu Quoc Port -> Kampot International Port',
          locationKm: 'កំពង់ផែកោះត្រល់ -> កំពង់ផែអន្តរជាតិកំពត',
          locationEn: 'Phu Quoc Port -> Kampot International Port',
          notes: 'សំបុត្រកប៉ាល់ត្រូវបានរួមបញ្ចូលរួចជាស្រេច',
          notesKm: 'សំបុត្រកប៉ាល់ត្រូវបានរួមបញ្ចូលរួចជាស្រេច',
          notesEn: 'Reserved seating fast ferry tickets included'
        },
        {
          time: '11:30 AM - 01:00 PM',
          activity: 'ទទួលទានអាហារថ្ងៃត្រង់លាគ្នាពិសេសនៅខេត្តកំពត (Kampot Famous Seafood & Pepper Dishes)',
          activityKm: 'ទទួលទានអាហារថ្ងៃត្រង់លាគ្នាពិសេសនៅខេត្តកំពត (Kampot Famous Seafood & Pepper Dishes)',
          activityEn: 'Executive Farewell Lunch at Kampot Riverside (Kampot Pepper Specialties)',
          location: 'Kampot Riverside',
          locationKm: 'មាត់ព្រែកខេត្តកំពត',
          locationEn: 'Kampot Riverside Restaurant'
        },
        {
          time: '01:30 PM - 04:30 PM',
          activity: 'រថយន្ត VIP ជូនដំណើរត្រឡប់មកកាន់រាជធានីភ្នំពេញ',
          activityKm: 'រថយន្ត VIP ជូនដំណើរត្រឡប់មកកាន់រាជធានីភ្នំពេញ',
          activityEn: 'VIP Coach Transit back to Phnom Penh (National Road 3)',
          location: 'National Road 3 -> Phnom Penh',
          locationKm: 'ផ្លូវជាតិលេខ ៣ -> រាជធានីភ្នំពេញ',
          locationEn: 'National Road 3 -> Phnom Penh',
          notes: 'បញ្ចប់បេសកកម្មពាណិជ្ជកម្មដោយជោគជ័យ',
          notesKm: 'បញ្ចប់បេសកកម្មពាណិជ្ជកម្មដោយជោគជ័យ',
          notesEn: 'Mission completed successfully. Safe arrival in Phnom Penh.'
        }
      ]
    }
  ]
};

export const CANTON_FAIR_PHASE_1_PACKAGE: TourPackage = {
  id: 'pkg_canton_fair_phase_1_2026',
  status: 'active',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  version: 1,
  isCantonFair: true,
  cantonFairPhase: 'Phase 1',
  title: 'បេសកកម្មពាណិជ្ជកម្មក្វាងចូវ Canton Fair 2026 (Phase 1): អេឡិចត្រូនិក គ្រឿងម៉ាស៊ីន ឧបករណ៍ជាង សម្ភារៈសំណង់ & ថាមពលបៃតង',
  titleKm: 'បេសកកម្មពាណិជ្ជកម្មក្វាងចូវ Canton Fair 2026 (Phase 1): អេឡិចត្រូនិក គ្រឿងម៉ាស៊ីន ឧបករណ៍ជាង សម្ភារៈសំណង់ & ថាមពលបៃតង',
  titleEn: 'Guangzhou Canton Fair 2026 (Phase 1): Electronics, Industrial Machinery, Hardware, Building Materials & Clean Energy',
  destination: 'ក្វាងចូវ + ហ្វូសាន (Guangzhou & Foshan, China)',
  destinationKm: 'ក្វាងចូវ + ហ្វូសាន (Guangzhou & Foshan)',
  destinationEn: 'Guangzhou & Foshan, China',
  country: 'China',
  countryKm: 'ប្រទេសចិន (China)',
  countryEn: 'China',
  category: 'canton_fair',
  categoryKm: 'ពិព័រណ៍ក្វាងចូវ Canton Fair (Phase 1)',
  categoryEn: 'Canton Fair 2026 (Phase 1)',
  durationDays: 6,
  durationNights: 5,
  priceUSD: 1280,
  discountPriceUSD: 1099,
  rating: 5.0,
  reviewCount: 48,
  bookedThisMonth: 26,
  availableDates: ['2026-10-15', '2026-10-16', '2026-10-17', '2026-10-18', '2026-10-19'],
  flightIncluded: true,
  hotelStars: 5,
  featuredVideoUrl: 'https://www.youtube.com/watch?v=7WT_2bB_w4o',
  videos: [
    {
      id: 'vid_canton_fair_tour',
      title: 'The 140th Canton Fair Pazhou Complex Walkthrough & Guide',
      titleKm: 'ទិដ្ឋភាពទូទៅនៃសាលពិព័រណ៍ក្វាងចូវ Canton Fair Pazhou Complex',
      titleEn: 'The 140th Canton Fair Pazhou Complex Walkthrough & Guide',
      url: 'https://www.youtube.com/watch?v=7WT_2bB_w4o',
      duration: '04:15',
      thumbnailUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
      isFeatured: true
    },
    {
      id: 'vid_foshan_factory',
      title: 'Foshan Smart Electronics & Industrial Automation Hub Tour',
      titleKm: 'ដំណើរទស្សនកិច្ចរោងចក្រស្វ័យប្រវត្តិកម្ម និងគ្រឿងអេឡិចត្រូនិក Foshan',
      titleEn: 'Foshan Smart Electronics & Industrial Automation Hub Tour',
      url: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
      duration: '03:10',
      thumbnailUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80',
      isFeatured: false
    }
  ],
  coordinates: {
    lat: 23.1291,
    lng: 113.2644,
    mapX: 82,
    mapY: 48
  },
  images: [
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=1200&auto=format&fit=crop&q=80'
  ],
  description: 'បេសកកម្មពាណិជ្ជកម្មផ្លូវការទៅកាន់ពិព័រណ៍ក្វាងចូវ Canton Fair 2026 (Phase 1) ផ្តោតសំខាន់លើ៖ គ្រឿងអេឡិចត្រូនិកទំនើប គ្រឿងម៉ាស៊ីនឧស្សាហកម្ម ឧបករណ៍ជាង សម្ភារៈសំណង់ ភ្លើងបំភ្លឺ LED គ្រឿងបន្លាស់យានយន្ត និងបច្ចេកវិទ្យាថាមពលកកើតឡើងវិញ។ រួមបញ្ចូលសេវាធ្វើកាត Buyer Badge ចូល Pazhou Complex អ្នកបកប្រែផ្ទាល់ខ្លួន សណ្ឋាគារផ្កាយ ៥ និងដំណើរទស្សនកិច្ចរោងចក្រស្វ័យប្រវត្តិកម្មនៅ Foshan/Dongguan។',
  descriptionKm: 'បេសកកម្មពាណិជ្ជកម្មផ្លូវការទៅកាន់ពិព័រណ៍ក្វាងចូវ Canton Fair 2026 (Phase 1) ផ្តោតសំខាន់លើ៖ គ្រឿងអេឡិចត្រូនិកទំនើប គ្រឿងម៉ាស៊ីនឧស្សាហកម្ម ឧបករណ៍ជាង សម្ភារៈសំណង់ ភ្លើងបំភ្លឺ LED គ្រឿងបន្លាស់យានយន្ត និងបច្ចេកវិទ្យាថាមពលកកើតឡើងវិញ។ រួមបញ្ចូលសេវាធ្វើកាត Buyer Badge ចូល Pazhou Complex អ្នកបកប្រែផ្ទាល់ខ្លួន សណ្ឋាគារផ្កាយ ៥ និងដំណើរទស្សនកិច្ចរោងចក្រស្វ័យប្រវត្តិកម្មនៅ Foshan/Dongguan។',
  descriptionEn: 'Official high-level B2B trade delegation to the 140th Canton Fair Phase 1 (Guangzhou, China). Focuses on Consumer Electronics, Industrial Machinery, Hardware Tools, Building Materials, Lighting, Automotive, and Green Energy. Features official Pazhou Complex VIP Buyer Badge registration, trilingual commercial interpreters (Khmer/Chinese/English), 5-star hotel in Tianhe/Pazhou, factory walkthroughs in Foshan, and roundtrip international flights from Phnom Penh.',
  highlights: [
    '🏢 ចូលរួមពិព័រណ៍ពាណិជ្ជកម្មពិភពលោកធំបំផុត Canton Fair 2026 (Phase 1) នៅ Pazhou Complex',
    '⚙️ ស្វែងរកប្រភពនាំចូលផ្ទាល់ពីរោងចក្រ៖ អេឡិចត្រូនិក គ្រឿងម៉ាស៊ីន សម្ភារៈសំណង់ និងថាមពលពន្លឺព្រះអាទិត្យ Solar',
    '🪪 សម្រួលបែបបទធ្វើកាត Buyer Badge ផ្លូវការ & VIP Fast-Track ចូលសាលពិព័រណ៍',
    '🗣️ ផ្តល់ជូនអ្នកបកប្រែចិន-ខ្មែរ-អង់គ្លេស ជួយចរចាតម្លៃ និងចុះកិច្ចសន្យាពាណិជ្ជកម្មផ្ទាល់',
    '🏭 ទស្សនកិច្ចសិក្សារោងចក្រផលិត និងមជ្ឈមណ្ឌលលក់ដុំគ្រឿងបន្លាស់ធំៗនៅ Foshan & Dongguan',
    '✈️ រួមបញ្ចូលសំបុត្រយន្តហោះទៅ-មក ភ្នំពេញ-ក្វាងចូវ + សណ្ឋាគារ ៥ ផ្កាយ ៥ យប់'
  ],
  highlightsKm: [
    '🏢 ចូលរួមពិព័រណ៍ពាណិជ្ជកម្មពិភពលោកធំបំផុត Canton Fair 2026 (Phase 1) នៅ Pazhou Complex',
    '⚙️ ស្វែងរកប្រភពនាំចូលផ្ទាល់ពីរោងចក្រ៖ អេឡិចត្រូនិក គ្រឿងម៉ាស៊ីន សម្ភារៈសំណង់ និងថាមពលពន្លឺព្រះអាទិត្យ Solar',
    '🪪 សម្រួលបែបបទធ្វើកាត Buyer Badge ផ្លូវការ & VIP Fast-Track ចូលសាលពិព័រណ៍',
    '🗣️ ផ្តល់ជូនអ្នកបកប្រែចិន-ខ្មែរ-អង់គ្លេស ជួយចរចាតម្លៃ និងចុះកិច្ចសន្យាពាណិជ្ជកម្មផ្ទាល់',
    '🏭 ទស្សនកិច្ចសិក្សារោងចក្រផលិត និងមជ្ឈមណ្ឌលលក់ដុំគ្រឿងបន្លាស់ធំៗនៅ Foshan & Dongguan',
    '✈️ រួមបញ្ចូលសំបុត្រយន្តហោះទៅ-មក ភ្នំពេញ-ក្វាងចូវ + សណ្ឋាគារ ៥ ផ្កាយ ៥ យប់'
  ],
  highlightsEn: [
    '🏢 Direct VIP access to the world-renowned Canton Fair Phase 1 at the China Import and Export Fair Complex (Pazhou)',
    '⚙️ Direct factory sourcing for Electronics, Smart Appliances, Industrial Machinery, Hardware, and Solar Energy Tech',
    '🪪 Complete Official Buyer Badge application & expedited on-site registration assistance',
    '🗣️ Trilingual interpreters (Khmer, Mandarin Chinese, English) for private contract negotiations',
    '🏭 Exclusive industrial plant walkthroughs and wholesale hub inspections in Foshan & Dongguan',
    '✈️ Roundtrip flights Phnom Penh to Guangzhou + 5-Star luxury hotel accommodations (5 Nights)'
  ],
  whoShouldJoin: [
    '📱 អ្នកនាំចូល និងចែកចាយគ្រឿងអេឡិចត្រូនិក គ្រឿងបន្លាស់ និងបរិក្ខារ Smart Home (Electronics & Smart Home Importers)',
    '🏗️ អ្នកម៉ៅការសំណង់ វិស្វករ និងម្ចាស់គម្រោងអភិវឌ្ឍន៍អចលនទ្រព្យ (Contractors & Project Developers)',
    '⚙️ ម្ចាស់រោងចក្រ និងសហគ្រាសឧស្សាហកម្មដែលត្រូវការគ្រឿងម៉ាស៊ីនស្វ័យប្រវត្តិកម្ម (Factory Owners & Automation Procurement)',
    '☀️ សហគ្រិនក្នុងវិស័យថាមពលពន្លឺព្រះអាទិត្យ អាគុយផ្ទុក និងគ្រឿងបន្លាស់ EV (Solar Energy & EV Infrastructure)',
    '🔧 អ្នកលក់ដុំ និងរាយឧបករណ៍ជាង គ្រឿងសំណង់ និងឧបករណ៍អគ្គិសនី (Hardware & Construction Material Wholesalers)'
  ],
  whoShouldJoinKm: [
    '📱 អ្នកនាំចូល និងចែកចាយគ្រឿងអេឡិចត្រូនិក គ្រឿងបន្លាស់ និងបរិក្ខារ Smart Home (Electronics & Smart Home Importers)',
    '🏗️ អ្នកម៉ៅការសំណង់ វិស្វករ និងម្ចាស់គម្រោងអភិវឌ្ឍន៍អចលនទ្រព្យ (Contractors & Project Developers)',
    '⚙️ ម្ចាស់រោងចក្រ និងសហគ្រាសឧស្សាហកម្មដែលត្រូវការគ្រឿងម៉ាស៊ីនស្វ័យប្រវត្តិកម្ម (Factory Owners & Automation Procurement)',
    '☀️ សហគ្រិនក្នុងវិស័យថាមពលពន្លឺព្រះអាទិត្យ អាគុយផ្ទុក និងគ្រឿងបន្លាស់ EV (Solar Energy & EV Infrastructure)',
    '🔧 អ្នកលក់ដុំ និងរាយឧបករណ៍ជាង គ្រឿងសំណង់ និងឧបករណ៍អគ្គិសនី (Hardware & Construction Material Wholesalers)'
  ],
  whoShouldJoinEn: [
    '📱 Consumer Electronics, Mobile Accessories & Smart Home Appliance Importers',
    '🏗️ General Contractors, Construction Project Managers & Electrical Engineers',
    '⚙️ Industrial Plant Owners & Automation Machinery Procurement Officers',
    '☀️ Renewable Solar Energy, Inverters, Battery Storage & EV Infrastructure Suppliers',
    '🔧 Hardware, Power Tools & Building Materials Wholesale Distributors'
  ],
  whyShouldJoin: [
    '🏭 ទាក់ទងដោយផ្ទាល់ជាមួយរោងចក្រដើមនៅក្វាងចូវ សិនជិន និងហ្វូសាន ដោយគ្មានឈ្មួញកណ្តាល (Zero Middleman Factory Direct Pricing)',
    '🪪 ទទួលបានកាត Buyer Badge ផ្លូវការដោយរហ័ស មិនបាច់តម្រង់ជួរ និងមានអ្នកបកប្រែចិន-ខ្មែរ ជួយចរចាតម្លៃ (Fast VIP Badge & Chinese Interpreter)',
    '🔍 ទស្សនាក្នុងទីតាំងរោងចក្រជាក់ស្តែងនៅទីក្រុង Foshan និងផ្សារបោះដុំគ្រឿងអេឡិចត្រូនិកធំៗ (On-Site Factory Inspections & Wholesale Hubs)',
    '📦 ការប្រឹក្សាអំពីនីតិវិធីដឹកជញ្ជូន ភស្តុភារ និងពន្ធគយនាំចូលមកកម្ពុជាច្បាស់លាស់ (Customs & Shipping Consultation)',
    '🌟 ការធ្វើដំណើរលំដាប់ VIP សណ្ឋាគារផ្កាយ ៥ និងបណ្តាញទំនាក់ទំនងជាមួយគណៈប្រតិភូវិនិយោគិនកម្ពុជា (5-Star Luxury VIP Experience & Elite Peer Network)'
  ],
  whyShouldJoinKm: [
    '🏭 ទាក់ទងដោយផ្ទាល់ជាមួយរោងចក្រដើមនៅក្វាងចូវ សិនជិន និងហ្វូសាន ដោយគ្មានឈ្មួញកណ្តាល (Zero Middleman Factory Direct Pricing)',
    '🪪 ទទួលបានកាត Buyer Badge ផ្លូវការដោយរហ័ស មិនបាច់តម្រង់ជួរ និងមានអ្នកបកប្រែចិន-ខ្មែរ ជួយចរចាតម្លៃ (Fast VIP Badge & Chinese Interpreter)',
    '🔍 ទស្សនាក្នុងទីតាំងរោងចក្រជាក់ស្តែងនៅទីក្រុង Foshan និងផ្សារបោះដុំគ្រឿងអេឡិចត្រូនិកធំៗ (On-Site Factory Inspections & Wholesale Hubs)',
    '📦 ការប្រឹក្សាអំពីនីតិវិធីដឹកជញ្ជូន ភស្តុភារ និងពន្ធគយនាំចូលមកកម្ពុជាច្បាស់លាស់ (Customs & Shipping Consultation)',
    '🌟 ការធ្វើដំណើរលំដាប់ VIP សណ្ឋាគារផ្កាយ ៥ និងបណ្តាញទំនាក់ទំនងជាមួយគណៈប្រតិភូវិនិយោគិនកម្ពុជា (5-Star Luxury VIP Experience & Elite Peer Network)'
  ],
  whyShouldJoinEn: [
    '🏭 Direct OEM/ODM procurement contracts with certified mega-manufacturers across Guangzhou, Shenzhen, and Foshan',
    '🪪 Official Canton Fair VIP Buyer Badge pre-issuance with zero queueing and dedicated trilingual translator assistance',
    '🔍 Exclusive guided technical tours to Foshan building materials production lines and Dashatou electronics wholesale hubs',
    '📦 Expert guidance on Cambodia import tariffs, customs clearance, shipping container logistics, and certificate of origin (CO)',
    '🌟 All-inclusive 5-star Marriott Pazhou accommodation, round-trip flights, and private executive business networking'
  ],
  inclusions: [
    'សំបុត្រយន្តហោះទៅ-មក ភ្នំពេញ - ក្វាងចូវ (Roundtrip Flight PNH - CAN)',
    'សណ្ឋាគារប្រណិតកម្រិត ៥ ផ្កាយ (៥ យប់ នៅក្រុងក្វាងចូវ)',
    'សេវាបំពេញបែបបទ និងទទួលកាត Buyer Badge ផ្លូវការចូល Canton Fair',
    'រថយន្តក្រុង VIP ជូនដំណើរពេញដំណើរកម្សាន្ត និងទៅ Pazhou Complex រាល់ថ្ងៃ',
    'អាហារប៊ូហ្វេពេលព្រឹក និងអាហារពេលល្ងាចម្ហូបក្វាងទុងពិសេស (Guangdong Banquets)',
    'មគ្គុទ្ទេសក៍ទេសចរណ៍ និងអ្នកបកប្រែភាសាចិន-ខ្មែរ ជំនាញចរចាពាណិជ្ជកម្ម',
    'ធានារ៉ាប់រងការធ្វើដំណើរបេសកកម្មអន្តរជាតិ (International Travel Insurance)'
  ],
  inclusionsKm: [
    'សំបុត្រយន្តហោះទៅ-មក ភ្នំពេញ - ក្វាងចូវ (Roundtrip Flight PNH - CAN)',
    'សណ្ឋាគារប្រណិតកម្រិត ៥ ផ្កាយ (៥ យប់ នៅក្រុងក្វាងចូវ)',
    'សេវាបំពេញបែបបទ និងទទួលកាត Buyer Badge ផ្លូវការចូល Canton Fair',
    'រថយន្តក្រុង VIP ជូនដំណើរពេញដំណើរកម្សាន្ត និងទៅ Pazhou Complex រាល់ថ្ងៃ',
    'អាហារប៊ូហ្វេពេលព្រឹក និងអាហារពេលល្ងាចម្ហូបក្វាងទុងពិសេស (Guangdong Banquets)',
    'មគ្គុទ្ទេសក៍ទេសចរណ៍ និងអ្នកបកប្រែភាសាចិន-ខ្មែរ ជំនាញចរចាពាណិជ្ជកម្ម',
    'ធានារ៉ាប់រងការធ្វើដំណើរបេសកកម្មអន្តរជាតិ (International Travel Insurance)'
  ],
  inclusionsEn: [
    'Roundtrip International Flights: Phnom Penh (PNH) to Guangzhou (CAN) with luggage allowance',
    '5-Star Luxury Accommodations in Guangzhou (5 Nights in Pazhou/Tianhe District)',
    'Official Canton Fair Phase 1 VIP Buyer Badge processing & access badge',
    'Dedicated VIP air-conditioned coach transfers for all daily scheduled trips',
    'Daily Hotel Buffet Breakfasts & Authentic Cantonese Banquets',
    'Trilingual Commercial Business Interpreters (Khmer, Mandarin Chinese, English)',
    'Comprehensive International Business Travel & Medical Insurance Coverage'
  ],
  exclusions: [
    'ទិដ្ឋាការចូលប្រទេសចិន China Visa Fee (KHB ជួយរៀបចំឯកសារអញ្ជើញ Official Invitation Letter)',
    'ការចំណាយផ្ទាល់ខ្លួនក្រៅពីកម្មវិធី និងទម្ងន់វ៉ាលីសលើសកំណត់',
    'ថ្លៃដឹកជញ្ជូនទំនិញគំរូ ឬការកុម្ម៉ង់ទិញទំនិញផ្ទាល់ខ្លួន'
  ],
  exclusionsKm: [
    'ទិដ្ឋាការចូលប្រទេសចិន China Visa Fee (KHB ជួយរៀបចំឯកសារអញ្ជើញ Official Invitation Letter)',
    'ការចំណាយផ្ទាល់ខ្លួនក្រៅពីកម្មវិធី និងទម្ងន់វ៉ាលីសលើសកំណត់',
    'ថ្លៃដឹកជញ្ជូនទំនិញគំរូ ឬការកុម្ម៉ង់ទិញទំនិញផ្ទាល់ខ្លួន'
  ],
  exclusionsEn: [
    'China Entry Visa processing fee (KHB provides Official Invitation Letter)',
    'Personal expenditures (souvenirs, private laundry, telecommunications, minibar)',
    'International freight or commercial sample cargo shipping fees'
  ],
  termsAndConditions: [
    'លិខិតឆ្លងដែន Passport ត្រូវមានសុពលភាពយ៉ាងតិច ៦ ខែគិតចាប់ពីថ្ងៃចេញដំណើរ។',
    'តម្រូវឱ្យកក់ប្រាក់កក់ចំនួន 50% នៅពេលចុះឈ្មោះដើម្បីធានាសំបុត្រយន្តហោះ និងសណ្ឋាគារ ៥ ផ្កាយ។',
    'KHB នឹងចេញលិខិតអញ្ជើញពាណិជ្ជកម្មផ្លូវការ (Official Canton Fair Invitation) សម្រាប់ធ្វើ Visa ចិន។',
    'ឈប់ទទួលចុះឈ្មោះមុនថ្ងៃទី 20 ខែកញ្ញា ឆ្នាំ 2026 ឬនៅពេលគ្រប់ចំនួនគណៈប្រតិភូ 25 នាក់។'
  ],
  termsAndConditionsKm: [
    'លិខិតឆ្លងដែន Passport ត្រូវមានសុពលភាពយ៉ាងតិច ៦ ខែគិតចាប់ពីថ្ងៃចេញដំណើរ។',
    'តម្រូវឱ្យកក់ប្រាក់កក់ចំនួន 50% នៅពេលចុះឈ្មោះដើម្បីធានាសំបុត្រយន្តហោះ និងសណ្ឋាគារ ៥ ផ្កាយ។',
    'KHB នឹងចេញលិខិតអញ្ជើញពាណិជ្ជកម្មផ្លូវការ (Official Canton Fair Invitation) សម្រាប់ធ្វើ Visa ចិន។',
    'ឈប់ទទួលចុះឈ្មោះមុនថ្ងៃទី 20 ខែកញ្ញា ឆ្នាំ 2026 ឬនៅពេលគ្រប់ចំនួនគណៈប្រតិភូ 25 នាក់។'
  ],
  termsAndConditionsEn: [
    'Passport must maintain a minimum validity of 6 months from the date of departure.',
    'A 50% initial deposit is required upon delegate registration to secure 5-star hotel & flights.',
    'KHB Events issues official corporate invitation letters for Chinese commercial visa applications.',
    'Registration closes September 20, 2026 or upon reaching the maximum capacity of 25 delegates.'
  ],
  tags: ['trending', 'popular', 'luxury'],
  emergencyContact: {
    country: 'China (Guangzhou & Guangdong Province)',
    police: '110',
    ambulance: '120',
    touristHelpline: '060 815 515 (Mr. Tim Vutha / KHB China Escort)',
    embassySupport: '+86 20 8384 9400 (Royal Consulate General of Cambodia in Guangzhou)'
  },
  tourGuide: {
    name: 'Mr. Tim Vutha & China Operations Escort Team',
    nameKm: 'លោក ទឹម វុទ្ធា & ក្រុមការងារសម្របសម្រួលចិន',
    nameEn: 'Mr. Tim Vutha & China Operations Escort Team',
    title: 'Lead Trade Mission Director (Cambodia-China Trade)',
    titleKm: 'ប្រធានដឹកនាំបេសកកម្មពាណិជ្ជកម្ម (កម្ពុជា-ចិន)',
    titleEn: 'Lead Trade Mission Director (Cambodia-China Trade)',
    phone: '060 815 515',
    telegram: 'https://t.me/VuthaTim',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    badgeNumber: 'KHB-CANTON-2026-01',
    bio: 'Experienced bilateral trade specialist with over 10 years leading Cambodian business delegations to Guangzhou, Shenzhen, and Yiwu. Directly assists delegates with factory verifications and customs tariffs.',
    bioKm: 'អ្នកជំនាញសម្របសម្រួលពាណិជ្ជកម្មទ្វេភាគីជាមួយបទពិសោធន៍ជាង ១០ ឆ្នាំ ដឹកនាំគណៈប្រតិភូធុរកិច្ចកម្ពុជាទៅកាន់ទីក្រុងក្វាងចូវ សិនជិន និងយីអ៊ូ។ ជួយគណៈប្រតិភូក្នុងការផ្ទៀងផ្ទាត់រោងចក្រ និងពន្ធគយ។',
    bioEn: 'Experienced bilateral trade specialist with over 10 years leading Cambodian business delegations to Guangzhou, Shenzhen, and Yiwu. Directly assists delegates with factory verifications and customs tariffs.',
    languages: ['Khmer', 'Chinese (Mandarin)', 'English'],
    briefingMeetingPoint: 'Phnom Penh International Airport (PNH) International Departure Gate - KHB VIP Desk',
    briefingMeetingPointKm: 'ព្រលានយន្តហោះអន្តរជាតិភ្នំពេញ (PNH) ច្រកចេញដំណើរអន្តរជាតិ - បញ្ជរ KHB VIP',
    briefingMeetingPointEn: 'Phnom Penh International Airport (PNH) International Departure Gate - KHB VIP Desk',
    briefingTime: '07:30 AM (Oct 15, 2026)',
    briefingTimeKm: '07:30 AM (ថ្ងៃទី 15/10/2026)',
    briefingTimeEn: '07:30 AM (Oct 15, 2026)'
  },
  itinerary: [
    {
      day: 1,
      title: 'ភ្នំពេញ - ហោះហើរទៅកាន់ក្វាងចូវ (CAN) - ទទួលកាត Buyer Badge & ពិធីស្វាគមន៍គណៈប្រតិភូ',
      titleKm: 'ភ្នំពេញ - ហោះហើរទៅកាន់ក្វាងចូវ (CAN) - ទទួលកាត Buyer Badge & ពិធីស្វាគមន៍គណៈប្រតិភូ',
      titleEn: 'Phnom Penh to Guangzhou (CAN) - VIP Buyer Badge Issuance & Welcome Delegation Gala',
      description: 'ហោះហើរពីរាជធានីភ្នំពេញទៅកាន់អាកាសយានដ្ឋានអន្តរជាតិ Guangzhou Baiyun (CAN)។ រថយន្ត VIP ទទួល និងសម្រួលការធ្វើកាត Buyer Badge ផ្លូវការ ចូលឆែកអ៊ីនសណ្ឋាគារ ៥ ផ្កាយ និងពិសារអាហារពេលល្ងាចស្វាគមន៍បែបក្វាងទុង។',
      descriptionKm: 'ហោះហើរពីរាជធានីភ្នំពេញទៅកាន់អាកាសយានដ្ឋានអន្តរជាតិ Guangzhou Baiyun (CAN)។ រថយន្ត VIP ទទួល និងសម្រួលការធ្វើកាត Buyer Badge ផ្លូវការ ចូលឆែកអ៊ីនសណ្ឋាគារ ៥ ផ្កាយ និងពិសារអាហារពេលល្ងាចស្វាគមន៍បែបក្វាងទុង។',
      descriptionEn: 'Direct international flight from Phnom Penh to Guangzhou Baiyun International Airport (CAN). VIP coach transfer, official Canton Fair Buyer Badge expedited processing, 5-star hotel check-in, and Grand Cantonese Welcome Banquet.',
      hotelName: 'Guangzhou Marriott Pazhou / Crowne Plaza (5-Star)',
      hotelNameKm: 'សណ្ឋាគារ Guangzhou Marriott Pazhou / Crowne Plaza (កម្រិត ៥ ផ្កាយ)',
      hotelNameEn: 'Guangzhou Marriott Pazhou / Crowne Plaza (5-Star Luxury)',
      mealsIncluded: ['Breakfast', 'Welcome Banquet'],
      mealsIncludedKm: ['អាហារពេលព្រឹក', 'ពិធីលៀងសាយភាយស្វាគមន៍'],
      mealsIncludedEn: ['In-Flight / Hotel Breakfast', 'Grand Cantonese Welcome Gala Banquet'],
      guideAgenda: [
        { time: '07:30 AM - 09:30 AM', activity: 'ជួបជុំគណៈប្រតិភូនៅព្រលានយន្តហោះភ្នំពេញ & ចែកឯកសារបេសកកម្ម', activityKm: 'ជួបជុំគណៈប្រតិភូនៅព្រលានយន្តហោះភ្នំពេញ & ចែកឯកសារបេសកកម្ម', activityEn: 'Delegation Assembly at Phnom Penh Airport & Mission Dossier Distribution', location: 'Phnom Penh International Airport', locationKm: 'ព្រលានយន្តហោះអន្តរជាតិភ្នំពេញ', locationEn: 'Phnom Penh International Airport' },
        { time: '10:15 AM - 02:00 PM', activity: 'ជើងហោះហើរត្រង់ ភ្នំពេញ ទៅ ក្វាងចូវ (PNH -> CAN)', activityKm: 'ជើងហោះហើរត្រង់ ភ្នំពេញ ទៅ ក្វាងចូវ (PNH -> CAN)', activityEn: 'Direct Flight: Phnom Penh (PNH) to Guangzhou Baiyun (CAN)', location: 'Flight PNH -> CAN', locationKm: 'ជើងហោះហើរ PNH -> CAN', locationEn: 'Flight PNH -> CAN' },
        { time: '03:30 PM - 05:30 PM', activity: 'សម្រួលបែបបទទទួលកាត VIP Buyer Badge ចូល Pazhou Complex & ឆែកអ៊ីនសណ្ឋាគារ', activityKm: 'សម្រួលបែបបទទទួលកាត VIP Buyer Badge ចូល Pazhou Complex & ឆែកអ៊ីនសណ្ឋាគារ', activityEn: 'VIP Fast-Track Canton Fair Badge Pickup & 5-Star Hotel Check-in', location: 'Canton Fair Buyer Registration Center', locationKm: 'មជ្ឈមណ្ឌលធ្វើកាត Canton Fair', locationEn: 'Canton Fair Buyer Registration Center' },
        { time: '06:30 PM - 09:00 PM', activity: 'ពិធីលៀងសាយភាយស្វាគមន៍គណៈប្រតិភូកម្ពុជា Welcome Gala Dinner', activityKm: 'ពិធីលៀងសាយភាយស្វាគមន៍គណៈប្រតិភូកម្ពុជា Welcome Gala Dinner', activityEn: 'Official Welcome Gala Dinner & Bilateral Trade Networking', location: 'Hotel Grand Ballroom', locationKm: 'សាលពិធីធំសណ្ឋាគារ', locationEn: 'Hotel Grand Ballroom' }
      ]
    },
    {
      day: 2,
      title: 'Canton Fair Phase 1 (ថ្ងៃទី ១): អេឡិចត្រូនិក គ្រឿងម៉ាស៊ីន និងបច្ចេកវិទ្យាស្វ័យប្រវត្តិកម្ម',
      titleKm: 'Canton Fair Phase 1 (ថ្ងៃទី ១): អេឡិចត្រូនិក គ្រឿងម៉ាស៊ីន និងបច្ចេកវិទ្យាស្វ័យប្រវត្តិកម្ម',
      titleEn: 'Canton Fair Phase 1 (Day 1): Consumer Electronics, Heavy Machinery & Automation Tech',
      description: 'ពេញមួយថ្ងៃនៅសាលពិព័រណ៍ Pazhou Complex (Area A & B) ជួបម្ចាស់រោងចក្រផលិតឧបករណ៍អេឡិចត្រូនិក គ្រឿងម៉ាស៊ីនឧស្សាហកម្មធុនធ្ងន់ និងបច្ចេកវិទ្យា AI Automation។',
      descriptionKm: 'ពេញមួយថ្ងៃនៅសាលពិព័រណ៍ Pazhou Complex (Area A & B) ជួបម្ចាស់រោងចក្រផលិតឧបករណ៍អេឡិចត្រូនិក គ្រឿងម៉ាស៊ីនឧស្សាហកម្មធុនធ្ងន់ និងបច្ចេកវិទ្យា AI Automation។',
      descriptionEn: 'Full-day VIP exploration across Pazhou Complex Areas A & B. Meet premier manufacturers of consumer electronics, smart appliances, industrial automation, and power equipment.',
      hotelName: 'Guangzhou Marriott Pazhou (5-Star)',
      hotelNameKm: 'សណ្ឋាគារ Guangzhou Marriott Pazhou (កម្រិត ៥ ផ្កាយ)',
      hotelNameEn: 'Guangzhou Marriott Pazhou (5-Star Luxury)',
      mealsIncluded: ['Buffet Breakfast', 'VIP Networking Lunch', 'Dinner'],
      mealsIncludedKm: ['អាហារពេលព្រឹកប៊ូហ្វេ', 'អាហារថ្ងៃត្រង់ VIP', 'អាហារពេលល្ងាច'],
      mealsIncludedEn: ['Hotel Buffet Breakfast', 'VIP Business Networking Lunch', 'Cantonese Dinner'],
      guideAgenda: [
        { time: '08:30 AM - 09:00 AM', activity: 'រថយន្ត VIP ជូនគណៈប្រតិភូទៅកាន់ Pazhou Complex', activityKm: 'រថយន្ត VIP ជូនគណៈប្រតិភូទៅកាន់ Pazhou Complex', activityEn: 'VIP Coach Transfer from Hotel to Pazhou Complex', location: 'Hotel to Pazhou Complex', locationKm: 'សណ្ឋាគារ ទៅ Pazhou Complex', locationEn: 'Hotel to Pazhou Complex' },
        { time: '09:00 AM - 12:30 PM', activity: 'ទស្សនា Hall 1-5: គ្រឿងអេឡិចត្រូនិក ឧបករណ៍ប្រើប្រាស់ និងប្រព័ន្ធ Smart Home', activityKm: 'ទស្សនា Hall 1-5: គ្រឿងអេឡិចត្រូនិក ឧបករណ៍ប្រើប្រាស់ និងប្រព័ន្ធ Smart Home', activityEn: 'Hall 1-5 Inspection: Consumer Electronics, Gadgets & Smart Home Ecosystems', location: 'Pazhou Complex Area A', locationKm: 'Pazhou Complex តំបន់ A', locationEn: 'Pazhou Complex Area A' },
        { time: '12:30 PM - 01:30 PM', activity: 'អាហារថ្ងៃត្រង់បណ្តាញពាណិជ្ជកម្ម VIP', activityKm: 'អាហារថ្ងៃត្រង់បណ្តាញពាណិជ្ជកម្ម VIP', activityEn: 'VIP Lounge Executive Business Networking Lunch', location: 'VIP Hall Restaurant', locationKm: 'ភោជនីយដ្ឋាន VIP សាលពិព័រណ៍', locationEn: 'VIP Hall Restaurant' },
        { time: '01:30 PM - 05:30 PM', activity: 'ទស្សនា Hall 6-8: គ្រឿងម៉ាស៊ីនឧស្សាហកម្ម និងឧបករណ៍កែច្នៃស្វ័យប្រវត្តិកម្ម', activityKm: 'ទស្សនា Hall 6-8: គ្រឿងម៉ាស៊ីនឧស្សាហកម្ម និងឧបករណ៍កែច្នៃស្វ័យប្រវត្តិកម្ម', activityEn: 'Hall 6-8 Inspection: Industrial Processing Machinery, CNC, and Robotic Automation', location: 'Pazhou Complex Area B', locationKm: 'Pazhou Complex តំបន់ B', locationEn: 'Pazhou Complex Area B' }
      ]
    },
    {
      day: 3,
      title: 'Canton Fair Phase 1 (ថ្ងៃទី ២): ឧបករណ៍ជាង សម្ភារៈសំណង់ & ថាមពលកកើតឡើងវិញ',
      titleKm: 'Canton Fair Phase 1 (ថ្ងៃទី ២): ឧបករណ៍ជាង សម្ភារៈសំណង់ & ថាមពលកកើតឡើងវិញ',
      titleEn: 'Canton Fair Phase 1 (Day 2): Hardware Tools, Building Materials & Renewable Energy',
      description: 'ផ្តោតលើការចរចា និងចុះកិច្ចសន្យាផ្គត់ផ្គង់សម្ភារៈសំណង់ ឧបករណ៍ជាង Hardware ភ្លើងបំភ្លឺ LED និងបច្ចេកវិទ្យាថាមពលពន្លឺព្រះអាទិត្យ Solar/Battery។',
      descriptionKm: 'ផ្តោតលើការចរចា និងចុះកិច្ចសន្យាផ្គត់ផ្គង់សម្ភារៈសំណង់ ឧបករណ៍ជាង Hardware ភ្លើងបំភ្លឺ LED និងបច្ចេកវិទ្យាថាមពលពន្លឺព្រះអាទិត្យ Solar/Battery។',
      descriptionEn: 'Contract negotiations and factory sourcing for construction materials, power tools, LED lighting, and solar PV energy systems. Evening Pearl River VIP cruise.',
      hotelName: 'Guangzhou Marriott Pazhou (5-Star)',
      hotelNameKm: 'សណ្ឋាគារ Guangzhou Marriott Pazhou (កម្រិត ៥ ផ្កាយ)',
      hotelNameEn: 'Guangzhou Marriott Pazhou (5-Star Luxury)',
      mealsIncluded: ['Buffet Breakfast', 'Lunch', 'Dinner'],
      mealsIncludedKm: ['អាហារពេលព្រឹកប៊ូហ្វេ', 'អាហារថ្ងៃត្រង់', 'អាហារពេលល្ងាច'],
      mealsIncludedEn: ['Hotel Buffet Breakfast', 'Business Lunch', 'Pearl River Cruise Banquet'],
      guideAgenda: [
        { time: '09:00 AM - 12:30 PM', activity: 'ទស្សនា Hall 9-11: សម្ភារៈសំណង់ ឧបករណ៍ជាង និងបរិក្ខារបំពង់ទឹក/អគ្គិសនី', activityKm: 'ទស្សនា Hall 9-11: សម្ភារៈសំណង់ ឧបករណ៍ជាង និងបរិក្ខារបំពង់ទឹក/អគ្គិសនី', activityEn: 'Hall 9-11 Sourcing: Construction Materials, Hardware, Sanitary & Electrical Tools', location: 'Pazhou Complex Area B', locationKm: 'Pazhou Complex តំបន់ B', locationEn: 'Pazhou Complex Area B' },
        { time: '01:30 PM - 05:00 PM', activity: 'ទស្សនា Hall 14-16: ថាមពលពន្លឺព្រះអាទិត្យ Solar Panels, Inverters & EV Chargers', activityKm: 'ទស្សនា Hall 14-16: ថាមពលពន្លឺព្រះអាទិត្យ Solar Panels, Inverters & EV Chargers', activityEn: 'Hall 14-16 Sourcing: Solar Photovoltaics, Commercial Inverters & EV Infrastructure', location: 'Pazhou Complex Area C', locationKm: 'Pazhou Complex តំបន់ C', locationEn: 'Pazhou Complex Area C' },
        { time: '06:30 PM - 09:00 PM', activity: 'ទស្សនាក្រុងក្វាងចូវពេលរាត្រី & ជិះទូកកម្សាន្តទន្លេគុជ Pearl River Night Cruise', activityKm: 'ទស្សនាក្រុងក្វាងចូវពេលរាត្រី & ជិះទូកកម្សាន្តទន្លេគុជ Pearl River Night Cruise', activityEn: 'Guangzhou Skyline Sightseeing & Pearl River Luxury Dinner Cruise', location: 'Pearl River Pier', locationKm: 'កំពង់ផែទន្លេគុជ', locationEn: 'Pearl River Pier' }
      ]
    },
    {
      day: 4,
      title: 'ដំណើរទស្សនកិច្ចរោងចក្រ Foshan: រោងចក្រផលិតសម្ភារៈសំណង់ & មជ្ឈមណ្ឌលលក់ដុំ',
      titleKm: 'ដំណើរទស្សនកិច្ចរោងចក្រ Foshan: រោងចក្រផលិតសម្ភារៈសំណង់ & មជ្ឈមណ្ឌលលក់ដុំ',
      titleEn: 'Foshan Industrial Plant Expedition: Building Materials & Mega Wholesale Wholesale Hubs',
      description: 'ចេញដំណើរទៅកាន់ទីក្រុង Foshan ទស្សនកិច្ចផ្ទាល់ដល់រោងចក្រផលិត និងមជ្ឈមណ្ឌលលក់ដុំសម្ភារៈសំណង់ ក្បឿង សេរ៉ាមិច និងគ្រឿងសង្ហារិមខ្នាតយក្ស។',
      descriptionKm: 'ចេញដំណើរទៅកាន់ទីក្រុង Foshan ទស្សនកិច្ចផ្ទាល់ដល់រោងចក្រផលិត និងមជ្ឈមណ្ឌលលក់ដុំសម្ភារៈសំណង់ ក្បឿង សេរ៉ាមិច និងគ្រឿងសង្ហារិមខ្នាតយក្ស។',
      descriptionEn: 'Field study to Foshan manufacturing bases. Direct factory floor inspection of ceramic tiles, architectural glass, furniture plants, and Shunde culinary experience.',
      hotelName: 'Guangzhou Marriott Pazhou (5-Star)',
      hotelNameKm: 'សណ្ឋាគារ Guangzhou Marriott Pazhou (កម្រិត ៥ ផ្កាយ)',
      hotelNameEn: 'Guangzhou Marriott Pazhou (5-Star Luxury)',
      mealsIncluded: ['Buffet Breakfast', 'Shunde Gourmet Lunch', 'Dinner'],
      mealsIncludedKm: ['អាហារពេលព្រឹកប៊ូហ្វេ', 'អាហារថ្ងៃត្រង់ Shunde', 'អាហារពេលល្ងាច'],
      mealsIncludedEn: ['Hotel Buffet Breakfast', 'Shunde Gourmet Lunch (UNESCO City of Gastronomy)', 'Dinner'],
      guideAgenda: [
        { time: '08:30 AM - 10:00 AM', activity: 'រថយន្ត VIP ជូនដំណើរទៅកាន់ទីក្រុង Foshan', activityKm: 'រថយន្ត VIP ជូនដំណើរទៅកាន់ទីក្រុង Foshan', activityEn: 'Private Coach Transit to Foshan Manufacturing Zone', location: 'Guangzhou -> Foshan', locationKm: 'ក្វាងចូវ ទៅ ហ្វូសាន', locationEn: 'Guangzhou -> Foshan' },
        { time: '10:00 AM - 01:00 PM', activity: 'ទស្សនកិច្ចរោងចក្រផលិតសម្ភារៈសំណង់ & ជួបអ្នកគ្រប់គ្រងផលិតកម្ម', activityKm: 'ទស្សនកិច្ចរោងចក្រផលិតសម្ភារៈសំណង់ & ជួបអ្នកគ្រប់គ្រងផលិតកម្ម', activityEn: 'Ceramics & Building Materials Plant Walkthrough with Plant Directors', location: 'Foshan Industrial Park', locationKm: 'តំបន់ឧស្សាហកម្ម Foshan', locationEn: 'Foshan Industrial Park' },
        { time: '01:00 PM - 02:30 PM', activity: 'ទទួលទានអាហារថ្ងៃត្រង់ម្ហូបពិសេស Shunde Cuisine (UNESCO City of Gastronomy)', activityKm: 'ទទួលទានអាហារថ្ងៃត្រង់ម្ហូបពិសេស Shunde Cuisine (UNESCO City of Gastronomy)', activityEn: 'Authentic Shunde Gastronomic Experience Lunch', location: 'Shunde Famous Restaurant', locationKm: 'ភោជនីយដ្ឋានល្បី Shunde', locationEn: 'Shunde Famous Restaurant' },
        { time: '03:00 PM - 05:30 PM', activity: 'ទស្សនាមជ្ឈមណ្ឌលលក់ដុំគ្រឿងសំណង់ និងឧបករណ៍ជាង Foshan Wholesale Hub', activityKm: 'ទស្សនាមជ្ឈមណ្ឌលលក់ដុំគ្រឿងសំណង់ និងឧបករណ៍ជាង Foshan Wholesale Hub', activityEn: 'Foshan Mega Wholesale Hardware & Building Supply Expo Center', location: 'Foshan Wholesale Trade Center', locationKm: 'មជ្ឈមណ្ឌលពាណិជ្ជកម្មលក់ដុំ Foshan', locationEn: 'Foshan Wholesale Trade Center' }
      ]
    },
    {
      day: 5,
      title: 'ជំនួបពាណិជ្ជកម្ម B2B Matchmaking & មជ្ឈមណ្ឌលលក់ដុំអេឡិចត្រូនិច Dashatou',
      titleKm: 'ជំនួបពាណិជ្ជកម្ម B2B Matchmaking & មជ្ឈមណ្ឌលលក់ដុំអេឡិចត្រូនិច Dashatou',
      titleEn: '1-on-1 Bilateral B2B Matchmaking & Dashatou Electronics Wholesale Supermarket',
      description: 'ការជួបចរចាទល់មុខជាមួយក្រុមហ៊ុនផ្គត់ផ្គង់ចិន និងទស្សនាផ្សារលក់ដុំអេឡិចត្រូនិច និងគ្រឿងបន្លាស់ទូរស័ព្ទធំបំផុតនៅក្វាងចូវ Dashatou & Nanfang Building។',
      descriptionKm: 'ការជួបចរចាទល់មុខជាមួយក្រុមហ៊ុនផ្គត់ផ្គង់ចិន និងទស្សនាផ្សារលក់ដុំអេឡិចត្រូនិច និងគ្រឿងបន្លាស់ទូរស័ព្ទធំបំផុតនៅក្វាងចូវ Dashatou & Nanfang Building។',
      descriptionEn: 'Pre-arranged 1-on-1 B2B meetings with verified suppliers followed by a guided tour of Dashatou and Nanfang electronics wholesale districts. Grand Farewell Seafood Banquet.',
      hotelName: 'Guangzhou Marriott Pazhou (5-Star)',
      hotelNameKm: 'សណ្ឋាគារ Guangzhou Marriott Pazhou (កម្រិត ៥ ផ្កាយ)',
      hotelNameEn: 'Guangzhou Marriott Pazhou (5-Star Luxury)',
      mealsIncluded: ['Buffet Breakfast', 'Lunch', 'Executive Farewell Banquet'],
      mealsIncludedKm: ['អាហារពេលព្រឹកប៊ូហ្វេ', 'អាហារថ្ងៃត្រង់', 'ពិធីលៀងសាយភាយលាគ្នា'],
      mealsIncludedEn: ['Hotel Buffet Breakfast', 'Executive Lunch', 'Grand Seafood Farewell Banquet'],
      guideAgenda: [
        { time: '09:00 AM - 12:00 PM', activity: 'ជំនួបពាណិជ្ជកម្មទល់មុខ B2B Matchmaking Session', activityKm: 'ជំនួបពាណិជ្ជកម្មទល់មុខ B2B Matchmaking Session', activityEn: 'Pre-Scheduled Bilateral B2B Trade Matchmaking Session', location: 'Hotel Business Center', locationKm: 'មជ្ឈមណ្ឌលធុរកិច្ចសណ្ឋាគារ', locationEn: 'Hotel Business Center' },
        { time: '02:00 PM - 05:30 PM', activity: 'ទស្សនកិច្ចផ្សារបោះដុំគ្រឿងអេឡិចត្រូនិច និងគ្រឿងបន្លាស់ Dashatou & Nanfang', activityKm: 'ទស្សនកិច្ចផ្សារបោះដុំគ្រឿងអេឡិចត្រូនិច និងគ្រឿងបន្លាស់ Dashatou & Nanfang', activityEn: 'Dashatou & Nanfang Electronics & Mobile Accessories Wholesale Center', location: 'Guangzhou Electronics Wholesale Market', locationKm: 'ផ្សារលក់ដុំអេឡិចត្រូនិចក្វាងចូវ', locationEn: 'Guangzhou Electronics Wholesale Market' },
        { time: '06:30 PM - 09:30 PM', activity: 'ពិធីជប់លៀងលាគ្នាពិសេស Executive Farewell Seafood Banquet', activityKm: 'ពិធីជប់លៀងលាគ្នាពិសេស Executive Farewell Seafood Banquet', activityEn: 'Official Delegation Farewell Seafood Banquet', location: 'Guangzhou Famous Seafood Restaurant', locationKm: 'ភោជនីយដ្ឋានគ្រឿងសមុទ្រល្បី', locationEn: 'Guangzhou Famous Seafood Restaurant' }
      ]
    },
    {
      day: 6,
      title: 'ទិញទំនិញ Beijing Road Pedestrian Street - ហោះហើរត្រឡប់មកភ្នំពេញ',
      titleKm: 'ទិញទំនិញ Beijing Road Pedestrian Street - ហោះហើរត្រឡប់មកភ្នំពេញ',
      titleEn: 'Beijing Road Pedestrian Shopping - Scheduled Flight Return to Phnom Penh',
      description: 'ទស្សនាតំបន់ពាណិជ្ជកម្ម និងប្រវត្តិសាស្ត្រ Beijing Road Pedestrian Street មុនពេលរថយន្ត VIP ជូនដំណើរទៅព្រលានយន្តហោះ Baiyun ដើម្បីហោះហើរត្រឡប់មកភ្នំពេញ។',
      descriptionKm: 'ទស្សនាតំបន់ពាណិជ្ជកម្ម និងប្រវត្តិសាស្ត្រ Beijing Road Pedestrian Street មុនពេលរថយន្ត VIP ជូនដំណើរទៅព្រលានយន្តហោះ Baiyun ដើម្បីហោះហើរត្រឡប់មកភ្នំពេញ។',
      descriptionEn: 'Morning cultural walk and shopping on historic Beijing Road. Authentic Dim Sum lunch, followed by airport transfer to Baiyun (CAN) for flight back to Phnom Penh.',
      hotelName: 'Trip Completion (Phnom Penh Arrival)',
      hotelNameKm: 'បញ្ចប់ដំណើរបេសកកម្ម (មកដល់ភ្នំពេញ)',
      hotelNameEn: 'Mission Completion (Arrival in Phnom Penh)',
      mealsIncluded: ['Buffet Breakfast', 'Lunch'],
      mealsIncludedKm: ['អាហារពេលព្រឹកប៊ូហ្វេ', 'អាហារថ្ងៃត្រង់ ឌីមសាំ'],
      mealsIncludedEn: ['Hotel Buffet Breakfast', 'Famous Guangdong Dim Sum Lunch'],
      guideAgenda: [
        { time: '09:00 AM - 12:00 PM', activity: 'ទស្សនា និងទិញទំនិញនៅផ្លូវថ្មើរជើង Beijing Road Pedestrian Street', activityKm: 'ទស្សនា និងទិញទំនិញនៅផ្លូវថ្មើរជើង Beijing Road Pedestrian Street', activityEn: 'Beijing Road Pedestrian Street Cultural Walk & Retail Discovery', location: 'Beijing Road', locationKm: 'ផ្លូវថ្មើរជើង Beijing Road', locationEn: 'Beijing Road Pedestrian Street' },
        { time: '12:30 PM - 01:30 PM', activity: 'អាហារថ្ងៃត្រង់ ឌីមសាំក្វាងទុង (Guangdong Famous Dim Sum)', activityKm: 'អាហារថ្ងៃត្រង់ ឌីមសាំក្វាងទុង (Guangdong Famous Dim Sum)', activityEn: 'Traditional Guangdong Dim Sum Experience', location: 'Guangzhou Dim Sum Restaurant', locationKm: 'ភោជនីយដ្ឋានឌីមសាំ', locationEn: 'Guangzhou Dim Sum Restaurant' },
        { time: '02:30 PM - 04:00 PM', activity: 'រថយន្ត VIP ជូនដំណើរទៅកាន់ព្រលានយន្តហោះ Baiyun (CAN)', activityKm: 'រថយន្ត VIP ជូនដំណើរទៅកាន់ព្រលានយន្តហោះ Baiyun (CAN)', activityEn: 'Airport Coach Transfer to Guangzhou Baiyun International Airport', location: 'Guangzhou Baiyun Airport', locationKm: 'ព្រលានយន្តហោះ Baiyun', locationEn: 'Guangzhou Baiyun Airport (CAN)' },
        { time: '06:30 PM - 08:30 PM', activity: 'ជើងហោះហើរត្រង់មកដល់អាកាសយានដ្ឋានអន្តរជាតិភ្នំពេញដោយជោគជ័យ', activityKm: 'ជើងហោះហើរត្រង់មកដល់អាកាសយានដ្ឋានអន្តរជាតិភ្នំពេញដោយជោគជ័យ', activityEn: 'Flight Arrival at Phnom Penh International Airport (PNH) - Mission Accomplished', location: 'Phnom Penh Arrival', locationKm: 'មកដល់ភ្នំពេញ', locationEn: 'Phnom Penh International Airport' }
      ]
    }
  ]
};

export const CANTON_FAIR_PHASE_2_PACKAGE: TourPackage = {
  id: 'pkg_canton_fair_phase_2_2026',
  status: 'active',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  version: 1,
  isCantonFair: true,
  cantonFairPhase: 'Phase 2',
  title: 'បេសកកម្មពាណិជ្ជកម្មក្វាងចូវ Canton Fair 2026 (Phase 2): ទំនិញប្រើប្រាស់ គ្រឿងតុបតែងផ្ទះ គ្រឿងសង្ហារិម សេរ៉ាមិច & របស់របរផ្ទះបាយ',
  titleKm: 'បេសកកម្មពាណិជ្ជកម្មក្វាងចូវ Canton Fair 2026 (Phase 2): ទំនិញប្រើប្រាស់ គ្រឿងតុបតែងផ្ទះ គ្រឿងសង្ហារិម សេរ៉ាមិច & របស់របរផ្ទះបាយ',
  titleEn: 'Guangzhou Canton Fair 2026 (Phase 2): Consumer Goods, Home Decorations, Furniture, Daily Ceramics & Kitchenware',
  destination: 'ក្វាងចូវ + ចុងសាន (Guangzhou & Zhongshan, China)',
  destinationKm: 'ក្វាងចូវ + ចុងសាន (Guangzhou & Zhongshan)',
  destinationEn: 'Guangzhou & Zhongshan, China',
  country: 'China',
  countryKm: 'ប្រទេសចិន (China)',
  countryEn: 'China',
  category: 'canton_fair',
  categoryKm: 'ពិព័រណ៍ក្វាងចូវ Canton Fair (Phase 2)',
  categoryEn: 'Canton Fair 2026 (Phase 2)',
  durationDays: 6,
  durationNights: 5,
  priceUSD: 1250,
  discountPriceUSD: 1080,
  rating: 5.0,
  reviewCount: 39,
  bookedThisMonth: 22,
  availableDates: ['2026-10-23', '2026-10-24', '2026-10-25', '2026-10-26', '2026-10-27'],
  flightIncluded: true,
  hotelStars: 5,
  coordinates: {
    lat: 23.1291,
    lng: 113.2644,
    mapX: 82,
    mapY: 48
  },
  images: [
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&auto=format&fit=crop&q=80'
  ],
  description: 'បេសកកម្មពាណិជ្ជកម្មផ្លូវការទៅកាន់ពិព័រណ៍ក្វាងចូវ Canton Fair 2026 (Phase 2) ផ្តោតសំខាន់លើ៖ របស់របរប្រើប្រាស់ក្នុងផ្ទះ ឧបករណ៍ផ្ទះបាយ សេរ៉ាមិច គ្រឿងតុបតែងលម្អគេហដ្ឋាន គ្រឿងសង្ហារិម និងកាដូអនុស្សាវរីយ៍។ រួមបញ្ចូលសេវា Buyer Badge អ្នកបកប្រែពាណិជ្ជកម្ម សណ្ឋាគារផ្កាយ ៥ និងដំណើរបំពេញទស្សនកិច្ចទីផ្សារលក់ដុំគ្រឿងផ្ទះបាយ និងគ្រឿងតុបតែងលម្អធំបំផុតនៅ Zhongshan/Guzhen។',
  descriptionKm: 'បេសកកម្មពាណិជ្ជកម្មផ្លូវការទៅកាន់ពិព័រណ៍ក្វាងចូវ Canton Fair 2026 (Phase 2) ផ្តោតសំខាន់លើ៖ របស់របរប្រើប្រាស់ក្នុងផ្ទះ ឧបករណ៍ផ្ទះបាយ សេរ៉ាមិច គ្រឿងតុបតែងលម្អគេហដ្ឋាន គ្រឿងសង្ហារិម និងកាដូអនុស្សាវរីយ៍។ រួមបញ្ចូលសេវា Buyer Badge អ្នកបកប្រែពាណិជ្ជកម្ម សណ្ឋាគារផ្កាយ ៥ និងដំណើរបំពេញទស្សនកិច្ចទីផ្សារលក់ដុំគ្រឿងផ្ទះបាយ និងគ្រឿងតុបតែងលម្អធំបំផុតនៅ Zhongshan/Guzhen។',
  descriptionEn: 'Official B2B trade delegation to the Canton Fair Phase 2 (Guangzhou, China). Dedicated to Wholesale Houseware, Kitchenware, Tableware, Ceramics, Home Decorations, Gifts, Glassware, and Furniture. Features VIP Buyer Badge issuance, dedicated bilingual business translators, 5-star hotel lodging, and factory sourcing trips to Zhongshan & Guzhen lighting/decor hubs.',
  highlights: [
    '🏠 ស្វែងរកផលិតផលបោះដុំផ្ទាល់ពីរោងចក្រ៖ របស់របរផ្ទះបាយ សេរ៉ាមិច គ្រឿងតុបតែងផ្ទះ និងគ្រឿងសង្ហារិម',
    '🎁 ជួបក្រុមហ៊ុនផលិតទំនិញកាដូអនុស្សាវរីយ៍ និងសម្ភារៈប្រើប្រាស់ទូទៅរាប់ម៉ឺនមុខ',
    '🪪 សម្រួលបែបបទធ្វើកាត Buyer Badge ផ្លូវការ & VIP Fast-Track ចូលសាលពិព័រណ៍ Pazhou Complex',
    '🗣️ អ្នកបកប្រែចិន-ខ្មែរ-អង់គ្លេស ជួយចរចាតម្លៃ និងការបញ្ជាទិញ OEM/ODM ផ្ទាល់',
    '💡 ទស្សនកិច្ចទីផ្សារលក់ដុំអំពូលភ្លើងតុបតែង និងគ្រឿងសង្ហារិម Guzhen / Shunde',
    '✈️ រួមបញ្ចូលសំបុត្រយន្តហោះទៅ-មក ភ្នំពេញ-ក្វាងចូវ + សណ្ឋាគារ ៥ ផ្កាយ ៥ យប់'
  ],
  highlightsKm: [
    '🏠 ស្វែងរកផលិតផលបោះដុំផ្ទាល់ពីរោងចក្រ៖ របស់របរផ្ទះបាយ សេរ៉ាមិច គ្រឿងតុបតែងផ្ទះ និងគ្រឿងសង្ហារិម',
    '🎁 ជួបក្រុមហ៊ុនផលិតទំនិញកាដូអនុស្សាវរីយ៍ និងសម្ភារៈប្រើប្រាស់ទូទៅរាប់ម៉ឺនមុខ',
    '🪪 សម្រួលបែបបទធ្វើកាត Buyer Badge ផ្លូវការ & VIP Fast-Track ចូលសាលពិព័រណ៍ Pazhou Complex',
    '🗣️ អ្នកបកប្រែចិន-ខ្មែរ-អង់គ្លេស ជួយចរចាតម្លៃ និងការបញ្ជាទិញ OEM/ODM ផ្ទាល់',
    '💡 ទស្សនកិច្ចទីផ្សារលក់ដុំអំពូលភ្លើងតុបតែង និងគ្រឿងសង្ហារិម Guzhen / Shunde',
    '✈️ រួមបញ្ចូលសំបុត្រយន្តហោះទៅ-មក ភ្នំពេញ-ក្វាងចូវ + សណ្ឋាគារ ៥ ផ្កាយ ៥ យប់'
  ],
  highlightsEn: [
    '🏠 Direct factory wholesale sourcing: Kitchenware, fine ceramics, home decor & modern furniture',
    '🎁 Access 10,000+ verified manufacturers for seasonal gifts, tableware, and general consumer goods',
    '🪪 Official Canton Fair VIP Buyer Badge issuance with express line-free entrance to Pazhou Complex',
    '🗣️ Trilingual commercial interpreters (Khmer, Chinese, English) for direct OEM/ODM negotiations',
    '💡 Guided sourcing field trips to the world-renowned Guzhen Lighting Capital and Shunde Furniture Hub',
    '✈️ All-inclusive package: Roundtrip flights Phnom Penh to Guangzhou + 5-Star luxury hotel (5 Nights)'
  ],
  whoShouldJoin: [
    '🍳 ម្ចាស់ហាងលក់ទំនិញប្រើប្រាស់ សម្ភារៈផ្ទះបាយ និងរបស់របរក្នុងផ្ទះ (Houseware & Kitchenware Retailers)',
    '🛋️ អ្នករចនាផ្ទៃក្នុង និងអ្នកចែកចាយគ្រឿងសង្ហារិម/គ្រឿងតុបតែងគេហដ្ឋាន (Interior Designers & Furniture Dealers)',
    '🛒 អ្នកលក់ទំនិញអនឡាញ និងម្ចាស់ផ្សារទំនើប/ម៉ាត (E-commerce Sellers & Supermarket Chains)',
    '🎁 អ្នកនាំចូលកាដូអនុស្សាវរីយ៍ វត្ថុអនុស្សាវរីយ៍ និងទំនិញប្រចាំថ្ងៃ (Giftware & General Goods Importers)',
    '🏷️ សហគ្រិនដែលចង់ផលិតទំនិញប្រើប្រាស់ក្រោមប្រេនផ្ទាល់ខ្លួន OEM/ODM (Private Label Brand Creators)'
  ],
  whoShouldJoinKm: [
    '🍳 ម្ចាស់ហាងលក់ទំនិញប្រើប្រាស់ សម្ភារៈផ្ទះបាយ និងរបស់របរក្នុងផ្ទះ (Houseware & Kitchenware Retailers)',
    '🛋️ អ្នករចនាផ្ទៃក្នុង និងអ្នកចែកចាយគ្រឿងសង្ហារិម/គ្រឿងតុបតែងគេហដ្ឋាន (Interior Designers & Furniture Dealers)',
    '🛒 អ្នកលក់ទំនិញអនឡាញ និងម្ចាស់ផ្សារទំនើប/ម៉ាត (E-commerce Sellers & Supermarket Chains)',
    '🎁 អ្នកនាំចូលកាដូអនុស្សាវរីយ៍ វត្ថុអនុស្សាវរីយ៍ និងទំនិញប្រចាំថ្ងៃ (Giftware & General Goods Importers)',
    '🏷️ សហគ្រិនដែលចង់ផលិតទំនិញប្រើប្រាស់ក្រោមប្រេនផ្ទាល់ខ្លួន OEM/ODM (Private Label Brand Creators)'
  ],
  whoShouldJoinEn: [
    '🍳 Houseware, Kitchenware, Tableware & Daily Consumer Essentials Retailers',
    '🛋️ Furniture Showroom Owners, Interior Architects & Home Decor Importers',
    '🛒 High-Volume E-Commerce Sellers, Supermarkets & Department Store Buyers',
    '🎁 Corporate Promotional Gifts, Festive Souvenirs & Ceramics Distributors',
    '🏷️ Brand Entrepreneurs Looking for Custom OEM/ODM Private Label Manufacturing'
  ],
  whyShouldJoin: [
    '💰 ជម្រើសផលិតផលរាប់សែនមុខក្នុងតម្លៃបោះដុំដើមទាបបំផុតសម្រាប់បង្កើនប្រាក់ចំណេញ (Maximize Profit Margins with Direct Sourcing)',
    '💡 ទស្សនាមជ្ឈមណ្ឌលលក់ដុំអំពូលភ្លើង និងគ្រឿងតុបតែង Guzhen / Shunde ធំបំផុតលើលោក (Access Global Lighting & Decor Capitals)',
    '✨ សេវាជួយត្រួតពិនិត្យគុណភាពទំនិញ និងចរចាការវេចខ្ចប់តាមប្រេនផ្ទាល់ខ្លួន (Quality Control & Custom OEM Branding)',
    '🪪 កាត VIP Buyer Badge ផ្លូវការ និងអ្នកបកប្រែពាណិជ្ជកម្មអមដំណើរគ្រប់ពេលវេលា (Expedited VIP Badge & Escort)',
    '🌟 ដំណើរកម្សាន្តប្រណិត សណ្ឋាគារផ្កាយ ៥ ម្ហូបក្វាងទុងពិសេស និងសុវត្ថិភាពខ្ពស់ (5-Star Lodging & Full Delegation Escort)'
  ],
  whyShouldJoinKm: [
    '💰 ជម្រើសផលិតផលរាប់សែនមុខក្នុងតម្លៃបោះដុំដើមទាបបំផុតសម្រាប់បង្កើនប្រាក់ចំណេញ (Maximize Profit Margins with Direct Sourcing)',
    '💡 ទស្សនាមជ្ឈមណ្ឌលលក់ដុំអំពូលភ្លើង និងគ្រឿងតុបតែង Guzhen / Shunde ធំបំផុតលើលោក (Access Global Lighting & Decor Capitals)',
    '✨ សេវាជួយត្រួតពិនិត្យគុណភាពទំនិញ និងចរចាការវេចខ្ចប់តាមប្រេនផ្ទាល់ខ្លួន (Quality Control & Custom OEM Branding)',
    '🪪 កាត VIP Buyer Badge ផ្លូវការ និងអ្នកបកប្រែពាណិជ្ជកម្មអមដំណើរគ្រប់ពេលវេលា (Expedited VIP Badge & Escort)',
    '🌟 ដំណើរកម្សាន្តប្រណិត សណ្ឋាគារផ្កាយ ៥ ម្ហូបក្វាងទុងពិសេស និងសុវត្ថិភាពខ្ពស់ (5-Star Lodging & Full Delegation Escort)'
  ],
  whyShouldJoinEn: [
    '💰 Unmatched factory pricing and bulk volume tier discounts to dramatically increase domestic profit margins',
    '💡 Curated sourcing field trips to the world\'s largest lighting capital (Guzhen) and furniture center (Shunde)',
    '✨ Direct negotiations with audited factories for bespoke private labeling, custom molds, and retail packaging',
    '🪪 Official expedited Canton Fair registration with dedicated Khmer/Chinese business negotiators on-site',
    '🌟 5-star luxury stay, authentic Cantonese culinary experiences, private transport, and end-to-end delegation escort'
  ],
  inclusions: [
    'សំបុត្រយន្តហោះទៅ-មក ភ្នំពេញ - ក្វាងចូវ (Roundtrip Flight PNH - CAN)',
    'សណ្ឋាគារប្រណិតកម្រិត ៥ ផ្កាយ (៥ យប់ នៅក្រុងក្វាងចូវ)',
    'សេវាធ្វើកាត VIP Buyer Badge ផ្លូវការចូល Canton Fair Phase 2',
    'រថយន្ត VIP ជូនដំណើរពេញដំណើរកម្សាន្ត និងទៅ Pazhou Complex',
    'អាហារប៊ូហ្វេពេលព្រឹក និងអាហារពេលល្ងាចម្ហូបក្វាងទុងពិសេស',
    'អ្នកបកប្រែភាសាចិន-ខ្មែរ-អង់គ្លេស ជួយចរចា និងចុះកិច្ចសន្យា',
    'ធានារ៉ាប់រងការធ្វើដំណើរបេសកកម្មអន្តរជាតិ'
  ],
  inclusionsKm: [
    'សំបុត្រយន្តហោះទៅ-មក ភ្នំពេញ - ក្វាងចូវ (Roundtrip Flight PNH - CAN)',
    'សណ្ឋាគារប្រណិតកម្រិត ៥ ផ្កាយ (៥ យប់ នៅក្រុងក្វាងចូវ)',
    'សេវាធ្វើកាត VIP Buyer Badge ផ្លូវការចូល Canton Fair Phase 2',
    'រថយន្ត VIP ជូនដំណើរពេញដំណើរកម្សាន្ត និងទៅ Pazhou Complex',
    'អាហារប៊ូហ្វេពេលព្រឹក និងអាហារពេលល្ងាចម្ហូបក្វាងទុងពិសេស',
    'អ្នកបកប្រែភាសាចិន-ខ្មែរ-អង់គ្លេស ជួយចរចា និងចុះកិច្ចសន្យា',
    'ធានារ៉ាប់រងការធ្វើដំណើរបេសកកម្មអន្តរជាតិ'
  ],
  inclusionsEn: [
    'Roundtrip International Flights: Phnom Penh (PNH) to Guangzhou (CAN) with luggage',
    '5-Star Luxury Accommodations in Guangzhou (5 Nights in Pazhou/Tianhe District)',
    'Official Canton Fair Phase 2 VIP Buyer Badge processing & access badge',
    'Dedicated VIP air-conditioned coach transfers for all daily scheduled trips',
    'Daily Hotel Buffet Breakfasts & Authentic Cantonese Banquets',
    'Trilingual Commercial Business Interpreters (Khmer, Mandarin Chinese, English)',
    'Comprehensive International Business Travel & Medical Insurance Coverage'
  ],
  exclusions: [
    'ទិដ្ឋាការចូលប្រទេសចិន China Visa Fee (KHB ជួយរៀបចំ Official Invitation Letter)',
    'ការចំណាយផ្ទាល់ខ្លួន និងទម្ងន់វ៉ាលីសលើសកំណត់',
    'ថ្លៃដឹកជញ្ជូនទំនិញ ឬទិញទំនិញផ្ទាល់ខ្លួន'
  ],
  exclusionsKm: [
    'ទិដ្ឋាការចូលប្រទេសចិន China Visa Fee (KHB ជួយរៀបចំ Official Invitation Letter)',
    'ការចំណាយផ្ទាល់ខ្លួន និងទម្ងន់វ៉ាលីសលើសកំណត់',
    'ថ្លៃដឹកជញ្ជូនទំនិញ ឬទិញទំនិញផ្ទាល់ខ្លួន'
  ],
  exclusionsEn: [
    'China Entry Visa processing fee (KHB provides Official Invitation Letter)',
    'Personal expenditures (souvenirs, private laundry, telecommunications, minibar)',
    'International freight or commercial sample shipping fees'
  ],
  termsAndConditions: [
    'លិខិតឆ្លងដែន Passport ត្រូវមានសុពលភាពយ៉ាងតិច ៦ ខែគិតចាប់ពីថ្ងៃចេញដំណើរ។',
    'តម្រូវឱ្យកក់ប្រាក់កក់ចំនួន 50% នៅពេលចុះឈ្មោះដើម្បីធានាសំបុត្រយន្តហោះ និងសណ្ឋាគារ ៥ ផ្កាយ។',
    'KHB នឹងចេញលិខិតអញ្ជើញពាណិជ្ជកម្មផ្លូវការ (Official Canton Fair Invitation) សម្រាប់ធ្វើ Visa ចិន។',
    'ឈប់ទទួលចុះឈ្មោះមុនថ្ងៃទី 25 ខែកញ្ញា ឆ្នាំ 2026 ឬនៅពេលគ្រប់ចំនួនគណៈប្រតិភូ 25 នាក់។'
  ],
  termsAndConditionsKm: [
    'លិខិតឆ្លងដែន Passport ត្រូវមានសុពលភាពយ៉ាងតិច ៦ ខែគិតចាប់ពីថ្ងៃចេញដំណើរ។',
    'តម្រូវឱ្យកក់ប្រាក់កក់ចំនួន 50% នៅពេលចុះឈ្មោះដើម្បីធានាសំបុត្រយន្តហោះ និងសណ្ឋាគារ ៥ ផ្កាយ។',
    'KHB នឹងចេញលិខិតអញ្ជើញពាណិជ្ជកម្មផ្លូវការ (Official Canton Fair Invitation) សម្រាប់ធ្វើ Visa ចិន។',
    'ឈប់ទទួលចុះឈ្មោះមុនថ្ងៃទី 25 ខែកញ្ញា ឆ្នាំ 2026 ឬនៅពេលគ្រប់ចំនួនគណៈប្រតិភូ 25 នាក់។'
  ],
  termsAndConditionsEn: [
    'Passport must maintain a minimum validity of 6 months from the date of departure.',
    'A 50% initial deposit is required upon delegate registration to secure 5-star hotel & flights.',
    'KHB Events issues official corporate invitation letters for Chinese commercial visa applications.',
    'Registration closes September 25, 2026 or upon reaching the maximum capacity of 25 delegates.'
  ],
  tags: ['trending', 'popular', 'cultural'],
  emergencyContact: {
    country: 'China (Guangzhou & Guangdong Province)',
    police: '110',
    ambulance: '120',
    touristHelpline: '060 815 515 (Mr. Tim Vutha)',
    embassySupport: '+86 20 8384 9400 (Royal Consulate General of Cambodia in Guangzhou)'
  },
  tourGuide: {
    name: 'Mr. Tim Vutha & China Operations Escort Team',
    nameKm: 'លោក ទឹម វុទ្ធា & ក្រុមការងារសម្របសម្រួលចិន',
    nameEn: 'Mr. Tim Vutha & China Operations Escort Team',
    title: 'Lead Trade Mission Director (Cambodia-China Trade)',
    titleKm: 'ប្រធានដឹកនាំបេសកកម្មពាណិជ្ជកម្ម (កម្ពុជា-ចិន)',
    titleEn: 'Lead Trade Mission Director (Cambodia-China Trade)',
    phone: '060 815 515',
    telegram: 'https://t.me/VuthaTim',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    badgeNumber: 'KHB-CANTON-2026-02',
    bio: 'Senior trade delegation coordinator specializing in consumer retail, home living, and wholesale sourcing from Guangdong factories.',
    bioKm: 'អ្នកសម្របសម្រួលគណៈប្រតិភូពាណិជ្ជកម្មជាន់ខ្ពស់ ឯកទេសផ្នែកទំនិញប្រើប្រាស់ គ្រឿងតុបតែងគេហដ្ឋាន និងការស្វែងរកប្រភពទំនិញបោះដុំពីរោងចក្រនៅក្វាងទុង។',
    bioEn: 'Senior trade delegation coordinator specializing in consumer retail, home living, and wholesale sourcing from Guangdong factories.',
    languages: ['Khmer', 'Chinese (Mandarin)', 'English'],
    briefingMeetingPoint: 'Phnom Penh International Airport (PNH) International Departure Gate',
    briefingMeetingPointKm: 'ព្រលានយន្តហោះអន្តរជាតិភ្នំពេញ (PNH) ច្រកចេញដំណើរអន្តរជាតិ - បញ្ជរ KHB VIP',
    briefingMeetingPointEn: 'Phnom Penh International Airport (PNH) International Departure Gate - KHB VIP Desk',
    briefingTime: '07:30 AM (Oct 23, 2026)',
    briefingTimeKm: '07:30 AM (ថ្ងៃទី 23/10/2026)',
    briefingTimeEn: '07:30 AM (Oct 23, 2026)'
  },
  itinerary: [
    {
      day: 1,
      title: 'ភ្នំពេញ - ក្វាងចូវ - ទទួលកាត Buyer Badge & ពិធីស្វាគមន៍គណៈប្រតិភូ',
      titleKm: 'ភ្នំពេញ - ក្វាងចូវ - ទទួលកាត Buyer Badge & ពិធីស្វាគមន៍គណៈប្រតិភូ',
      titleEn: 'Phnom Penh to Guangzhou - Buyer Badge Registration & Welcome Delegation Banquet',
      description: 'ហោះហើរទៅក្វាងចូវ សម្រួលកាត Buyer Badge ចូលឆែកអ៊ីនសណ្ឋាគារ ៥ ផ្កាយ និងពិសារអាហារពេលល្ងាចស្វាគមន៍។',
      descriptionKm: 'ហោះហើរទៅក្វាងចូវ សម្រួលកាត Buyer Badge ចូលឆែកអ៊ីនសណ្ឋាគារ ៥ ផ្កាយ និងពិសារអាហារពេលល្ងាចស្វាគមន៍។',
      descriptionEn: 'Direct flight from Phnom Penh to Guangzhou Baiyun (CAN). Priority VIP Buyer Badge pickup, 5-star hotel check-in, and Grand Cantonese Welcome Banquet.',
      hotelName: 'Guangzhou Marriott Pazhou (5-Star)',
      hotelNameKm: 'សណ្ឋាគារ Guangzhou Marriott Pazhou (កម្រិត ៥ ផ្កាយ)',
      hotelNameEn: 'Guangzhou Marriott Pazhou (5-Star Luxury)',
      mealsIncluded: ['Breakfast', 'Welcome Banquet'],
      mealsIncludedKm: ['អាហារពេលព្រឹក', 'ពិធីលៀងសាយភាយស្វាគមន៍'],
      mealsIncludedEn: ['In-Flight / Hotel Breakfast', 'Grand Welcome Gala Banquet'],
      guideAgenda: [
        { time: '08:00 AM - 10:00 AM', activity: 'ជួបជុំគណៈប្រតិភូនៅព្រលានយន្តហោះភ្នំពេញ', activityKm: 'ជួបជុំគណៈប្រតិភូនៅព្រលានយន្តហោះភ្នំពេញ', activityEn: 'Delegation Assembly at Phnom Penh Airport', location: 'Phnom Penh Airport', locationKm: 'ព្រលានយន្តហោះភ្នំពេញ', locationEn: 'Phnom Penh International Airport' },
        { time: '10:30 AM - 02:15 PM', activity: 'ជើងហោះហើរត្រង់ ភ្នំពេញ ទៅ ក្វាងចូវ', activityKm: 'ជើងហោះហើរត្រង់ ភ្នំពេញ ទៅ ក្វាងចូវ', activityEn: 'Direct Flight: Phnom Penh (PNH) to Guangzhou (CAN)', location: 'Flight PNH -> CAN', locationKm: 'ជើងហោះហើរ PNH -> CAN', locationEn: 'Flight PNH -> CAN' },
        { time: '03:45 PM - 05:30 PM', activity: 'ទទួលកាត VIP Buyer Badge & ឆែកអ៊ីនសណ្ឋាគារ ៥ ផ្កាយ', activityKm: 'ទទួលកាត VIP Buyer Badge & ឆែកអ៊ីនសណ្ឋាគារ ៥ ផ្កាយ', activityEn: 'VIP Fast-Track Canton Fair Badge Pickup & 5-Star Hotel Check-in', location: 'Pazhou Center', locationKm: 'Pazhou Registration Center', locationEn: 'Pazhou Registration Center' },
        { time: '06:30 PM - 09:00 PM', activity: 'ពិធីលៀងសាយភាយស្វាគមន៍គណៈប្រតិភូ', activityKm: 'ពិធីលៀងសាយភាយស្វាគមន៍គណៈប្រតិភូ', activityEn: 'Official Delegation Welcome Gala Dinner', location: 'Grand Ballroom', locationKm: 'សាលពិធីធំសណ្ឋាគារ', locationEn: 'Hotel Grand Ballroom' }
      ]
    },
    {
      day: 2,
      title: 'Canton Fair Phase 2 (ថ្ងៃទី ១): របស់របរប្រើប្រាស់ក្នុងផ្ទះ ផ្ទះបាយ និងសេរ៉ាមិច',
      titleKm: 'Canton Fair Phase 2 (ថ្ងៃទី ១): របស់របរប្រើប្រាស់ក្នុងផ្ទះ ផ្ទះបាយ និងសេរ៉ាមិច',
      titleEn: 'Canton Fair Phase 2 (Day 1): Houseware, Kitchenware, Tableware & Daily Ceramics',
      description: 'ពេញមួយថ្ងៃនៅ Pazhou Complex ជួបក្រុមហ៊ុនផលិតរបស់របរផ្ទះបាយ ចានកែវ សេរ៉ាមិច និងទំនិញប្រើប្រាស់ប្រចាំថ្ងៃ។',
      descriptionKm: 'ពេញមួយថ្ងៃនៅ Pazhou Complex ជួបក្រុមហ៊ុនផលិតរបស់របរផ្ទះបាយ ចានកែវ សេរ៉ាមិច និងទំនិញប្រើប្រាស់ប្រចាំថ្ងៃ។',
      descriptionEn: 'Full-day sourcing at Pazhou Complex (Areas A & B). Direct negotiations with certified manufacturers of cookware, glassware, kitchen tools, and ceramics.',
      hotelName: 'Guangzhou Marriott Pazhou (5-Star)',
      hotelNameKm: 'សណ្ឋាគារ Guangzhou Marriott Pazhou (កម្រិត ៥ ផ្កាយ)',
      hotelNameEn: 'Guangzhou Marriott Pazhou (5-Star Luxury)',
      mealsIncluded: ['Buffet Breakfast', 'VIP Lunch', 'Dinner'],
      mealsIncludedKm: ['អាហារពេលព្រឹកប៊ូហ្វេ', 'អាហារថ្ងៃត្រង់ VIP', 'អាហារពេលល្ងាច'],
      mealsIncludedEn: ['Hotel Buffet Breakfast', 'VIP Networking Lunch', 'Dinner'],
      guideAgenda: [
        { time: '09:00 AM - 12:30 PM', activity: 'ទស្សនា Hall 1-4: របស់របរផ្ទះបាយ ចានឆ្នាំង និងសេរ៉ាមិចប្រណិត', activityKm: 'ទស្សនា Hall 1-4: របស់របរផ្ទះបាយ ចានឆ្នាំង និងសេរ៉ាមិចប្រណិត', activityEn: 'Hall 1-4 Sourcing: Cookware, Tableware, Fine Porcelain & Glassware', location: 'Pazhou Complex Area A', locationKm: 'Pazhou Complex តំបន់ A', locationEn: 'Pazhou Complex Area A' },
        { time: '01:30 PM - 05:30 PM', activity: 'ទស្សនា Hall 5-7: របស់របរប្រើប្រាស់ទូទៅ និងផលិតផលផ្លាស្ទិកកែច្នៃ', activityKm: 'ទស្សនា Hall 5-7: របស់របរប្រើប្រាស់ទូទៅ និងផលិតផលផ្លាស្ទិកកែច្នៃ', activityEn: 'Hall 5-7 Sourcing: Daily Essentials, Household Organizers & Eco-Plastic Ware', location: 'Pazhou Complex Area B', locationKm: 'Pazhou Complex តំបន់ B', locationEn: 'Pazhou Complex Area B' }
      ]
    },
    {
      day: 3,
      title: 'Canton Fair Phase 2 (ថ្ងៃទី ២): គ្រឿងតុបតែងផ្ទះ កាដូ និងគ្រឿងសង្ហារិម',
      titleKm: 'Canton Fair Phase 2 (ថ្ងៃទី ២): គ្រឿងតុបតែងផ្ទះ កាដូ និងគ្រឿងសង្ហារិម',
      titleEn: 'Canton Fair Phase 2 (Day 2): Home Decor, Festive Gifts, Art Lighting & Furniture',
      description: 'ទស្សនាគ្រឿងតុបតែងលម្អគេហដ្ឋាន អំពូលភ្លើងសិល្បៈ កាដូអនុស្សាវរីយ៍ និងគ្រឿងសង្ហារិមទំនើប។',
      descriptionKm: 'ទស្សនាគ្រឿងតុបតែងលម្អគេហដ្ឋាន អំពូលភ្លើងសិល្បៈ កាដូអនុស្សាវរីយ៍ និងគ្រឿងសង្ហារិមទំនើប។',
      descriptionEn: 'Inspect home furnishings, aesthetic lighting fixtures, holiday gifts, and modern indoor/outdoor furniture at Pazhou Complex. Evening Pearl River Night Cruise.',
      hotelName: 'Guangzhou Marriott Pazhou (5-Star)',
      hotelNameKm: 'សណ្ឋាគារ Guangzhou Marriott Pazhou (កម្រិត ៥ ផ្កាយ)',
      hotelNameEn: 'Guangzhou Marriott Pazhou (5-Star Luxury)',
      mealsIncluded: ['Buffet Breakfast', 'Lunch', 'Dinner'],
      mealsIncludedKm: ['អាហារពេលព្រឹកប៊ូហ្វេ', 'អាហារថ្ងៃត្រង់', 'អាហារពេលល្ងាច'],
      mealsIncludedEn: ['Hotel Buffet Breakfast', 'Executive Lunch', 'Pearl River Cruise Banquet'],
      guideAgenda: [
        { time: '09:00 AM - 12:30 PM', activity: 'ទស្សនា Hall 8-10: គ្រឿងតុបតែងគេហដ្ឋាន ផ្កាសិប្បនិម្មិត និងសិល្បៈកែវ', activityKm: 'ទស្សនា Hall 8-10: គ្រឿងតុបតែងគេហដ្ឋាន ផ្កាសិប្បនិម្មិត និងសិល្បៈកែវ', activityEn: 'Hall 8-10 Sourcing: Home Ornaments, Artificial Flora, Festive Gifts & Glass Art', location: 'Pazhou Complex Area B', locationKm: 'Pazhou Complex តំបន់ B', locationEn: 'Pazhou Complex Area B' },
        { time: '01:30 PM - 05:00 PM', activity: 'ទស្សនា Hall 11-13: គ្រឿងសង្ហារិមក្នុងផ្ទះ និងក្រៅផ្ទះ (Indoor & Outdoor Furniture)', activityKm: 'ទស្សនា Hall 11-13: គ្រឿងសង្ហារិមក្នុងផ្ទះ និងក្រៅផ្ទះ (Indoor & Outdoor Furniture)', activityEn: 'Hall 11-13 Sourcing: Living Room, Bedroom, Office & Outdoor Patio Furniture', location: 'Pazhou Complex Area C', locationKm: 'Pazhou Complex តំបន់ C', locationEn: 'Pazhou Complex Area C' },
        { time: '06:30 PM - 09:00 PM', activity: 'ជិះទូកកម្សាន្តទន្លេគុជ Pearl River Night Cruise', activityKm: 'ជិះទូកកម្សាន្តទន្លេគុជ Pearl River Night Cruise', activityEn: 'Pearl River Luxury Night Skyline Cruise & Banquet', location: 'Pearl River Pier', locationKm: 'កំពង់ផែទន្លេគុជ', locationEn: 'Pearl River Pier' }
      ]
    },
    {
      day: 4,
      title: 'ទស្សនកិច្ចរោងចក្រ & ផ្សារលក់ដុំអំពូលភ្លើង Guzhen Lighting Capital',
      titleKm: 'ទស្សនកិច្ចរោងចក្រ & ផ្សារលក់ដុំអំពូលភ្លើង Guzhen Lighting Capital',
      titleEn: 'Zhongshan Expedition: Guzhen Lighting Wholesale Capital & Factory Floor Inspection',
      description: 'ធ្វើដំណើរទៅកាន់ទីក្រុងចុងសាន ទស្សនាទីក្រុងអំពូលភ្លើងធំបំផុត Guzhen Lighting Wholesale Capital។',
      descriptionKm: 'ធ្វើដំណើរទៅកាន់ទីក្រុងចុងសាន ទស្សនាទីក្រុងអំពូលភ្លើងធំបំផុត Guzhen Lighting Wholesale Capital។',
      descriptionEn: 'Excursion to Zhongshan to inspect the world\'s largest architectural & residential lighting wholesale market (Guzhen) with direct factory pricing.',
      hotelName: 'Guangzhou Marriott Pazhou (5-Star)',
      hotelNameKm: 'សណ្ឋាគារ Guangzhou Marriott Pazhou (កម្រិត ៥ ផ្កាយ)',
      hotelNameEn: 'Guangzhou Marriott Pazhou (5-Star Luxury)',
      mealsIncluded: ['Buffet Breakfast', 'Lunch', 'Dinner'],
      mealsIncludedKm: ['អាហារពេលព្រឹកប៊ូហ្វេ', 'អាហារថ្ងៃត្រង់', 'អាហារពេលល្ងាច'],
      mealsIncludedEn: ['Hotel Buffet Breakfast', 'Zhongshan Regional Lunch', 'Dinner'],
      guideAgenda: [
        { time: '08:30 AM - 10:00 AM', activity: 'រថយន្ត VIP ជូនដំណើរទៅ Guzhen, Zhongshan', activityKm: 'រថយន្ត VIP ជូនដំណើរទៅ Guzhen, Zhongshan', activityEn: 'VIP Coach Transit from Guangzhou to Guzhen, Zhongshan', location: 'Guangzhou -> Zhongshan', locationKm: 'ក្វាងចូវ ទៅ ចុងសាន', locationEn: 'Guangzhou -> Zhongshan' },
        { time: '10:00 AM - 01:00 PM', activity: 'ទស្សនកិច្ចផ្សារបោះដុំអំពូលភ្លើង និងគ្រឿងតុបតែង Guzhen Plaza', activityKm: 'ទស្សនកិច្ចផ្សារបោះដុំអំពូលភ្លើង និងគ្រឿងតុបតែង Guzhen Plaza', activityEn: 'Guzhen Lighting Plaza Wholesale Exhibition Walkthrough', location: 'Guzhen Lighting Market', locationKm: 'ផ្សារលក់ដុំអំពូលភ្លើង Guzhen', locationEn: 'Guzhen Lighting Market' },
        { time: '02:30 PM - 05:30 PM', activity: 'ទស្សនារោងចក្រផលិតសម្ភារៈតុបតែង និងចរចាតម្លៃផ្ទាល់', activityKm: 'ទស្សនារោងចក្រផលិតសម្ភារៈតុបតែង និងចរចាតម្លៃផ្ទាល់', activityEn: 'Direct Factory Inspection & Contract Sourcing at Zhongshan Plant', location: 'Zhongshan Manufacturing Hub', locationKm: 'មជ្ឈមណ្ឌលផលិតកម្មចុងសាន', locationEn: 'Zhongshan Manufacturing Hub' }
      ]
    },
    {
      day: 5,
      title: 'ជំនួបពាណិជ្ជកម្ម B2B & ផ្សារលក់ដុំទំនិញទូទៅ OneLink International Plaza',
      titleKm: 'ជំនួបពាណិជ្ជកម្ម B2B & ផ្សារលក់ដុំទំនិញទូទៅ OneLink International Plaza',
      titleEn: '1-on-1 B2B Matchmaking & OneLink International Plaza Wholesale Center',
      description: 'ទស្សនាផ្សារលក់ដុំកាដូ របស់របរតុបតែង និងរបស់ក្មេងលេងធំបំផុតនៅក្វាងចូវ OneLink Plaza។',
      descriptionKm: 'ទស្សនាផ្សារលក់ដុំកាដូ របស់របរតុបតែង និងរបស់ក្មេងលេងធំបំផុតនៅក្វាងចូវ OneLink Plaza។',
      descriptionEn: 'Morning bilateral B2B meeting with verified suppliers. Afternoon guided tour of Guangzhou\'s premier toy, gift, and boutique home decor wholesale supermall.',
      hotelName: 'Guangzhou Marriott Pazhou (5-Star)',
      hotelNameKm: 'សណ្ឋាគារ Guangzhou Marriott Pazhou (កម្រិត ៥ ផ្កាយ)',
      hotelNameEn: 'Guangzhou Marriott Pazhou (5-Star Luxury)',
      mealsIncluded: ['Buffet Breakfast', 'Lunch', 'Farewell Banquet'],
      mealsIncludedKm: ['អាហារពេលព្រឹកប៊ូហ្វេ', 'អាហារថ្ងៃត្រង់', 'ពិធីលៀងសាយភាយលាគ្នា'],
      mealsIncludedEn: ['Hotel Buffet Breakfast', 'Lunch', 'Executive Farewell Banquet'],
      guideAgenda: [
        { time: '09:00 AM - 12:00 PM', activity: 'ជំនួបពាណិជ្ជកម្មទល់មុខ B2B Matchmaking', activityKm: 'ជំនួបពាណិជ្ជកម្មទល់មុខ B2B Matchmaking', activityEn: 'Bilateral B2B Matchmaking Conference', location: 'Hotel Business Center', locationKm: 'មជ្ឈមណ្ឌលធុរកិច្ចសណ្ឋាគារ', locationEn: 'Hotel Business Center' },
        { time: '02:00 PM - 05:30 PM', activity: 'ទស្សនកិច្ចផ្សារបោះដុំ OneLink International Plaza', activityKm: 'ទស្សនកិច្ចផ្សារបោះដុំ OneLink International Plaza', activityEn: 'OneLink International Plaza Wholesale Walkthrough', location: 'OneLink Plaza Guangzhou', locationKm: 'ផ្សារ OneLink Plaza ក្វាងចូវ', locationEn: 'OneLink Plaza Guangzhou' },
        { time: '06:30 PM - 09:30 PM', activity: 'ពិធីជប់លៀងលាគ្នា Executive Farewell Banquet', activityKm: 'ពិធីជប់លៀងលាគ្នា Executive Farewell Banquet', activityEn: 'Official Delegation Farewell Seafood Banquet', location: 'Seafood Banquet Hall', locationKm: 'សាលពិធីលៀងសាយភាយ', locationEn: 'Seafood Banquet Hall' }
      ]
    },
    {
      day: 6,
      title: 'ទិញទំនិញ Shamian Island & Beijing Road - ហោះហើរត្រឡប់មកភ្នំពេញ',
      titleKm: 'ទិញទំនិញ Shamian Island & Beijing Road - ហោះហើរត្រឡប់មកភ្នំពេញ',
      titleEn: 'Shamian Island Heritage Walk - Beijing Road Shopping & Return Flight to Phnom Penh',
      description: 'ទស្សនាកោះប្រវត្តិសាស្ត្រ Shamian Island និងផ្លូវពាណិជ្ជកម្ម Beijing Road មុនពេលហោះហើរត្រឡប់មកភ្នំពេញ។',
      descriptionKm: 'ទស្សនាកោះប្រវត្តិសាស្ត្រ Shamian Island និងផ្លូវពាណិជ្ជកម្ម Beijing Road មុនពេលហោះហើរត្រឡប់មកភ្នំពេញ។',
      descriptionEn: 'Morning cultural visit to colonial Shamian Island and shopping along Beijing Road. Traditional Dim Sum lunch and airport transit for return flight to Phnom Penh.',
      hotelName: 'Trip Completion (Phnom Penh Arrival)',
      hotelNameKm: 'បញ្ចប់ដំណើរបេសកកម្ម (មកដល់ភ្នំពេញ)',
      hotelNameEn: 'Mission Completion (Arrival in Phnom Penh)',
      mealsIncluded: ['Buffet Breakfast', 'Dim Sum Lunch'],
      mealsIncludedKm: ['អាហារពេលព្រឹកប៊ូហ្វេ', 'អាហារថ្ងៃត្រង់ ឌីមសាំ'],
      mealsIncludedEn: ['Hotel Buffet Breakfast', 'Guangdong Dim Sum Farewell Lunch'],
      guideAgenda: [
        { time: '09:00 AM - 12:00 PM', activity: 'ទស្សនាកោះបេតិកភណ្ឌ Shamian Island & Beijing Road', activityKm: 'ទស្សនាកោះបេតិកភណ្ឌ Shamian Island & Beijing Road', activityEn: 'Shamian Island Heritage Walk & Beijing Road Retail Experience', location: 'Shamian Island', locationKm: 'កោះ Shamian', locationEn: 'Shamian Island & Beijing Road' },
        { time: '12:30 PM - 01:30 PM', activity: 'អាហារថ្ងៃត្រង់ ឌីមសាំក្វាងទុងពិសេស', activityKm: 'អាហារថ្ងៃត្រង់ ឌីមសាំក្វាងទុងពិសេស', activityEn: 'Traditional Dim Sum Gastronomic Experience', location: 'Dim Sum Restaurant', locationKm: 'ភោជនីយដ្ឋានឌីមសាំ', locationEn: 'Dim Sum Restaurant' },
        { time: '03:00 PM - 04:30 PM', activity: 'រថយន្ត VIP ជូនដំណើរទៅព្រលានយន្តហោះ Baiyun (CAN)', activityKm: 'រថយន្ត VIP ជូនដំណើរទៅព្រលានយន្តហោះ Baiyun (CAN)', activityEn: 'Airport Transfer to Guangzhou Baiyun International Airport', location: 'Guangzhou Airport', locationKm: 'ព្រលានយន្តហោះ Baiyun', locationEn: 'Guangzhou Baiyun Airport (CAN)' },
        { time: '06:30 PM - 08:30 PM', activity: 'ជើងហោះហើរត្រង់មកដល់ភ្នំពេញដោយជោគជ័យ', activityKm: 'ជើងហោះហើរត្រង់មកដល់ភ្នំពេញដោយជោគជ័យ', activityEn: 'Flight Arrival at Phnom Penh International Airport (PNH)', location: 'Phnom Penh Arrival', locationKm: 'មកដល់ភ្នំពេញ', locationEn: 'Phnom Penh International Airport' }
      ]
    }
  ]
};

export const CANTON_FAIR_PHASE_3_PACKAGE: TourPackage = {
  id: 'pkg_canton_fair_phase_3_2026',
  status: 'active',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  version: 1,
  isCantonFair: true,
  cantonFairPhase: 'Phase 3',
  title: 'បេសកកម្មពាណិជ្ជកម្មក្វាងចូវ Canton Fair 2026 (Phase 3): វាយនភណ្ឌ កាត់ដេរ សម្លៀកបំពាក់ ស្បែកជើង ឧបករណ៍វេជ្ជសាស្ត្រ & ម្ហូបអាហារ',
  titleKm: 'បេសកកម្មពាណិជ្ជកម្មក្វាងចូវ Canton Fair 2026 (Phase 3): វាយនភណ្ឌ កាត់ដេរ សម្លៀកបំពាក់ ស្បែកជើង ឧបករណ៍វេជ្ជសាស្ត្រ & ម្ហូបអាហារ',
  titleEn: 'Guangzhou Canton Fair 2026 (Phase 3): Textiles, Garments, Shoes, Office Supplies, Medical Equipment & Food Sourcing',
  destination: 'ក្វាងចូវ + សិនជិន (Guangzhou & Shenzhen, China)',
  destinationKm: 'ក្វាងចូវ + សិនជិន (Guangzhou & Shenzhen)',
  destinationEn: 'Guangzhou & Shenzhen, China',
  country: 'China',
  countryKm: 'ប្រទេសចិន (China)',
  countryEn: 'China',
  category: 'canton_fair',
  categoryKm: 'ពិព័រណ៍ក្វាងចូវ Canton Fair (Phase 3)',
  categoryEn: 'Canton Fair 2026 (Phase 3)',
  durationDays: 6,
  durationNights: 5,
  priceUSD: 1260,
  discountPriceUSD: 1090,
  rating: 5.0,
  reviewCount: 42,
  bookedThisMonth: 25,
  availableDates: ['2026-10-31', '2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04'],
  flightIncluded: true,
  hotelStars: 5,
  coordinates: {
    lat: 23.1291,
    lng: 113.2644,
    mapX: 82,
    mapY: 48
  },
  images: [
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&auto=format&fit=crop&q=80'
  ],
  description: 'បេសកកម្មពាណិជ្ជកម្មផ្លូវការទៅកាន់ពិព័រណ៍ក្វាងចូវ Canton Fair 2026 (Phase 3) ផ្តោតសំខាន់លើ៖ សម្លៀកបំពាក់ ក្រណាត់ វាយនភណ្ឌ ស្បែកជើង កាបូប ឧបករណ៍ការិយាល័យ ផលិតផលវេជ្ជសាស្ត្រ/ថែទាំសុខភាព ឱសថ និងម្ហូបអាហារកែច្នៃ។ រួមបញ្ចូលសេវាធ្វើកាត Buyer Badge អ្នកបកប្រែពាណិជ្ជកម្ម សណ្ឋាគារផ្កាយ ៥ និងដំណើរទស្សនកិច្ចផ្សារបោះដុំក្រណាត់ធំបំផុតនៅ Zhongda Textile Market។',
  descriptionKm: 'បេសកកម្មពាណិជ្ជកម្មផ្លូវការទៅកាន់ពិព័រណ៍ក្វាងចូវ Canton Fair 2026 (Phase 3) ផ្តោតសំខាន់លើ៖ សម្លៀកបំពាក់ ក្រណាត់ វាយនភណ្ឌ ស្បែកជើង កាបូប ឧបករណ៍ការិយាល័យ ផលិតផលវេជ្ជសាស្ត្រ/ថែទាំសុខភាព ឱសថ និងម្ហូបអាហារកែច្នៃ។ រួមបញ្ចូលសេវាធ្វើកាត Buyer Badge អ្នកបកប្រែពាណិជ្ជកម្ម សណ្ឋាគារផ្កាយ ៥ និងដំណើរទស្សនកិច្ចផ្សារបោះដុំក្រណាត់ធំបំផុតនៅ Zhongda Textile Market។',
  descriptionEn: 'Official B2B trade mission to Canton Fair Phase 3 (Guangzhou, China). Focuses on Apparel & Fashion, Textiles & Raw Fabrics, Footwear, Bags & Luggage, Office Supplies & Stationery, Medical & Healthcare Devices, and Food & Agricultural Products. Features VIP Buyer Badges, trilingual translators, 5-star hotel accommodations, and sourcing trips to the Zhongda International Textile City.',
  highlights: [
    '👗 ស្វែងរកប្រភពនាំចូលរោងចក្រផ្ទាល់៖ សម្លៀកបំពាក់ ក្រណាត់ វាយនភណ្ឌ ស្បែកជើង និងកាបូប',
    '🏥 ជួបក្រុមហ៊ុនផលិតឧបករណ៍វេជ្ជសាស្ត្រ សម្ភារៈមន្ទីរពេទ្យ ឱសថ និងផលិតផលថែទាំសុខភាព',
    '🪪 សម្រួលបែបបទធ្វើកាត Buyer Badge ផ្លូវការ & VIP Fast-Track ចូលសាលពិព័រណ៍ Pazhou Complex',
    '🗣️ អ្នកបកប្រែចិន-ខ្មែរ-អង់គ្លេស ជួយចរចាតម្លៃ និងកុម្ម៉ង់កាត់ដេរ OEM/ODM',
    '🧵 ទស្សនកិច្ចទីផ្សារបោះដុំក្រណាត់ និងវត្ថុធាតុដើមកាត់ដេរធំបំផុតនៅអាស៊ី Zhongda Textile City',
    '✈️ រួមបញ្ចូលសំបុត្រយន្តហោះទៅ-មក ភ្នំពេញ-ក្វាងចូវ + សណ្ឋាគារ ៥ ផ្កាយ ៥ យប់'
  ],
  highlightsKm: [
    '👗 ស្វែងរកប្រភពនាំចូលរោងចក្រផ្ទាល់៖ សម្លៀកបំពាក់ ក្រណាត់ វាយនភណ្ឌ ស្បែកជើង និងកាបូប',
    '🏥 ជួបក្រុមហ៊ុនផលិតឧបករណ៍វេជ្ជសាស្ត្រ សម្ភារៈមន្ទីរពេទ្យ ឱសថ និងផលិតផលថែទាំសុខភាព',
    '🪪 សម្រួលបែបបទធ្វើកាត Buyer Badge ផ្លូវការ & VIP Fast-Track ចូលសាលពិព័រណ៍ Pazhou Complex',
    '🗣️ អ្នកបកប្រែចិន-ខ្មែរ-អង់គ្លេស ជួយចរចាតម្លៃ និងកុម្ម៉ង់កាត់ដេរ OEM/ODM',
    '🧵 ទស្សនកិច្ចទីផ្សារបោះដុំក្រណាត់ និងវត្ថុធាតុដើមកាត់ដេរធំបំផុតនៅអាស៊ី Zhongda Textile City',
    '✈️ រួមបញ្ចូលសំបុត្រយន្តហោះទៅ-មក ភ្នំពេញ-ក្វាងចូវ + សណ្ឋាគារ ៥ ផ្កាយ ៥ យប់'
  ],
  highlightsEn: [
    '👗 Direct factory sourcing: Fashion apparel, activewear, textiles, footwear, and designer luggage',
    '🏥 Access audited manufacturers for medical devices, diagnostic kits, and wellness consumables',
    '🪪 Official expedited Canton Fair VIP Buyer Badge issuance with zero queues at Pazhou Complex',
    '🗣️ Trilingual commercial interpreters (Khmer, Chinese, English) for flexible OEM/ODM agreements',
    '🧵 Sourcing excursion to Zhongda International Textile City — Asia\'s largest fabric marketplace',
    '✈️ All-inclusive package: Roundtrip flights Phnom Penh to Guangzhou + 5-Star luxury hotel (5 Nights)'
  ],
  whoShouldJoin: [
    '👗 ម្ចាស់ប្រេនសម្លៀកបំពាក់ ស្បែកជើង កាបូប និងហាងម៉ូដ (Fashion Brand Owners, Apparel & Footwear Retailers)',
    '🧵 អ្នកនាំចូលក្រណាត់ វត្ថុធាតុដើមកាត់ដេរ និងគ្រឿងបន្លាស់ម៉ូដ (Textile, Fabric & Garment Accessory Importers)',
    '📋 អ្នកផ្គត់ផ្គង់សម្ភារៈការិយាល័យ និងសម្ភារៈសិក្សា (Stationery & Corporate Office Supplies Wholesalers)',
    '🏥 សហគ្រិនក្នុងវិស័យសុខាភិបាល ឱសថ និងឧបករណ៍វេជ្ជសាស្ត្រ (Medical Devices, Health & Wellness Sourcing)',
    '🍃 អ្នកនាំចូលផលិតផលចំណីអាហារ អាហារបំប៉ន និងតែពិសេស (Food, Nutritional Supplements & Tea Importers)'
  ],
  whoShouldJoinKm: [
    '👗 ម្ចាស់ប្រេនសម្លៀកបំពាក់ ស្បែកជើង កាបូប និងហាងម៉ូដ (Fashion Brand Owners, Apparel & Footwear Retailers)',
    '🧵 អ្នកនាំចូលក្រណាត់ វត្ថុធាតុដើមកាត់ដេរ និងគ្រឿងបន្លាស់ម៉ូដ (Textile, Fabric & Garment Accessory Importers)',
    '📋 អ្នកផ្គត់ផ្គង់សម្ភារៈការិយាល័យ និងសម្ភារៈសិក្សា (Stationery & Corporate Office Supplies Wholesalers)',
    '🏥 សហគ្រិនក្នុងវិស័យសុខាភិបាល ឱសថ និងឧបករណ៍វេជ្ជសាស្ត្រ (Medical Devices, Health & Wellness Sourcing)',
    '🍃 អ្នកនាំចូលផលិតផលចំណីអាហារ អាហារបំប៉ន និងតែពិសេស (Food, Nutritional Supplements & Tea Importers)'
  ],
  whoShouldJoinEn: [
    '👗 Fashion Brand Creators, Clothing Boutiques & Footwear/Baggage Retailers',
    '🧵 Textile Mills, Fabric Importers & Garment Trims Sourcing Agents',
    '📋 Stationery, Paper Products & Corporate Office Supplies Wholesalers',
    '🏥 Medical Consumables, Diagnostic Kits & Health Equipment Buyers',
    '🍃 Specialty Food, Nutritional Supplements & Health Beverage Importers'
  ],
  whyShouldJoin: [
    '👗 ស្វែងរកប្រភពក្រណាត់ និងម៉ូដសម្លៀកបំពាក់ទាន់សម័យតម្លៃដើមផ្ទាល់ពីរោងចក្រ (Direct Sourcing of Trendsetting Fabrics & Apparel)',
    '🧵 ឱកាសចរចាកិច្ចសន្យាផលិតសម្លៀកបំពាក់ និងកាបូប OEM តាមការចង់បានក្នុងតម្លៃទាប (Custom OEM Apparel & Bag Production at Low MOQ)',
    '🏭 ទស្សនាផ្សារលក់ដុំក្រណាត់ធំបំផុត Zhongda Textile Market នៅក្វាងចូវ (Tour Guangzhou\'s Iconic Zhongda Textile Supermarket)',
    '📑 សេវាអ្នកបកប្រែពាណិជ្ជកម្មជួយពិនិត្យកិច្ចសន្យា និងគំរូទំនិញ Sample (Sample Verification & Negotiation Translator)',
    '🌟 កញ្ចប់ធ្វើដំណើរគ្រប់ជ្រុងជ្រោយ សំបុត្រយន្តហោះ សណ្ឋាគារផ្កាយ ៥ និងការសម្របសម្រួលបែបបទច្បាប់ (Full VIP Package with Flight, 5-Star Hotel & Import Legal Guidance)'
  ],
  whyShouldJoinKm: [
    '👗 ស្វែងរកប្រភពក្រណាត់ និងម៉ូដសម្លៀកបំពាក់ទាន់សម័យតម្លៃដើមផ្ទាល់ពីរោងចក្រ (Direct Sourcing of Trendsetting Fabrics & Apparel)',
    '🧵 ឱកាសចរចាកិច្ចសន្យាផលិតសម្លៀកបំពាក់ និងកាបូប OEM តាមការចង់បានក្នុងតម្លៃទាប (Custom OEM Apparel & Bag Production at Low MOQ)',
    '🏭 ទស្សនាផ្សារលក់ដុំក្រណាត់ធំបំផុត Zhongda Textile Market នៅក្វាងចូវ (Tour Guangzhou\'s Iconic Zhongda Textile Supermarket)',
    '📑 សេវាអ្នកបកប្រែពាណិជ្ជកម្មជួយពិនិត្យកិច្ចសន្យា និងគំរូទំនិញ Sample (Sample Verification & Negotiation Translator)',
    '🌟 កញ្ចប់ធ្វើដំណើរគ្រប់ជ្រុងជ្រោយ សំបុត្រយន្តហោះ សណ្ឋាគារផ្កាយ ៥ និងការសម្របសម្រួលបែបបទច្បាប់ (Full VIP Package with Flight, 5-Star Hotel & Import Legal Guidance)'
  ],
  whyShouldJoinEn: [
    '👗 Source the latest fabric innovations, activewear textiles, and fashion accessories directly from certified mills',
    '🧵 Negotiate flexible OEM/ODM manufacturing contracts with low Minimum Order Quantities (MOQs)',
    '🏭 Exclusive guided expedition to the world-famous Zhongda Fabric & Garment Accessory Wholesale Market',
    '📑 Dedicated bilingual trade interpreters to review product samples, specs, lab testing, and supplier contracts',
    '🌟 Turnkey corporate mission package featuring direct flights, 5-star Pazhou accommodations, and Cambodia customs roadmap'
  ],
  inclusions: [
    'សំបុត្រយន្តហោះទៅ-មក ភ្នំពេញ - ក្វាងចូវ (Roundtrip Flight PNH - CAN)',
    'សណ្ឋាគារប្រណិតកម្រិត ៥ ផ្កាយ (៥ យប់ នៅក្រុងក្វាងចូវ)',
    'សេវាធ្វើកាត VIP Buyer Badge ផ្លូវការចូល Canton Fair Phase 3',
    'រថយន្ត VIP ជូនដំណើរពេញដំណើរកម្សាន្ត និងទៅ Pazhou Complex',
    'អាហារប៊ូហ្វេពេលព្រឹក និងអាហារពេលល្ងាចម្ហូបក្វាងទុងពិសេស',
    'អ្នកបកប្រែភាសាចិន-ខ្មែរ-អង់គ្លេស ជួយចរចា និងចុះកិច្ចសន្យា',
    'ធានារ៉ាប់រងការធ្វើដំណើរបេសកកម្មអន្តរជាតិ'
  ],
  inclusionsKm: [
    'សំបុត្រយន្តហោះទៅ-មក ភ្នំពេញ - ក្វាងចូវ (Roundtrip Flight PNH - CAN)',
    'សណ្ឋាគារប្រណិតកម្រិត ៥ ផ្កាយ (៥ យប់ នៅក្រុងក្វាងចូវ)',
    'សេវាធ្វើកាត VIP Buyer Badge ផ្លូវការចូល Canton Fair Phase 3',
    'រថយន្ត VIP ជូនដំណើរពេញដំណើរកម្សាន្ត និងទៅ Pazhou Complex',
    'អាហារប៊ូហ្វេពេលព្រឹក និងអាហារពេលល្ងាចម្ហូបក្វាងទុងពិសេស',
    'អ្នកបកប្រែភាសាចិន-ខ្មែរ-អង់គ្លេស ជួយចរចា និងចុះកិច្ចសន្យា',
    'ធានារ៉ាប់រងការធ្វើដំណើរបេសកកម្មអន្តរជាតិ'
  ],
  inclusionsEn: [
    'Roundtrip International Flights: Phnom Penh (PNH) to Guangzhou (CAN) with luggage allowance',
    '5-Star Luxury Accommodations in Guangzhou (5 Nights in Pazhou/Tianhe District)',
    'Official Canton Fair Phase 3 VIP Buyer Badge issuance & expedited registration',
    'Dedicated VIP air-conditioned coach transfers for all daily scheduled trips',
    'Daily Hotel Buffet Breakfasts & Authentic Cantonese Banquets',
    'Trilingual Commercial Business Interpreters (Khmer, Mandarin Chinese, English)',
    'Comprehensive International Business Travel & Medical Insurance Coverage'
  ],
  exclusions: [
    'ទិដ្ឋាការចូលប្រទេសចិន China Visa Fee (KHB ជួយរៀបចំ Official Invitation Letter)',
    'ការចំណាយផ្ទាល់ខ្លួន និងទម្ងន់វ៉ាលីសលើសកំណត់',
    'ថ្លៃដឹកជញ្ជូនទំនិញ ឬទិញទំនិញផ្ទាល់ខ្លួន'
  ],
  exclusionsKm: [
    'ទិដ្ឋាការចូលប្រទេសចិន China Visa Fee (KHB ជួយរៀបចំ Official Invitation Letter)',
    'ការចំណាយផ្ទាល់ខ្លួន និងទម្ងន់វ៉ាលីសលើសកំណត់',
    'ថ្លៃដឹកជញ្ជូនទំនិញ ឬទិញទំនិញផ្ទាល់ខ្លួន'
  ],
  exclusionsEn: [
    'China Entry Visa processing fee (KHB provides Official Invitation Letter)',
    'Personal expenditures (souvenirs, private laundry, telecommunications, minibar)',
    'International freight, shipping container fees, or commercial sample cargo costs'
  ],
  termsAndConditions: [
    'លិខិតឆ្លងដែន Passport ត្រូវមានសុពលភាពយ៉ាងតិច ៦ ខែគិតចាប់ពីថ្ងៃចេញដំណើរ។',
    'តម្រូវឱ្យកក់ប្រាក់កក់ចំនួន 50% នៅពេលចុះឈ្មោះដើម្បីធានាសំបុត្រយន្តហោះ និងសណ្ឋាគារ ៥ ផ្កាយ។',
    'KHB នឹងចេញលិខិតអញ្ជើញពាណិជ្ជកម្មផ្លូវការ (Official Canton Fair Invitation) សម្រាប់ធ្វើ Visa ចិន។',
    'ឈប់ទទួលចុះឈ្មោះមុនថ្ងៃទី 05 ខែតុលា ឆ្នាំ 2026 ឬនៅពេលគ្រប់ចំនួនគណៈប្រតិភូ 25 នាក់។'
  ],
  termsAndConditionsKm: [
    'លិខិតឆ្លងដែន Passport ត្រូវមានសុពលភាពយ៉ាងតិច ៦ ខែគិតចាប់ពីថ្ងៃចេញដំណើរ។',
    'តម្រូវឱ្យកក់ប្រាក់កក់ចំនួន 50% នៅពេលចុះឈ្មោះដើម្បីធានាសំបុត្រយន្តហោះ និងសណ្ឋាគារ ៥ ផ្កាយ។',
    'KHB នឹងចេញលិខិតអញ្ជើញពាណិជ្ជកម្មផ្លូវការ (Official Canton Fair Invitation) សម្រាប់ធ្វើ Visa ចិន។',
    'ឈប់ទទួលចុះឈ្មោះមុនថ្ងៃទី 05 ខែតុលា ឆ្នាំ 2026 ឬនៅពេលគ្រប់ចំនួនគណៈប្រតិភូ 25 នាក់។'
  ],
  termsAndConditionsEn: [
    'Passport must maintain a minimum validity of 6 months from the date of departure.',
    'A 50% initial deposit is required upon delegate registration to secure 5-star hotel & flights.',
    'KHB Events issues official corporate invitation letters for Chinese commercial visa applications.',
    'Registration closes October 5, 2026 or upon reaching the maximum capacity of 25 delegates.'
  ],
  tags: ['trending', 'popular', 'cultural'],
  emergencyContact: {
    country: 'China (Guangzhou & Guangdong Province)',
    police: '110',
    ambulance: '120',
    touristHelpline: '060 815 515 (Mr. Tim Vutha)',
    embassySupport: '+86 20 8384 9400 (Royal Consulate General of Cambodia in Guangzhou)'
  },
  tourGuide: {
    name: 'Mr. Tim Vutha & China Operations Escort Team',
    nameKm: 'លោក ទឹម វុទ្ធា & ក្រុមការងារសម្របសម្រួលចិន',
    nameEn: 'Mr. Tim Vutha & China Operations Escort Team',
    title: 'Lead Trade Mission Director (Cambodia-China Trade)',
    titleKm: 'ប្រធានដឹកនាំបេសកកម្មពាណិជ្ជកម្ម (កម្ពុជា-ចិន)',
    titleEn: 'Lead Trade Mission Director (Cambodia-China Trade)',
    phone: '060 815 515',
    telegram: 'https://t.me/VuthaTim',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    badgeNumber: 'KHB-CANTON-2026-03',
    bio: 'Senior trade escort specialist with extensive experience in garment manufacturing, textile sourcing, and medical device procurement across Guangzhou and Zhejiang.',
    bioKm: 'អ្នកជំនាញសម្របសម្រួលបេសកកម្មពាណិជ្ជកម្មជាន់ខ្ពស់ ប្រកបដោយបទពិសោធន៍ទូលំទូលាយក្នុងវិស័យកាត់ដេរ វាយនភណ្ឌ និងឧបករណ៍វេជ្ជសាស្ត្រនៅក្វាងចូវ និងចេជាំង។',
    bioEn: 'Senior trade escort specialist with extensive experience in garment manufacturing, textile sourcing, and medical device procurement across Guangzhou and Zhejiang.',
    languages: ['Khmer', 'Chinese (Mandarin)', 'English'],
    briefingMeetingPoint: 'Phnom Penh International Airport (PNH) International Departure Gate',
    briefingMeetingPointKm: 'ព្រលានយន្តហោះអន្តរជាតិភ្នំពេញ (PNH) ច្រកចេញដំណើរអន្តរជាតិ - បញ្ជរ KHB VIP',
    briefingMeetingPointEn: 'Phnom Penh International Airport (PNH) International Departure Gate - KHB VIP Desk',
    briefingTime: '07:30 AM (Oct 31, 2026)',
    briefingTimeKm: '07:30 AM (ថ្ងៃទី 31/10/2026)',
    briefingTimeEn: '07:30 AM (Oct 31, 2026)'
  },
  itinerary: [
    {
      day: 1,
      title: 'ភ្នំពេញ - ក្វាងចូវ - ទទួលកាត Buyer Badge & ពិធីស្វាគមន៍គណៈប្រតិភូ',
      titleKm: 'ភ្នំពេញ - ក្វាងចូវ - ទទួលកាត Buyer Badge & ពិធីស្វាគមន៍គណៈប្រតិភូ',
      titleEn: 'Phnom Penh to Guangzhou - Buyer Badge Registration & Welcome Delegation Banquet',
      description: 'ហោះហើរទៅក្វាងចូវ សម្រួលកាត Buyer Badge ចូលឆែកអ៊ីនសណ្ឋាគារ ៥ ផ្កាយ និងពិសារអាហារពេលល្ងាចស្វាគមន៍។',
      descriptionKm: 'ហោះហើរទៅក្វាងចូវ សម្រួលកាត Buyer Badge ចូលឆែកអ៊ីនសណ្ឋាគារ ៥ ផ្កាយ និងពិសារអាហារពេលល្ងាចស្វាគមន៍។',
      descriptionEn: 'Direct international flight to Guangzhou (CAN). Expedited VIP Buyer Badge pickup, 5-star hotel check-in, and Grand Cantonese Welcome Banquet.',
      hotelName: 'Guangzhou Marriott Pazhou (5-Star)',
      hotelNameKm: 'សណ្ឋាគារ Guangzhou Marriott Pazhou (កម្រិត ៥ ផ្កាយ)',
      hotelNameEn: 'Guangzhou Marriott Pazhou (5-Star Luxury)',
      mealsIncluded: ['Breakfast', 'Welcome Banquet'],
      mealsIncludedKm: ['អាហារពេលព្រឹក', 'ពិធីលៀងសាយភាយស្វាគមន៍'],
      mealsIncludedEn: ['In-Flight / Hotel Breakfast', 'Grand Welcome Gala Banquet'],
      guideAgenda: [
        { time: '08:00 AM - 10:00 AM', activity: 'ជួបជុំគណៈប្រតិភូនៅព្រលានយន្តហោះភ្នំពេញ', activityKm: 'ជួបជុំគណៈប្រតិភូនៅព្រលានយន្តហោះភ្នំពេញ', activityEn: 'Delegation Assembly at Phnom Penh Airport', location: 'Phnom Penh Airport', locationKm: 'ព្រលានយន្តហោះភ្នំពេញ', locationEn: 'Phnom Penh International Airport' },
        { time: '10:30 AM - 02:15 PM', activity: 'ជើងហោះហើរត្រង់ ភ្នំពេញ ទៅ ក្វាងចូវ', activityKm: 'ជើងហោះហើរត្រង់ ភ្នំពេញ ទៅ ក្វាងចូវ', activityEn: 'Direct Flight: Phnom Penh (PNH) to Guangzhou (CAN)', location: 'Flight PNH -> CAN', locationKm: 'ជើងហោះហើរ PNH -> CAN', locationEn: 'Flight PNH -> CAN' },
        { time: '03:45 PM - 05:30 PM', activity: 'ទទួលកាត VIP Buyer Badge & ឆែកអ៊ីនសណ្ឋាគារ ៥ ផ្កាយ', activityKm: 'ទទួលកាត VIP Buyer Badge & ឆែកអ៊ីនសណ្ឋាគារ ៥ ផ្កាយ', activityEn: 'VIP Fast-Track Canton Fair Badge Pickup & 5-Star Hotel Check-in', location: 'Pazhou Center', locationKm: 'Pazhou Registration Center', locationEn: 'Pazhou Registration Center' },
        { time: '06:30 PM - 09:00 PM', activity: 'ពិធីលៀងសាយភាយស្វាគមន៍គណៈប្រតិភូ', activityKm: 'ពិធីលៀងសាយភាយស្វាគមន៍គណៈប្រតិភូ', activityEn: 'Official Delegation Welcome Gala Dinner', location: 'Grand Ballroom', locationKm: 'សាលពិធីធំសណ្ឋាគារ', locationEn: 'Hotel Grand Ballroom' }
      ]
    },
    {
      day: 2,
      title: 'Canton Fair Phase 3 (ថ្ងៃទី ១): សម្លៀកបំពាក់ វាយនភណ្ឌ ស្បែកជើង & កាបូប',
      titleKm: 'Canton Fair Phase 3 (ថ្ងៃទី ១): សម្លៀកបំពាក់ វាយនភណ្ឌ ស្បែកជើង & កាបូប',
      titleEn: 'Canton Fair Phase 3 (Day 1): Fashion Apparel, Fabrics, Footwear, Leather Goods & Luggage',
      description: 'ពេញមួយថ្ងៃនៅ Pazhou Complex ជួបក្រុមហ៊ុនផលិតសម្លៀកបំពាក់ ស្បែកជើង កាបូប និងក្រណាត់វាយនភណ្ឌ។',
      descriptionKm: 'ពេញមួយថ្ងៃនៅ Pazhou Complex ជួបក្រុមហ៊ុនផលិតសម្លៀកបំពាក់ ស្បែកជើង កាបូប និងក្រណាត់វាយនភណ្ឌ។',
      descriptionEn: 'Full-day factory sourcing across Pazhou Complex (Areas A & B). Meet direct suppliers of men\'s/women\'s apparel, activewear, footwear, and travel luggage.',
      hotelName: 'Guangzhou Marriott Pazhou (5-Star)',
      hotelNameKm: 'សណ្ឋាគារ Guangzhou Marriott Pazhou (កម្រិត ៥ ផ្កាយ)',
      hotelNameEn: 'Guangzhou Marriott Pazhou (5-Star Luxury)',
      mealsIncluded: ['Buffet Breakfast', 'VIP Lunch', 'Dinner'],
      mealsIncludedKm: ['អាហារពេលព្រឹកប៊ូហ្វេ', 'អាហារថ្ងៃត្រង់ VIP', 'អាហារពេលល្ងាច'],
      mealsIncludedEn: ['Hotel Buffet Breakfast', 'VIP Networking Lunch', 'Dinner'],
      guideAgenda: [
        { time: '09:00 AM - 12:30 PM', activity: 'ទស្សនា Hall 1-4: សម្លៀកបំពាក់បុរស-នារី និងម៉ូតសម្លៀកបំពាក់ទាន់សម័យ', activityKm: 'ទស្សនា Hall 1-4: សម្លៀកបំពាក់បុរស-នារី និងម៉ូតសម្លៀកបំពាក់ទាន់សម័យ', activityEn: 'Hall 1-4 Sourcing: Men\'s & Women\'s Fashion Apparel, Casual Wear & Sportswear', location: 'Pazhou Complex Area A', locationKm: 'Pazhou Complex តំបន់ A', locationEn: 'Pazhou Complex Area A' },
        { time: '01:30 PM - 05:30 PM', activity: 'ទស្សនា Hall 5-7: ស្បែកជើង កាបូបធ្វើដំណើរ និងសម្ភារៈស្បែក', activityKm: 'ទស្សនា Hall 5-7: ស្បែកជើង កាបូបធ្វើដំណើរ និងសម្ភារៈស្បែក', activityEn: 'Hall 5-7 Sourcing: Fashion Footwear, Hard/Soft Luggage, Backpacks & Leather Trims', location: 'Pazhou Complex Area B', locationKm: 'Pazhou Complex តំបន់ B', locationEn: 'Pazhou Complex Area B' }
      ]
    },
    {
      day: 3,
      title: 'Canton Fair Phase 3 (ថ្ងៃទី ២): ឧបករណ៍វេជ្ជសាស្ត្រ ឱសថ & ម្ហូបអាហារ',
      titleKm: 'Canton Fair Phase 3 (ថ្ងៃទី ២): ឧបករណ៍វេជ្ជសាស្ត្រ ឱសថ & ម្ហូបអាហារ',
      titleEn: 'Canton Fair Phase 3 (Day 2): Medical & Health Devices, Pharmaceuticals, Stationery & Food',
      description: 'ទស្សនាឧបករណ៍វេជ្ជសាស្ត្រ សម្ភារៈមន្ទីរពេទ្យ អាហារបំប៉នសុខភាព និងម្ហូបអាហារកែច្នៃនាំចេញ។',
      descriptionKm: 'ទស្សនាឧបករណ៍វេជ្ជសាស្ត្រ សម្ភារៈមន្ទីរពេទ្យ អាហារបំប៉នសុខភាព និងម្ហូបអាហារកែច្នៃនាំចេញ។',
      descriptionEn: 'Inspect diagnostic medical supplies, hospital consumables, health supplements, and international export foods. Evening Pearl River Skyline Cruise.',
      hotelName: 'Guangzhou Marriott Pazhou (5-Star)',
      hotelNameKm: 'សណ្ឋាគារ Guangzhou Marriott Pazhou (កម្រិត ៥ ផ្កាយ)',
      hotelNameEn: 'Guangzhou Marriott Pazhou (5-Star Luxury)',
      mealsIncluded: ['Buffet Breakfast', 'Lunch', 'Dinner'],
      mealsIncludedKm: ['អាហារពេលព្រឹកប៊ូហ្វេ', 'អាហារថ្ងៃត្រង់', 'អាហារពេលល្ងាច'],
      mealsIncludedEn: ['Hotel Buffet Breakfast', 'Executive Lunch', 'Pearl River Cruise Banquet'],
      guideAgenda: [
        { time: '09:00 AM - 12:30 PM', activity: 'ទស្សនា Hall 8-10: ឧបករណ៍វេជ្ជសាស្ត្រ បរិក្ខារមន្ទីរពេទ្យ និងផលិតផលថែទាំសុខភាព', activityKm: 'ទស្សនា Hall 8-10: ឧបករណ៍វេជ្ជសាស្ត្រ បរិក្ខារមន្ទីរពេទ្យ និងផលិតផលថែទាំសុខភាព', activityEn: 'Hall 8-10 Sourcing: Diagnostic Medical Equipment, Rehabilitation & Health Consumables', location: 'Pazhou Complex Area B', locationKm: 'Pazhou Complex តំបន់ B', locationEn: 'Pazhou Complex Area B' },
        { time: '01:30 PM - 05:00 PM', activity: 'ទស្សនា Hall 11-13: ម្ហូបអាហារកែច្នៃ តែ និងកសិផលនាំចេញអន្តរជាតិ', activityKm: 'ទស្សនា Hall 11-13: ម្ហូបអាហារកែច្នៃ តែ និងកសិផលនាំចេញអន្តរជាតិ', activityEn: 'Hall 11-13 Sourcing: Processed Food Products, Specialty Teas & Nutritional Items', location: 'Pazhou Complex Area C', locationKm: 'Pazhou Complex តំបន់ C', locationEn: 'Pazhou Complex Area C' },
        { time: '06:30 PM - 09:00 PM', activity: 'ជិះទូកកម្សាន្តទន្លេគុជ Pearl River Night Cruise', activityKm: 'ជិះទូកកម្សាន្តទន្លេគុជ Pearl River Night Cruise', activityEn: 'Pearl River Luxury Night Skyline Cruise & Banquet', location: 'Pearl River Pier', locationKm: 'កំពង់ផែទន្លេគុជ', locationEn: 'Pearl River Pier' }
      ]
    },
    {
      day: 4,
      title: 'ទស្សនកិច្ចផ្សារបោះដុំក្រណាត់ធំបំផុតនៅអាស៊ី Zhongda International Textile City',
      titleKm: 'ទស្សនកិច្ចផ្សារបោះដុំក្រណាត់ធំបំផុតនៅអាស៊ី Zhongda International Textile City',
      titleEn: 'Zhongda International Textile City: Asia\'s Largest Fabric & Garment Accessory Wholesale Superhub',
      description: 'ទស្សនកិច្ចផ្សារបោះដុំក្រណាត់ និងវត្ថុធាតុដើមកាត់ដេរធំបំផុតនៅអាស៊ី Zhongda Fabric & Accessories Market។',
      descriptionKm: 'ទស្សនកិច្ចផ្សារបោះដុំក្រណាត់ និងវត្ថុធាតុដើមកាត់ដេរធំបំផុតនៅអាស៊ី Zhongda Fabric & Accessories Market។',
      descriptionEn: 'Field study to Zhongda International Textile City. Explore 10,000+ fabric mills, sample pattern books, buttons, zippers, and custom garment trims.',
      hotelName: 'Guangzhou Marriott Pazhou (5-Star)',
      hotelNameKm: 'សណ្ឋាគារ Guangzhou Marriott Pazhou (កម្រិត ៥ ផ្កាយ)',
      hotelNameEn: 'Guangzhou Marriott Pazhou (5-Star Luxury)',
      mealsIncluded: ['Buffet Breakfast', 'Lunch', 'Dinner'],
      mealsIncludedKm: ['អាហារពេលព្រឹកប៊ូហ្វេ', 'អាហារថ្ងៃត្រង់', 'អាហារពេលល្ងាច'],
      mealsIncludedEn: ['Hotel Buffet Breakfast', 'Regional Textile Hub Lunch', 'Dinner'],
      guideAgenda: [
        { time: '09:00 AM - 12:30 PM', activity: 'ទស្សនកិច្ច និងជ្រើសរើសគំរូក្រណាត់ Zhongda Fabric Market', activityKm: 'ទស្សនកិច្ច និងជ្រើសរើសគំរូក្រណាត់ Zhongda Fabric Market', activityEn: 'Zhongda Fabric Market Sample Selection & Direct Mill Sourcing', location: 'Zhongda International Textile City', locationKm: 'ផ្សារក្រណាត់ Zhongda', locationEn: 'Zhongda International Textile City' },
        { time: '01:30 PM - 05:00 PM', activity: 'ទស្សនាផ្សារបោះដុំគ្រឿងតុបតែងកាត់ដេរ និងឡេវ/ខ្សែរ៉ូត Accessories Market', activityKm: 'ទស្សនាផ្សារបោះដុំគ្រឿងតុបតែងកាត់ដេរ និងឡេវ/ខ្សែរ៉ូត Accessories Market', activityEn: 'Zhongda Garment Accessories: Zippers, Buttons, Labels & Trims Wholesale Sourcing', location: 'Zhongda Garment Accessories', locationKm: 'ផ្សារគ្រឿងតុបតែងកាត់ដេរ Zhongda', locationEn: 'Zhongda Garment Accessories Market' }
      ]
    },
    {
      day: 5,
      title: 'ជំនួបពាណិជ្ជកម្ម B2B & ផ្សារលក់ដុំស្បែកជើង Zhanxi Road Shoe Market',
      titleKm: 'ជំនួបពាណិជ្ជកម្ម B2B & ផ្សារលក់ដុំស្បែកជើង Zhanxi Road Shoe Market',
      titleEn: '1-on-1 Bilateral B2B Matchmaking & Zhanxi Road Footwear/Bag Wholesale Center',
      description: 'ជំនួបពាណិជ្ជកម្មទល់មុខ និងទស្សនាផ្សារលក់ដុំស្បែកជើង និងកាបូបធំបំផុត Zhanxi Road Shoe Plaza។',
      descriptionKm: 'ជំនួបពាណិជ្ជកម្មទល់មុខ និងទស្សនាផ្សារលក់ដុំស្បែកជើង និងកាបូបធំបំផុត Zhanxi Road Shoe Plaza។',
      descriptionEn: 'Morning pre-arranged B2B trade conference with verified suppliers. Afternoon guided sourcing walk at Zhanxi Road wholesale shoe & bag plaza.',
      hotelName: 'Guangzhou Marriott Pazhou (5-Star)',
      hotelNameKm: 'សណ្ឋាគារ Guangzhou Marriott Pazhou (កម្រិត ៥ ផ្កាយ)',
      hotelNameEn: 'Guangzhou Marriott Pazhou (5-Star Luxury)',
      mealsIncluded: ['Buffet Breakfast', 'Lunch', 'Farewell Banquet'],
      mealsIncludedKm: ['អាហារពេលព្រឹកប៊ូហ្វេ', 'អាហារថ្ងៃត្រង់', 'ពិធីលៀងសាយភាយលាគ្នា'],
      mealsIncludedEn: ['Hotel Buffet Breakfast', 'Executive Lunch', 'Official Farewell Banquet'],
      guideAgenda: [
        { time: '09:00 AM - 12:00 PM', activity: 'ជំនួបពាណិជ្ជកម្មទល់មុខ B2B Matchmaking Session', activityKm: 'ជំនួបពាណិជ្ជកម្មទល់មុខ B2B Matchmaking Session', activityEn: 'Bilateral B2B Trade Matchmaking Conference', location: 'Hotel Business Center', locationKm: 'មជ្ឈមណ្ឌលធុរកិច្ចសណ្ឋាគារ', locationEn: 'Hotel Business Center' },
        { time: '02:00 PM - 05:30 PM', activity: 'ទស្សនកិច្ចផ្សារបោះដុំស្បែកជើង និងកាបូប Zhanxi Road Wholesale Center', activityKm: 'ទស្សនកិច្ចផ្សារបោះដុំស្បែកជើង និងកាបូប Zhanxi Road Wholesale Center', activityEn: 'Zhanxi Road Footwear, Sneakers & Luggage Wholesale Supermarket Walkthrough', location: 'Zhanxi Road Shoe Market', locationKm: 'ផ្សារស្បែកជើង Zhanxi Road', locationEn: 'Zhanxi Road Shoe Market' },
        { time: '06:30 PM - 09:30 PM', activity: 'ពិធីជប់លៀងលាគ្នា Executive Farewell Banquet', activityKm: 'ពិធីជប់លៀងលាគ្នា Executive Farewell Banquet', activityEn: 'Official Delegation Farewell Seafood Banquet', location: 'Seafood Banquet Hall', locationKm: 'សាលពិធីលៀងសាយភាយ', locationEn: 'Seafood Banquet Hall' }
      ]
    },
    {
      day: 6,
      title: 'ទិញទំនិញ Beijing Road - ហោះហើរត្រឡប់មកភ្នំពេញ',
      titleKm: 'ទិញទំនិញ Beijing Road - ហោះហើរត្រឡប់មកភ្នំពេញ',
      titleEn: 'Beijing Road Retail Discovery - Scheduled Return Flight to Phnom Penh',
      description: 'ទស្សនាផ្លូវថ្មើរជើង Beijing Road មុនពេលរថយន្ត VIP ជូនដំណើរទៅព្រលានយន្តហោះ Baiyun ដើម្បីហោះហើរត្រឡប់មកភ្នំពេញ។',
      descriptionKm: 'ទស្សនាផ្លូវថ្មើរជើង Beijing Road មុនពេលរថយន្ត VIP ជូនដំណើរទៅព្រលានយន្តហោះ Baiyun ដើម្បីហោះហើរត្រឡប់មកភ្នំពេញ។',
      descriptionEn: 'Morning cultural discovery and shopping along Beijing Road Pedestrian Street. Authentic Dim Sum lunch, followed by airport transfer for flight back to Phnom Penh.',
      hotelName: 'Trip Completion (Phnom Penh Arrival)',
      hotelNameKm: 'បញ្ចប់ដំណើរបេសកកម្ម (មកដល់ភ្នំពេញ)',
      hotelNameEn: 'Mission Completion (Arrival in Phnom Penh)',
      mealsIncluded: ['Buffet Breakfast', 'Dim Sum Lunch'],
      mealsIncludedKm: ['អាហារពេលព្រឹកប៊ូហ្វេ', 'អាហារថ្ងៃត្រង់ ឌីមសាំ'],
      mealsIncludedEn: ['Hotel Buffet Breakfast', 'Guangdong Dim Sum Farewell Lunch'],
      guideAgenda: [
        { time: '09:00 AM - 12:00 PM', activity: 'ទស្សនា និងទិញទំនិញនៅផ្លូវថ្មើរជើង Beijing Road', activityKm: 'ទស្សនា និងទិញទំនិញនៅផ្លូវថ្មើរជើង Beijing Road', activityEn: 'Beijing Road Pedestrian Street Shopping & Cultural Heritage', location: 'Beijing Road', locationKm: 'ផ្លូវថ្មើរជើង Beijing Road', locationEn: 'Beijing Road Pedestrian Street' },
        { time: '12:30 PM - 01:30 PM', activity: 'អាហារថ្ងៃត្រង់ ឌីមសាំក្វាងទុងពិសេស', activityKm: 'អាហារថ្ងៃត្រង់ ឌីមសាំក្វាងទុងពិសេស', activityEn: 'Guangdong Dim Sum Gastronomic Lunch', location: 'Dim Sum Restaurant', locationKm: 'ភោជនីយដ្ឋានឌីមសាំ', locationEn: 'Dim Sum Restaurant' },
        { time: '03:00 PM - 04:30 PM', activity: 'រថយន្ត VIP ជូនដំណើរទៅព្រលានយន្តហោះ Baiyun (CAN)', activityKm: 'រថយន្ត VIP ជូនដំណើរទៅព្រលានយន្តហោះ Baiyun (CAN)', activityEn: 'Airport Transfer to Guangzhou Baiyun International Airport', location: 'Guangzhou Airport', locationKm: 'ព្រលានយន្តហោះ Baiyun', locationEn: 'Guangzhou Baiyun Airport (CAN)' },
        { time: '06:30 PM - 08:30 PM', activity: 'ជើងហោះហើរត្រង់មកដល់ភ្នំពេញដោយជោគជ័យ', activityKm: 'ជើងហោះហើរត្រង់មកដល់ភ្នំពេញដោយជោគជ័យ', activityEn: 'Flight Arrival at Phnom Penh International Airport (PNH) - Mission Accomplished', location: 'Phnom Penh Arrival', locationKm: 'មកដល់ភ្នំពេញ', locationEn: 'Phnom Penh International Airport' }
      ]
    }
  ]
};

export const INITIAL_PACKAGES: TourPackage[] = [
  OFFICIAL_BIZTRIP_PACKAGE,
  CANTON_FAIR_PHASE_1_PACKAGE,
  CANTON_FAIR_PHASE_2_PACKAGE,
  CANTON_FAIR_PHASE_3_PACKAGE
];
export const INITIAL_BOOKINGS: Booking[] = [];
export const INITIAL_INVOICES: Invoice[] = [];
export const INITIAL_CHATS: SupportChat[] = [];
export const SEED_REVIEWS: Review[] = [];

export const SEED_SUPPLIERS: Supplier[] = [];
export const SEED_COST_TEMPLATES: CostTemplate[] = [];
export const SEED_PURCHASE_ORDERS: PurchaseOrder[] = [];
export const SEED_CUSTOMER_PAYMENTS: CustomerPayment[] = [];
export const SEED_SUPPLIER_PAYMENTS: SupplierPayment[] = [];
export const SEED_EXPENSES: Expense[] = [];
export const SEED_DELETED_ITEMS: DeletedItemRecord[] = [];

export const SEED_BOOKINGS: Booking[] = INITIAL_BOOKINGS;
export const SEED_INVOICES: Invoice[] = INITIAL_INVOICES;
export const SEED_SUPPORT_CHATS: SupportChat[] = INITIAL_CHATS;

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  enableExploreCuratedTours: true,
  enableAiCopilot: true,
  enableCustomerBooking: true,
  enableEarlyBirdDiscount: true,
  enableTaxInvoicing: true,
  enableSupportChat: true,
  enableDataRecovery: true,
  enableOfflineCache: true,
  enablePushNotifications: true,
  paymentGateways: {
    cards: true,
    abaPayWay: true,
    acledaXPay: true,
    wingBank: true,
    applePay: true,
    googlePay: true,
    biometricWallet: true,
  },
  taxRatePercent: 7.0,
  defaultAdultMarginPercent: 25.0,
  defaultChildDiscountPercent: 20.0,
  defaultMinGroupSize: 30,
  autoPurgeTrashDays: 0,

  // Official Trade Mission & Coordinator Profile
  companyName: 'KHB Events Co., Ltd. — Cambodia Trade Delegation',
  companyTagline: 'Connecting Cambodian Business Leaders & Importers to Global Trade Hubs & Canton Fair',
  companyWebsite: 'https://khbevents.com',
  companyLogoUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=200&auto=format&fit=crop&q=80',
  companyBannerUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
  tradeMissionTheme: 'Official B2B Factory Matchmaking & High-Level Bilateral Delegation 2026',
  tradeMissionAccreditation: 'Official Tour Operator & Delegation Partner — Approved by Ministry of Tourism & MoC',

  // Government Statutory & Compliance
  companyRegistrationNumber: 'MOC-00049281-2024',
  tourismLicenseNumber: 'MOT-KH-B2B-2026-092',
  taxVatNumber: 'VAT-KHB-2026-8899',

  // Lead Trade Mission Coordinator
  leadCoordinatorName: 'Mr. Tim Vutha',
  leadCoordinatorTitle: 'Chief Trade Mission Director & B2B Delegation Head',
  leadCoordinatorBio: 'Senior Trade Facilitator with 12+ years orchestrating bilateral business delegations, VIP factory visits, and Canton Fair international procurement missions for Cambodian enterprises.',
  leadCoordinatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  leadCoordinatorPhone: '060 815 515',
  leadCoordinatorTelegram: 'https://t.me/VuthaTim',
  leadCoordinatorEmail: 'vutha.tim@khbmedia.asia',
  leadCoordinatorWeChat: 'TimVutha_KHB',
  leadCoordinatorSignatureUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80',

  // Headquarters & Emergency Helpline
  companyAddress: '#128, Preah Norodom Blvd, Sangkat Tonle Bassac, Khan Chamkarmon',
  companyCityCountry: 'Phnom Penh, Cambodia',
  companyPostalCode: '120101',
  companyPhone: '+855 (0) 23 999 888',
  companyEmail: 'contact@khbevents.com',
  emergencyHotline: '+855 60 815 515 (24/7 VIP Concierge Desk)',
  delegationSupportDesk: 'Hotel Landmark Canton Executive Lounge Desk & KHB Pavilion China Liaison',

  // Corporate Settlement Banking Rails
  bankName: 'ABA Bank (Advanced Bank of Asia Ltd.)',
  bankAccountName: 'KHB EVENTS CO., LTD.',
  bankAccountNumber: '000 888 999 (USD) / KHQR: khb.events@aba',
  bankSwiftBic: 'ABAAKHPP',
  bankBranch: 'Central Head Office Branch, Phnom Penh',

  // Social & Delegation Broadcasts
  telegramChannel: 'https://t.me/khbtradehub',
  facebookUrl: 'https://facebook.com/khbevents',
  linkedinUrl: 'https://linkedin.com/company/khb-events',

  // Security
  restrictAdminDomain: true,
  allowedAdminDomain: 'khbevents.com',
  enableBiometricAuth: true,

  // UI Theme, Palette & Typography Scaling Defaults
  themePreset: 'navy',
  defaultMapMode: 'dark_matter',
  primaryColor: '#0284c7',
  secondaryColor: '#0f172a',
  accentColor: '#f59e0b',
  fontSizeScale: 'normal',
  fontFamilyLatin: 'plus-jakarta',
  fontFamilyKhmer: 'kantumruy-pro',
  fontFamilyHeading: 'inherit',
  headingFontWeight: 'bold',
  fontLineHeight: 'normal',
  fontLetterSpacing: 'normal',
  fontSmoothing: 'antialiased',
  fontBoldBoost: false,
  textAlign: 'left',
  paragraphSpacing: 'normal',
  contentPadding: 'normal',
  borderRadiusPreset: 'rounded',
  headingTransform: 'none',
  headingLetterSpacing: 'normal',
  highContrastText: true,
  cardBorderWidth: 'thin',
  textShadowPreset: 'none',

  // Language & Internationalization Controls
  defaultLanguage: 'en',
  enabledLanguages: ['en', 'km', 'ar', 'he', 'es', 'ja', 'zh', 'vi', 'th', 'fr', 'ko', 'de'],
  autoDetectBrowserLanguage: true,
  enableAiAutoTranslation: true,
  showLanguageSwitcher: true,

  // CRM & Webhook Integration
  crmConfig: {
    crmEndpointUrl: 'https://khbcrm.vercel.app/api/v1/bookings',
    crmApiToken: 'khb_live_api_key_2026_master',
    crmAuthType: 'api_key',
    crmHeaderKey: 'x-api-key',
    crmWebhookSecret: 'khb_live_api_key_2026_master',
    crmAutoSyncBookings: true,
    crmAutoSyncCustomers: true,
    crmOrganizationId: 'KHB-DELEGATION-HQ',
    lastSyncAt: '2026-08-23T14:30:00.000Z',
  },
};

export const DEFAULT_PACKAGE_CATEGORIES: PackageCategory[] = [
  {
    id: 'canton_fair',
    name: 'Canton Fair (ពិព័រណ៍ក្វាងចូវ)',
    nameKm: '🇨🇳 ពិព័រណ៍ក្វាងចូវ Canton Fair (Guangzhou, China)',
    nameEn: 'Canton Fair Multi-Phase Trade Mission',
    nameZh: '广交会进出口商品交易会',
    description: 'World largest multi-industry import & export trade exhibition in Guangzhou, China.',
    icon: '🇨🇳',
    color: 'rose',
    isActive: true,
    order: 1,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'trade_mission',
    name: 'B2B Trade Mission',
    nameKm: 'B2B Trade Mission (ពិព័រណ៍ពាណិជ្ជកម្ម)',
    nameEn: 'B2B Trade Mission & Business Expo',
    nameZh: 'B2B 跨国商务考察与贸易对接',
    description: 'High-level bilateral trade exhibitions, business matching, and VIP networking.',
    icon: '🏢',
    color: 'indigo',
    isActive: true,
    order: 2,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'franchise',
    name: 'Retailtech & Franchise',
    nameKm: 'Retailtech & Franchise (សិទ្ធិអាជីវកម្ម)',
    nameEn: 'Retailtech & Franchise Master Sourcing',
    nameZh: '新零售科技与连锁加盟展',
    description: 'Global retail systems, brand franchising master licenses, and smart store technology.',
    icon: '🛍️',
    color: 'amber',
    isActive: true,
    order: 3,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'coffee_tea_bakery',
    name: 'Coffee, Tea & Bakery Expo',
    nameKm: 'Coffee, Tea & Bakery Expo (កាហ្វេ និងនំ)',
    nameEn: 'Coffee, Tea & Bakery Expo',
    nameZh: '国际咖啡、茶饮与烘焙博览会',
    description: 'Specialty coffee roasting, bubble tea supply chain, bakery equipment, and packaging.',
    icon: '☕',
    color: 'emerald',
    isActive: true,
    order: 4,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'business_inspection',
    name: 'Industrial & Factory Inspection',
    nameKm: 'Industrial & Factory Inspection (ទស្សនកិច្ចរោងចក្រ)',
    nameEn: 'Industrial & Factory Inspection',
    nameZh: '工业制造与源头智能工厂考察',
    description: 'On-site factory audits, industrial automation, supply chain sourcing, and machinery.',
    icon: '🏭',
    color: 'sky',
    isActive: true,
    order: 5,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'luxury_executive',
    name: 'Executive VIP Delegation',
    nameKm: 'Executive VIP Delegation (គណៈប្រតិភូជាន់ខ្ពស់)',
    nameEn: 'Executive VIP Delegation',
    nameZh: '政商领袖高端商务代表团',
    description: 'C-suite exclusive delegation with government ministry summits and private investment roundtables.',
    icon: '👑',
    color: 'purple',
    isActive: true,
    order: 6,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'tech_innovation',
    name: 'Tech & AI Innovation Summit',
    nameKm: 'Tech & AI Innovation Summit (បច្ចេកវិទ្យា & AI)',
    nameEn: 'Tech & AI Innovation Summit',
    nameZh: '科技与人工智能创新峰会',
    description: 'Artificial intelligence, robotics, fintech, and digital transformation conferences.',
    icon: '⚡',
    color: 'cyan',
    isActive: true,
    order: 7,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'green_energy',
    name: 'Renewable & Solar Energy Expo',
    nameKm: 'Renewable Energy & Solar (ថាមពលកកើតឡើងវិញ)',
    nameEn: 'Renewable & Solar Energy Expo',
    nameZh: '新能源、光伏与绿色储能展',
    description: 'Photovoltaic solar panels, EV charging ecosystems, energy storage, and sustainability.',
    icon: '🌿',
    color: 'teal',
    isActive: true,
    order: 8,
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];


