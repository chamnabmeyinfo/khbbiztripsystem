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
t('nav_home')        // Returns "Home" in current language
t('book_now')        // Returns "Book Now" or translated equivalent
```

## Language Detection Order
1. Check `localStorage` for saved language (`tripdesk_lang_v1`)
2. Auto-detect from `navigator.language` (first 2 chars)
3. Fallback to `'en'`

## Related Notes
- [[Currency Service]]
- [[AppContext]]
