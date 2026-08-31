# 🌐 i18n & Translations

← [[Home]] | File: `src/i18n/translations.ts` (36KB)

## Supported Languages

| Code | Language | Direction | Font |
|---|---|---|---|
| `en` | English | LTR | Default |
| `km` | Khmer | LTR | Khmer font |
| `ar` | Arabic | **RTL** | Arabic font |
| `he` | Hebrew | **RTL** | Hebrew font |
| `es` | Spanish | LTR | Default |
| `ja` | Japanese | LTR | Japanese font |

## RTL Support
```typescript
// Check if language is RTL
isRTL(language: LanguageCode): boolean  // true for 'ar' and 'he'

// Get CSS font family class for the language
getFontFamilyClass(language: LanguageCode): string
```

The `dir` attribute on the root `<div>` is set to `'rtl'` or `'ltr'` based on the current language (in `App.tsx`).

## How to Use Translations
In any component via [[AppContext]]:
```typescript
const { t } = useApp()
t('appName')            // Returns "KHB Trip" or translated equivalent
t('viewPublicSite')     // Returns "View Public Site" or translated equivalent
t('navInboundLeads')    // Returns "Inbound Leads (CRM)" or translated equivalent
```

## Field-Level AI Translation & Language Indicators
In addition to UI system localization, the system provides high-precision **Field-Level AI Translation and Visual Language Guidance** across all dynamic forms (`PackageEditorModal`, `PackageCategoryModal`, `BilingualListEditor`):
- **Visual Language Badges**: Unambiguous visual indicators (`🇰🇭 KM`, `🇺🇸 EN`, `🇨🇳 ZH`) attached to every input header so administrators immediately know which language belongs in which field.
- **Contextual Example Hints**: Tailored, domain-specific examples underneath each input field (e.g. `"China"`, `"Join our exclusive delegation with VIP factory tours"`, `"ឧ. ពិព័រណ៍ក្វាងចូវ"`) ensuring intuitive data entry.
- **`FieldAiTranslator` Component** (`src/components/admin/FieldAiTranslator.tsx`): Provides seamless single/dual-field and array bidirectional translation (Khmer 🇰🇭 ⇄ English 🇺🇸 ⇄ Multilingual) with clear direction indicators (`⚡ Translate 🇰🇭 KM ➔ 🇺🇸 EN`, `⚡ Translate 🇺🇸 EN ➔ 🇰🇭 KM`).
- **Package Localization Utility** (`src/utils/packageLocalization.ts`): Resolves runtime localized fields (`titleKm`/`titleEn`, `descriptionKm`/`descriptionEn`, `highlightsKm`/`highlightsEn`, itinerary agendas, etc.) based on active system language.
- **Server Translation Endpoint** (`/api/ai-translate` in `app.ts`): Secure server-side proxy powered by `@google/genai` with fallback cascade models (`gemini-3.7-flash`, `gemini-3.1-flash-lite`, `gemini-flash-latest`, `gemini-2.5-flash`).
- **Client Offline Translation Fallback** (`src/services/geminiService.ts`): Comprehensive `TRAVEL_TRANSLATION_FALLBACK_DICT` covering travel, Canton Fair B2B missions, VIP transport, hotels, meals, flight tickets, and itinerary milestones.

## Language Detection Order
1. Check `localStorage` for saved language (`tripdesk_lang_v1`)
2. Auto-detect from `navigator.language` (first 2 chars)
3. Fallback to `'en'`

## Related Notes
- [[Currency Service]]
- [[AppContext]]
