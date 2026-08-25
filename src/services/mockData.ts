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
  SystemSettings
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
    'រថយន្តក្រុង VIP ពីភ្នំពេញ ទៅកាន់ប្រទេសវៀតណាម (Phnom Penh to Vietnam VIP Coach)',
    'សណ្ឋាគារស្នាក់នៅស្តង់ដារ ៤ ផ្កាយ (៣ យប់ / ៤ ថ្ងៃ)',
    'អាហារពេលព្រឹកប៊ូហ្វេប្រចាំថ្ងៃនៅសណ្ឋាគារ (Daily Hotel Buffet Breakfast)',
    'រថយន្តក្រុង VIP ដឹកជញ្ជូនពេញដំណើរបេសកកម្មនៅប្រទេសវៀតណាម (Dedicated Bus in Vietnam)',
    'សំបុត្រជិះកប៉ាល់ល្បឿនលឿនពី កោះត្រល់ មកកាន់ខេត្តកំពត (High-Speed Ferry: Phu Quoc to Kampot)',
    'រថយន្តក្រុង VIP ពីខេត្តកំពត ត្រឡប់មកកាន់រាជធានីភ្នំពេញ (VIP Coach: Kampot to Phnom Penh)',
    'មគ្គុទ្ទេសក៍ទេសចរណ៍ជំនាញនិយាយ វៀតណាម-អង់គ្លេស-ខ្មែរ (Certified Bilingual Escort & Guide)',
    'ការចុះឈ្មោះ និងកាតផ្លូវការចូលទស្សនាពិព័រណ៍ទាំង ៣ ដោយឥតគិតថ្លៃ (Official VIP Expo Passes)',
    'សេវាសម្រួលបែបបទឆ្លងដែន VIP (Fast-Track Border & Immigration VIP Clearance)',
    'សំបុត្រយន្តហោះក្នុងស្រុកពី ហូជីមិញ ទៅកាន់ កោះត្រល់ (Domestic Flight: HCMC to Phu Quoc)'
  ],
  inclusionsKm: [
    'រថយន្តក្រុង VIP ពីភ្នំពេញ ទៅកាន់ប្រទេសវៀតណាម (Phnom Penh to Vietnam VIP Coach)',
    'សណ្ឋាគារស្នាក់នៅស្តង់ដារ ៤ ផ្កាយ (៣ យប់ / ៤ ថ្ងៃ)',
    'អាហារពេលព្រឹកប៊ូហ្វេប្រចាំថ្ងៃនៅសណ្ឋាគារ (Daily Hotel Buffet Breakfast)',
    'រថយន្តក្រុង VIP ដឹកជញ្ជូនពេញដំណើរបេសកកម្មនៅប្រទេសវៀតណាម (Dedicated Bus in Vietnam)',
    'សំបុត្រជិះកប៉ាល់ល្បឿនលឿនពី កោះត្រល់ មកកាន់ខេត្តកំពត (High-Speed Ferry: Phu Quoc to Kampot)',
    'រថយន្តក្រុង VIP ពីខេត្តកំពត ត្រឡប់មកកាន់រាជធានីភ្នំពេញ (VIP Coach: Kampot to Phnom Penh)',
    'មគ្គុទ្ទេសក៍ទេសចរណ៍ជំនាញនិយាយ វៀតណាម-អង់គ្លេស-ខ្មែរ (Certified Bilingual Escort & Guide)',
    'ការចុះឈ្មោះ និងកាតផ្លូវការចូលទស្សនាពិព័រណ៍ទាំង ៣ ដោយឥតគិតថ្លៃ (Official VIP Expo Passes)',
    'សេវាសម្រួលបែបបទឆ្លងដែន VIP (Fast-Track Border & Immigration VIP Clearance)',
    'សំបុត្រយន្តហោះក្នុងស្រុកពី ហូជីមិញ ទៅកាន់ កោះត្រល់ (Domestic Flight: HCMC to Phu Quoc)'
  ],
  inclusionsEn: [
    'Phnom Penh to Vietnam air-conditioned VIP charter coach',
    '3 Nights in 4-Star premier business hotels & beach resorts',
    'Daily International hotel buffet breakfast',
    'Dedicated private VIP coach transport throughout Vietnam',
    'International high-speed ferry ticket: Phu Quoc Island to Kampot Port',
    'VIP coach transport from Kampot Port back to Phnom Penh',
    'Certified trilingual escort & tour directors (Khmer / Vietnamese / English)',
    'Official pre-registered VIP delegate badges to all 3 international trade expos',
    'Fast-track border immigration assistance at Bavet/Moc Bai',
    'Domestic scheduled flight ticket: Ho Chi Minh City (SGN) to Phu Quoc (PQC)'
  ],
  exclusions: [
    'អាហារថ្ងៃត្រង់ និងអាហារពេលល្ងាចផ្ទាល់ខ្លួន (លើកលែងតែកម្មវិធីដែលបានបញ្ជាក់)',
    'ការចំណាយផ្ទាល់ខ្លួន (ទិញទំនិញ, សេវាបោកអ៊ុត, ទូរស័ព្ទ)',
    'ថ្លៃកម្មវិធីជម្រើសបន្ថែម (Optional Tour Programs / VIP 1-on-1 Dinner)',
    'ធានារ៉ាប់រងការធ្វើដំណើរក្រៅប្រទេសផ្ទាល់ខ្លួន'
  ],
  exclusionsKm: [
    'អាហារថ្ងៃត្រង់ និងអាហារពេលល្ងាចផ្ទាល់ខ្លួន (លើកលែងតែកម្មវិធីដែលបានបញ្ជាក់)',
    'ការចំណាយផ្ទាល់ខ្លួន (ទិញទំនិញ, សេវាបោកអ៊ុត, ទូរស័ព្ទ)',
    'ថ្លៃកម្មវិធីជម្រើសបន្ថែម (Optional Tour Programs / VIP 1-on-1 Dinner)',
    'ធានារ៉ាប់រងការធ្វើដំណើរក្រៅប្រទេសផ្ទាល់ខ្លួន'
  ],
  exclusionsEn: [
    'Personal lunches and dinners (outside of official scheduled banquets)',
    'Personal shopping expenses, room laundry, mini-bar, and roaming telephony',
    'Optional specialized add-on programs and private B2B matchmaking packages',
    'Personal international travel and medical insurance'
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
  exclusions: [
    'ទិដ្ឋាការចូលប្រទេសចិន China Visa Fee (KHB ជួយរៀបចំឯកសារអញ្ជើញ Official Invitation Letter)',
    'ការចំណាយផ្ទាល់ខ្លួនក្រៅពីកម្មវិធី និងទម្ងន់វ៉ាលីសលើសកំណត់',
    'ថ្លៃដឹកជញ្ជូនទំនិញគំរូ ឬការកុម្ម៉ង់ទិញទំនិញផ្ទាល់ខ្លួន'
  ],
  termsAndConditions: [
    'លិខិតឆ្លងដែន Passport ត្រូវមានសុពលភាពយ៉ាងតិច ៦ ខែគិតចាប់ពីថ្ងៃចេញដំណើរ។',
    'តម្រូវឱ្យកក់ប្រាក់កក់ចំនួន 50% នៅពេលចុះឈ្មោះដើម្បីធានាសំបុត្រយន្តហោះ និងសណ្ឋាគារ ៥ ផ្កាយ។',
    'KHB នឹងចេញលិខិតអញ្ជើញពាណិជ្ជកម្មផ្លូវការ (Official Canton Fair Invitation) សម្រាប់ធ្វើ Visa ចិន។',
    'ឈប់ទទួលចុះឈ្មោះមុនថ្ងៃទី 20 ខែកញ្ញា ឆ្នាំ 2026 ឬនៅពេលគ្រប់ចំនួនគណៈប្រតិភូ 25 នាក់។'
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
    title: 'Lead Trade Mission Director (Cambodia-China Trade)',
    phone: '060 815 515',
    telegram: 'https://t.me/VuthaTim',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    badgeNumber: 'KHB-CANTON-2026-01',
    bio: 'Experienced bilateral trade specialist with over 10 years leading Cambodian business delegations to Guangzhou, Shenzhen, and Yiwu. Directly assists delegates with factory verifications and customs tariffs.',
    languages: ['Khmer', 'Chinese (Mandarin)', 'English'],
    briefingMeetingPoint: 'Phnom Penh International Airport (PNH) International Departure Gate - KHB VIP Desk',
    briefingTime: '07:30 AM (ថ្ងៃទី 15/10/2026)'
  },
  itinerary: [
    {
      day: 1,
      title: 'ភ្នំពេញ - ហោះហើរទៅកាន់ក្វាងចូវ (CAN) - ទទួលកាត Buyer Badge & ពិធីស្វាគមន៍គណៈប្រតិភូ',
      description: 'ហោះហើរពីរាជធានីភ្នំពេញទៅកាន់អាកាសយានដ្ឋានអន្តរជាតិ Guangzhou Baiyun (CAN)។ រថយន្ត VIP ទទួល និងសម្រួលការធ្វើកាត Buyer Badge ផ្លូវការ ចូលឆែកអ៊ីនសណ្ឋាគារ ៥ ផ្កាយ និងពិសារអាហារពេលល្ងាចស្វាគមន៍បែបក្វាងទុង។',
      hotelName: 'Guangzhou Marriott Pazhou / Crowne Plaza (5-Star)',
      mealsIncluded: ['Breakfast', 'Welcome Banquet'],
      guideAgenda: [
        { time: '07:30 AM - 09:30 AM', activity: 'ជួបជុំគណៈប្រតិភូនៅព្រលានយន្តហោះភ្នំពេញ & ចែកឯកសារបេសកកម្ម', location: 'Phnom Penh International Airport' },
        { time: '10:15 AM - 02:00 PM', activity: 'ជើងហោះហើរត្រង់ ភ្នំពេញ ទៅ ក្វាងចូវ (PNH -> CAN)', location: 'Flight PNH -> CAN' },
        { time: '03:30 PM - 05:30 PM', activity: 'សម្រួលបែបបទទទួលកាត VIP Buyer Badge ចូល Pazhou Complex & ឆែកអ៊ីនសណ្ឋាគារ', location: 'Canton Fair Buyer Registration Center' },
        { time: '06:30 PM - 09:00 PM', activity: 'ពិធីលៀងសាយភាយស្វាគមន៍គណៈប្រតិភូកម្ពុជា Welcome Gala Dinner', location: 'Hotel Grand Ballroom' }
      ]
    },
    {
      day: 2,
      title: 'Canton Fair Phase 1 (ថ្ងៃទី ១): អេឡិចត្រូនិក គ្រឿងម៉ាស៊ីន និងបច្ចេកវិទ្យាស្វ័យប្រវត្តិកម្ម',
      description: 'ពេញមួយថ្ងៃនៅសាលពិព័រណ៍ Pazhou Complex (Area A & B) ជួបម្ចាស់រោងចក្រផលិតឧបករណ៍អេឡិចត្រូនិក គ្រឿងម៉ាស៊ីនឧស្សាហកម្មធុនធ្ងន់ និងបច្ចេកវិទ្យា AI Automation។',
      hotelName: 'Guangzhou Marriott Pazhou (5-Star)',
      mealsIncluded: ['Buffet Breakfast', 'VIP Networking Lunch', 'Dinner'],
      guideAgenda: [
        { time: '08:30 AM - 09:00 AM', activity: 'រថយន្ត VIP ជូនគណៈប្រតិភូទៅកាន់ Pazhou Complex', location: 'Hotel to Pazhou Complex' },
        { time: '09:00 AM - 12:30 PM', activity: 'ទស្សនា Hall 1-5: គ្រឿងអេឡិចត្រូនិក ឧបករណ៍ប្រើប្រាស់ និងប្រព័ន្ធ Smart Home', location: 'Pazhou Complex Area A' },
        { time: '12:30 PM - 01:30 PM', activity: 'អាហារថ្ងៃត្រង់បណ្តាញពាណិជ្ជកម្ម VIP', location: 'VIP Hall Restaurant' },
        { time: '01:30 PM - 05:30 PM', activity: 'ទស្សនា Hall 6-8: គ្រឿងម៉ាស៊ីនឧស្សាហកម្ម និងឧបករណ៍កែច្នៃស្វ័យប្រវត្តិកម្ម', location: 'Pazhou Complex Area B' }
      ]
    },
    {
      day: 3,
      title: 'Canton Fair Phase 1 (ថ្ងៃទី ២): ឧបករណ៍ជាង សម្ភារៈសំណង់ & ថាមពលកកើតឡើងវិញ',
      description: 'ផ្តោតលើការចរចា និងចុះកិច្ចសន្យាផ្គត់ផ្គង់សម្ភារៈសំណង់ ឧបករណ៍ជាង Hardware ភ្លើងបំភ្លឺ LED និងបច្ចេកវិទ្យាថាមពលពន្លឺព្រះអាទិត្យ Solar/Battery។',
      hotelName: 'Guangzhou Marriott Pazhou (5-Star)',
      mealsIncluded: ['Buffet Breakfast', 'Lunch', 'Dinner'],
      guideAgenda: [
        { time: '09:00 AM - 12:30 PM', activity: 'ទស្សនា Hall 9-11: សម្ភារៈសំណង់ ឧបករណ៍ជាង និងបរិក្ខារបំពង់ទឹក/អគ្គិសនី', location: 'Pazhou Complex Area B' },
        { time: '01:30 PM - 05:00 PM', activity: 'ទស្សនា Hall 14-16: ថាមពលពន្លឺព្រះអាទិត្យ Solar Panels, Inverters & EV Chargers', location: 'Pazhou Complex Area C' },
        { time: '06:30 PM - 09:00 PM', activity: 'ទស្សនាក្រុងក្វាងចូវពេលរាត្រី & ជិះទូកកម្សាន្តទន្លេគុជ Pearl River Night Cruise', location: 'Pearl River Pier' }
      ]
    },
    {
      day: 4,
      title: 'ដំណើរទស្សនកិច្ចរោងចក្រ Foshan: រោងចក្រផលិតសម្ភារៈសំណង់ & មជ្ឈមណ្ឌលលក់ដុំ',
      description: 'ចេញដំណើរទៅកាន់ទីក្រុង Foshan ទស្សនកិច្ចផ្ទាល់ដល់រោងចក្រផលិត និងមជ្ឈមណ្ឌលលក់ដុំសម្ភារៈសំណង់ ក្បឿង សេរ៉ាមិច និងគ្រឿងសង្ហារិមខ្នាតយក្ស។',
      hotelName: 'Guangzhou Marriott Pazhou (5-Star)',
      mealsIncluded: ['Buffet Breakfast', 'Shunde Gourmet Lunch', 'Dinner'],
      guideAgenda: [
        { time: '08:30 AM - 10:00 AM', activity: 'រថយន្ត VIP ជូនដំណើរទៅកាន់ទីក្រុង Foshan', location: 'Guangzhou -> Foshan' },
        { time: '10:00 AM - 01:00 PM', activity: 'ទស្សនកិច្ចរោងចក្រផលិតសម្ភារៈសំណង់ & ជួបអ្នកគ្រប់គ្រងផលិតកម្ម', location: 'Foshan Industrial Park' },
        { time: '01:00 PM - 02:30 PM', activity: 'ទទួលទានអាហារថ្ងៃត្រង់ម្ហូបពិសេស Shunde Cuisine (UNESCO City of Gastronomy)', location: 'Shunde Famous Restaurant' },
        { time: '03:00 PM - 05:30 PM', activity: 'ទស្សនាមជ្ឈមណ្ឌលលក់ដុំគ្រឿងសំណង់ និងឧបករណ៍ជាង Foshan Wholesale Hub', location: 'Foshan Wholesale Trade Center' }
      ]
    },
    {
      day: 5,
      title: 'ជំនួបពាណិជ្ជកម្ម B2B Matchmaking & មជ្ឈមណ្ឌលលក់ដុំអេឡិចត្រូនិច Dashatou',
      description: 'ការជួបចរចាទល់មុខជាមួយក្រុមហ៊ុនផ្គត់ផ្គង់ចិន និងទស្សនាផ្សារលក់ដុំអេឡិចត្រូនិច និងគ្រឿងបន្លាស់ទូរស័ព្ទធំបំផុតនៅក្វាងចូវ Dashatou & Nanfang Building។',
      hotelName: 'Guangzhou Marriott Pazhou (5-Star)',
      mealsIncluded: ['Buffet Breakfast', 'Lunch', 'Executive Farewell Banquet'],
      guideAgenda: [
        { time: '09:00 AM - 12:00 PM', activity: 'ជំនួបពាណិជ្ជកម្មទល់មុខ B2B Matchmaking Session', location: 'Hotel Business Center' },
        { time: '02:00 PM - 05:30 PM', activity: 'ទស្សនកិច្ចផ្សារបោះដុំគ្រឿងអេឡិចត្រូនិច និងគ្រឿងបន្លាស់ Dashatou & Nanfang', location: 'Guangzhou Electronics Wholesale Market' },
        { time: '06:30 PM - 09:30 PM', activity: 'ពិធីជប់លៀងលាគ្នាពិសេស Executive Farewell Seafood Banquet', location: 'Guangzhou Famous Seafood Restaurant' }
      ]
    },
    {
      day: 6,
      title: 'ទិញទំនិញ Beijing Road Pedestrian Street - ហោះហើរត្រឡប់មកភ្នំពេញ',
      description: 'ទស្សនាតំបន់ពាណិជ្ជកម្ម និងប្រវត្តិសាស្ត្រ Beijing Road Pedestrian Street មុនពេលរថយន្ត VIP ជូនដំណើរទៅព្រលានយន្តហោះ Baiyun ដើម្បីហោះហើរត្រឡប់មកភ្នំពេញ។',
      hotelName: 'Trip Completion (Phnom Penh Arrival)',
      mealsIncluded: ['Buffet Breakfast', 'Lunch'],
      guideAgenda: [
        { time: '09:00 AM - 12:00 PM', activity: 'ទស្សនា និងទិញទំនិញនៅផ្លូវថ្មើរជើង Beijing Road Pedestrian Street', location: 'Beijing Road' },
        { time: '12:30 PM - 01:30 PM', activity: 'អាហារថ្ងៃត្រង់ ឌីមសាំក្វាងទុង (Guangdong Famous Dim Sum)', location: 'Guangzhou Dim Sum Restaurant' },
        { time: '02:30 PM - 04:00 PM', activity: 'រថយន្ត VIP ជូនដំណើរទៅកាន់ព្រលានយន្តហោះ Baiyun (CAN)', location: 'Guangzhou Baiyun Airport' },
        { time: '06:30 PM - 08:30 PM', activity: 'ជើងហោះហើរត្រង់មកដល់អាកាសយានដ្ឋានអន្តរជាតិភ្នំពេញដោយជោគជ័យ', location: 'Phnom Penh Arrival' }
      ]
    }
  ]
};

export const CANTON_FAIR_PHASE_2_PACKAGE: TourPackage = {
  id: 'pkg_canton_fair_phase_2_2026',
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
  exclusions: [
    'ទិដ្ឋាការចូលប្រទេសចិន China Visa Fee (KHB ជួយរៀបចំ Official Invitation Letter)',
    'ការចំណាយផ្ទាល់ខ្លួន និងទម្ងន់វ៉ាលីសលើសកំណត់',
    'ថ្លៃដឹកជញ្ជូនទំនិញ ឬទិញទំនិញផ្ទាល់ខ្លួន'
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
    title: 'Lead Trade Mission Director (Cambodia-China Trade)',
    phone: '060 815 515',
    telegram: 'https://t.me/VuthaTim',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    badgeNumber: 'KHB-CANTON-2026-02',
    bio: 'Senior trade delegation coordinator specializing in consumer retail, home living, and wholesale sourcing from Guangdong factories.',
    languages: ['Khmer', 'Chinese (Mandarin)', 'English'],
    briefingMeetingPoint: 'Phnom Penh International Airport (PNH) International Departure Gate',
    briefingTime: '07:30 AM (ថ្ងៃទី 23/10/2026)'
  },
  itinerary: [
    {
      day: 1,
      title: 'ភ្នំពេញ - ក្វាងចូវ - ទទួលកាត Buyer Badge & ពិធីស្វាគមន៍គណៈប្រតិភូ',
      description: 'ហោះហើរទៅក្វាងចូវ សម្រួលកាត Buyer Badge ចូលឆែកអ៊ីនសណ្ឋាគារ ៥ ផ្កាយ និងពិសារអាហារពេលល្ងាចស្វាគមន៍។',
      hotelName: 'Guangzhou Marriott Pazhou (5-Star)',
      mealsIncluded: ['Breakfast', 'Welcome Banquet'],
      guideAgenda: [
        { time: '08:00 AM - 10:00 AM', activity: 'ជួបជុំគណៈប្រតិភូនៅព្រលានយន្តហោះភ្នំពេញ', location: 'Phnom Penh Airport' },
        { time: '10:30 AM - 02:15 PM', activity: 'ជើងហោះហើរត្រង់ ភ្នំពេញ ទៅ ក្វាងចូវ', location: 'Flight PNH -> CAN' },
        { time: '03:45 PM - 05:30 PM', activity: 'ទទួលកាត VIP Buyer Badge & ឆែកអ៊ីនសណ្ឋាគារ ៥ ផ្កាយ', location: 'Pazhou Center' },
        { time: '06:30 PM - 09:00 PM', activity: 'ពិធីលៀងសាយភាយស្វាគមន៍គណៈប្រតិភូ', location: 'Grand Ballroom' }
      ]
    },
    {
      day: 2,
      title: 'Canton Fair Phase 2 (ថ្ងៃទី ១): របស់របរប្រើប្រាស់ក្នុងផ្ទះ ផ្ទះបាយ និងសេរ៉ាមិច',
      description: 'ពេញមួយថ្ងៃនៅ Pazhou Complex ជួបក្រុមហ៊ុនផលិតរបស់របរផ្ទះបាយ ចានកែវ សេរ៉ាមិច និងទំនិញប្រើប្រាស់ប្រចាំថ្ងៃ។',
      hotelName: 'Guangzhou Marriott Pazhou (5-Star)',
      mealsIncluded: ['Buffet Breakfast', 'VIP Lunch', 'Dinner'],
      guideAgenda: [
        { time: '09:00 AM - 12:30 PM', activity: 'ទស្សនា Hall 1-4: របស់របរផ្ទះបាយ ចានឆ្នាំង និងសេរ៉ាមិចប្រណិត', location: 'Pazhou Complex Area A' },
        { time: '01:30 PM - 05:30 PM', activity: 'ទស្សនា Hall 5-7: របស់របរប្រើប្រាស់ទូទៅ និងផលិតផលផ្លាស្ទិកកែច្នៃ', location: 'Pazhou Complex Area B' }
      ]
    },
    {
      day: 3,
      title: 'Canton Fair Phase 2 (ថ្ងៃទី ២): គ្រឿងតុបតែងផ្ទះ កាដូ និងគ្រឿងសង្ហារិម',
      description: 'ទស្សនាគ្រឿងតុបតែងលម្អគេហដ្ឋាន អំពូលភ្លើងសិល្បៈ កាដូអនុស្សាវរីយ៍ និងគ្រឿងសង្ហារិមទំនើប។',
      hotelName: 'Guangzhou Marriott Pazhou (5-Star)',
      mealsIncluded: ['Buffet Breakfast', 'Lunch', 'Dinner'],
      guideAgenda: [
        { time: '09:00 AM - 12:30 PM', activity: 'ទស្សនា Hall 8-10: គ្រឿងតុបតែងគេហដ្ឋាន ផ្កាសិប្បនិម្មិត និងសិល្បៈកែវ', location: 'Pazhou Complex Area B' },
        { time: '01:30 PM - 05:00 PM', activity: 'ទស្សនា Hall 11-13: គ្រឿងសង្ហារិមក្នុងផ្ទះ និងក្រៅផ្ទះ (Indoor & Outdoor Furniture)', location: 'Pazhou Complex Area C' },
        { time: '06:30 PM - 09:00 PM', activity: 'ជិះទូកកម្សាន្តទន្លេគុជ Pearl River Night Cruise', location: 'Pearl River Pier' }
      ]
    },
    {
      day: 4,
      title: 'ទស្សនកិច្ចរោងចក្រ & ផ្សារលក់ដុំអំពូលភ្លើង Guzhen Lighting Capital',
      description: 'ធ្វើដំណើរទៅកាន់ទីក្រុងចុងសាន ទស្សនាទីក្រុងអំពូលភ្លើងធំបំផុត Guzhen Lighting Wholesale Capital។',
      hotelName: 'Guangzhou Marriott Pazhou (5-Star)',
      mealsIncluded: ['Buffet Breakfast', 'Lunch', 'Dinner'],
      guideAgenda: [
        { time: '08:30 AM - 10:00 AM', activity: 'រថយន្ត VIP ជូនដំណើរទៅ Guzhen, Zhongshan', location: 'Guangzhou -> Zhongshan' },
        { time: '10:00 AM - 01:00 PM', activity: 'ទស្សនកិច្ចផ្សារបោះដុំអំពូលភ្លើង និងគ្រឿងតុបតែង Guzhen Plaza', location: 'Guzhen Lighting Market' },
        { time: '02:30 PM - 05:30 PM', activity: 'ទស្សនារោងចក្រផលិតសម្ភារៈតុបតែង និងចរចាតម្លៃផ្ទាល់', location: 'Zhongshan Manufacturing Hub' }
      ]
    },
    {
      day: 5,
      title: 'ជំនួបពាណិជ្ជកម្ម B2B & ផ្សារលក់ដុំទំនិញទូទៅ OneLink International Plaza',
      description: 'ទស្សនាផ្សារលក់ដុំកាដូ របស់របរតុបតែង និងរបស់ក្មេងលេងធំបំផុតនៅក្វាងចូវ OneLink Plaza។',
      hotelName: 'Guangzhou Marriott Pazhou (5-Star)',
      mealsIncluded: ['Buffet Breakfast', 'Lunch', 'Farewell Banquet'],
      guideAgenda: [
        { time: '09:00 AM - 12:00 PM', activity: 'ជំនួបពាណិជ្ជកម្មទល់មុខ B2B Matchmaking', location: 'Hotel Business Center' },
        { time: '02:00 PM - 05:30 PM', activity: 'ទស្សនកិច្ចផ្សារបោះដុំ OneLink International Plaza', location: 'OneLink Plaza Guangzhou' },
        { time: '06:30 PM - 09:30 PM', activity: 'ពិធីជប់លៀងលាគ្នា Executive Farewell Banquet', location: 'Seafood Banquet Hall' }
      ]
    },
    {
      day: 6,
      title: 'ទិញទំនិញ Shamian Island & Beijing Road - ហោះហើរត្រឡប់មកភ្នំពេញ',
      description: 'ទស្សនាកោះប្រវត្តិសាស្ត្រ Shamian Island និងផ្លូវពាណិជ្ជកម្ម Beijing Road មុនពេលហោះហើរត្រឡប់មកភ្នំពេញ។',
      hotelName: 'Trip Completion (Phnom Penh Arrival)',
      mealsIncluded: ['Buffet Breakfast', 'Dim Sum Lunch'],
      guideAgenda: [
        { time: '09:00 AM - 12:00 PM', activity: 'ទស្សនាកោះបេតិកភណ្ឌ Shamian Island & Beijing Road', location: 'Shamian Island' },
        { time: '12:30 PM - 01:30 PM', activity: 'អាហារថ្ងៃត្រង់ ឌីមសាំក្វាងទុងពិសេស', location: 'Dim Sum Restaurant' },
        { time: '03:00 PM - 04:30 PM', activity: 'រថយន្ត VIP ជូនដំណើរទៅព្រលានយន្តហោះ Baiyun (CAN)', location: 'Guangzhou Airport' },
        { time: '06:30 PM - 08:30 PM', activity: 'ជើងហោះហើរត្រង់មកដល់ភ្នំពេញដោយជោគជ័យ', location: 'Phnom Penh Arrival' }
      ]
    }
  ]
};

export const CANTON_FAIR_PHASE_3_PACKAGE: TourPackage = {
  id: 'pkg_canton_fair_phase_3_2026',
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
  exclusions: [
    'ទិដ្ឋាការចូលប្រទេសចិន China Visa Fee (KHB ជួយរៀបចំ Official Invitation Letter)',
    'ការចំណាយផ្ទាល់ខ្លួន និងទម្ងន់វ៉ាលីសលើសកំណត់',
    'ថ្លៃដឹកជញ្ជូនទំនិញ ឬទិញទំនិញផ្ទាល់ខ្លួន'
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
    title: 'Lead Trade Mission Director (Cambodia-China Trade)',
    phone: '060 815 515',
    telegram: 'https://t.me/VuthaTim',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    badgeNumber: 'KHB-CANTON-2026-03',
    bio: 'Senior trade escort specialist with extensive experience in garment manufacturing, textile sourcing, and medical device procurement across Guangzhou and Zhejiang.',
    languages: ['Khmer', 'Chinese (Mandarin)', 'English'],
    briefingMeetingPoint: 'Phnom Penh International Airport (PNH) International Departure Gate',
    briefingTime: '07:30 AM (ថ្ងៃទី 31/10/2026)'
  },
  itinerary: [
    {
      day: 1,
      title: 'ភ្នំពេញ - ក្វាងចូវ - ទទួលកាត Buyer Badge & ពិធីស្វាគមន៍គណៈប្រតិភូ',
      description: 'ហោះហើរទៅក្វាងចូវ សម្រួលកាត Buyer Badge ចូលឆែកអ៊ីនសណ្ឋាគារ ៥ ផ្កាយ និងពិសារអាហារពេលល្ងាចស្វាគមន៍។',
      hotelName: 'Guangzhou Marriott Pazhou (5-Star)',
      mealsIncluded: ['Breakfast', 'Welcome Banquet'],
      guideAgenda: [
        { time: '08:00 AM - 10:00 AM', activity: 'ជួបជុំគណៈប្រតិភូនៅព្រលានយន្តហោះភ្នំពេញ', location: 'Phnom Penh Airport' },
        { time: '10:30 AM - 02:15 PM', activity: 'ជើងហោះហើរត្រង់ ភ្នំពេញ ទៅ ក្វាងចូវ', location: 'Flight PNH -> CAN' },
        { time: '03:45 PM - 05:30 PM', activity: 'ទទួលកាត VIP Buyer Badge & ឆែកអ៊ីនសណ្ឋាគារ ៥ ផ្កាយ', location: 'Pazhou Center' },
        { time: '06:30 PM - 09:00 PM', activity: 'ពិធីលៀងសាយភាយស្វាគមន៍គណៈប្រតិភូ', location: 'Grand Ballroom' }
      ]
    },
    {
      day: 2,
      title: 'Canton Fair Phase 3 (ថ្ងៃទី ១): សម្លៀកបំពាក់ វាយនភណ្ឌ ស្បែកជើង & កាបូប',
      description: 'ពេញមួយថ្ងៃនៅ Pazhou Complex ជួបក្រុមហ៊ុនផលិតសម្លៀកបំពាក់ ស្បែកជើង កាបូប និងក្រណាត់វាយនភណ្ឌ។',
      hotelName: 'Guangzhou Marriott Pazhou (5-Star)',
      mealsIncluded: ['Buffet Breakfast', 'VIP Lunch', 'Dinner'],
      guideAgenda: [
        { time: '09:00 AM - 12:30 PM', activity: 'ទស្សនា Hall 1-4: សម្លៀកបំពាក់បុរស-នារី និងម៉ូតសម្លៀកបំពាក់ទាន់សម័យ', location: 'Pazhou Complex Area A' },
        { time: '01:30 PM - 05:30 PM', activity: 'ទស្សនា Hall 5-7: ស្បែកជើង កាបូបធ្វើដំណើរ និងសម្ភារៈស្បែក', location: 'Pazhou Complex Area B' }
      ]
    },
    {
      day: 3,
      title: 'Canton Fair Phase 3 (ថ្ងៃទី ២): ឧបករណ៍វេជ្ជសាស្ត្រ ឱសថ & ម្ហូបអាហារ',
      description: 'ទស្សនាឧបករណ៍វេជ្ជសាស្ត្រ សម្ភារៈមន្ទីរពេទ្យ អាហារបំប៉នសុខភាព និងម្ហូបអាហារកែច្នៃនាំចេញ។',
      hotelName: 'Guangzhou Marriott Pazhou (5-Star)',
      mealsIncluded: ['Buffet Breakfast', 'Lunch', 'Dinner'],
      guideAgenda: [
        { time: '09:00 AM - 12:30 PM', activity: 'ទស្សនា Hall 8-10: ឧបករណ៍វេជ្ជសាស្ត្រ បរិក្ខារមន្ទីរពេទ្យ និងផលិតផលថែទាំសុខភាព', location: 'Pazhou Complex Area B' },
        { time: '01:30 PM - 05:00 PM', activity: 'ទស្សនា Hall 11-13: ម្ហូបអាហារកែច្នៃ តែ និងកសិផលនាំចេញអន្តរជាតិ', location: 'Pazhou Complex Area C' },
        { time: '06:30 PM - 09:00 PM', activity: 'ជិះទូកកម្សាន្តទន្លេគុជ Pearl River Night Cruise', location: 'Pearl River Pier' }
      ]
    },
    {
      day: 4,
      title: 'ទស្សនកិច្ចផ្សារបោះដុំក្រណាត់ធំបំផុតនៅអាស៊ី Zhongda International Textile City',
      description: 'ទស្សនកិច្ចផ្សារបោះដុំក្រណាត់ និងវត្ថុធាតុដើមកាត់ដេរធំបំផុតនៅអាស៊ី Zhongda Fabric & Accessories Market។',
      hotelName: 'Guangzhou Marriott Pazhou (5-Star)',
      mealsIncluded: ['Buffet Breakfast', 'Lunch', 'Dinner'],
      guideAgenda: [
        { time: '09:00 AM - 12:30 PM', activity: 'ទស្សនកិច្ច និងជ្រើសរើសគំរូក្រណាត់ Zhongda Fabric Market', location: 'Zhongda International Textile City' },
        { time: '01:30 PM - 05:00 PM', activity: 'ទស្សនាផ្សារបោះដុំគ្រឿងតុបតែងកាត់ដេរ និងឡេវ/ខ្សែរ៉ូត Accessories Market', location: 'Zhongda Garment Accessories' }
      ]
    },
    {
      day: 5,
      title: 'ជំនួបពាណិជ្ជកម្ម B2B & ផ្សារលក់ដុំស្បែកជើង Zhanxi Road Shoe Market',
      description: 'ជំនួបពាណិជ្ជកម្មទល់មុខ និងទស្សនាផ្សារលក់ដុំស្បែកជើង និងកាបូបធំបំផុត Zhanxi Road Shoe Plaza។',
      hotelName: 'Guangzhou Marriott Pazhou (5-Star)',
      mealsIncluded: ['Buffet Breakfast', 'Lunch', 'Farewell Banquet'],
      guideAgenda: [
        { time: '09:00 AM - 12:00 PM', activity: 'ជំនួបពាណិជ្ជកម្មទល់មុខ B2B Matchmaking Session', location: 'Hotel Business Center' },
        { time: '02:00 PM - 05:30 PM', activity: 'ទស្សនកិច្ចផ្សារបោះដុំស្បែកជើង និងកាបូប Zhanxi Road Wholesale Center', location: 'Zhanxi Road Shoe Market' },
        { time: '06:30 PM - 09:30 PM', activity: 'ពិធីជប់លៀងលាគ្នា Executive Farewell Banquet', location: 'Seafood Banquet Hall' }
      ]
    },
    {
      day: 6,
      title: 'ទិញទំនិញ Beijing Road - ហោះហើរត្រឡប់មកភ្នំពេញ',
      description: 'ទស្សនាផ្លូវថ្មើរជើង Beijing Road មុនពេលរថយន្ត VIP ជូនដំណើរទៅព្រលានយន្តហោះ Baiyun ដើម្បីហោះហើរត្រឡប់មកភ្នំពេញ។',
      hotelName: 'Trip Completion (Phnom Penh Arrival)',
      mealsIncluded: ['Buffet Breakfast', 'Dim Sum Lunch'],
      guideAgenda: [
        { time: '09:00 AM - 12:00 PM', activity: 'ទស្សនា និងទិញទំនិញនៅផ្លូវថ្មើរជើង Beijing Road', location: 'Beijing Road' },
        { time: '12:30 PM - 01:30 PM', activity: 'អាហារថ្ងៃត្រង់ ឌីមសាំក្វាងទុងពិសេស', location: 'Dim Sum Restaurant' },
        { time: '03:00 PM - 04:30 PM', activity: 'រថយន្ត VIP ជូនដំណើរទៅព្រលានយន្តហោះ Baiyun (CAN)', location: 'Guangzhou Airport' },
        { time: '06:30 PM - 08:30 PM', activity: 'ជើងហោះហើរត្រង់មកដល់ភ្នំពេញដោយជោគជ័យ', location: 'Phnom Penh Arrival' }
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
    syncStatus: 'connected',
  },
};

