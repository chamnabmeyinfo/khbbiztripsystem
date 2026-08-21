# 💱 Currency Service

← [[Home]] | File: `src/services/currencyService.ts`

## Supported Currencies

| Code | Symbol | Name | Rate (from USD) |
|---|---|---|---|
| USD | $ | US Dollar | 1.0 |
| EUR | € | Euro | 0.92 |
| GBP | £ | British Pound | 0.79 |
| JPY | ¥ | Japanese Yen | 154.5 |
| AED | AED | UAE Dirham | 3.67 |
| ILS | ₪ | Israeli Shekel | 3.72 |

> ⚠️ **Note:** Rates are **static/hardcoded** — not fetched from a live API. Future improvement needed.

## Functions

```typescript
// Convert USD amount to target currency
convertFromUSD(amountUSD: number, targetCurrency: CurrencyCode): number

// Convert from any currency back to USD
convertToUSD(amountInCurrency: number, sourceCurrency: CurrencyCode): number

// Format USD amount as localized currency string (e.g. ",299.00")
formatMoney(amountInUSD: number, targetCurrency: CurrencyCode, lang?: LanguageCode): string

// Format an already-converted amount as localized currency string
formatRawMoney(amountInCurrency: number, targetCurrency: CurrencyCode, lang?: LanguageCode): string
```

## Locale Mapping
```
en → en-US
km → km-KH
ar → ar-AE
he → he-IL
es → es-ES
ja → ja-JP
```

## JPY Special Case
Japanese Yen is formatted with **0 decimal places** (no cents).

## Related Notes
- [[i18n and Translations]]
- [[Data Models]]
