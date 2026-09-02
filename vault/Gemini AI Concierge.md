# 🤖 Gemini AI Concierge

← [[Home]] | File: `src/components/portal/SupportChatWidget.tsx`

## Overview
A comprehensive AI intelligence suite powered by **Google Gemini API** (`@google/genai` v2.4.0) with support for:
- 24/7 AI Concierge & Support Chat widget (`SupportChatWidget.tsx`)
- Server-Side Gemini API Proxy & Fallback Cascade (`/api/ai-copilot`, `/api/ai-translate`, `/api/ai-parse-package`, `/api/ai-detect-theme` in `app.ts`)
- **AI Smart Semantic Text-to-Package Analyzer (`/api/ai-parse-package`)**:
  - **Strict Match-Only & Zero Guessing Directive**: Strict prompt architecture and client-side heuristic engine only extract and populate fields that are explicitly stated in the input text. If any information is missing, ambiguous, or not mentioned (e.g. guide contact, flight status, itinerary details, hotel star rating), it is left empty/undefined without generating artificial placeholders or invented defaults.
  - **English-First Semantic Focus**: Initial AI Auto-Fill cleanly populates verified English fields from raw brochures, Telegram announcements, and flyers, leaving secondary language fields clean for on-demand translation later.
  - **Clean State & Non-Destructive Auto-Input**: Updates existing state non-destructively, matching only explicit fields and leaving existing manual inputs untouched if a field is not present in the new text.
  - **Field Matching & Confidence Metrics**: Returns exact matched fields (`matchedFields`) and individual section confidence scores (0-100%) for visual verification in the editor modal.
  - **On-Demand Package Translation**: Supports 1-click full-package bilingual translation (`handleTranslateEntirePackage` EN ➔ KM or KM ➔ EN) at any point during editing.
- Multi-tier model fallback: `gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-3.7-flash`, `gemini-3.1-flash-lite`, `gemini-flash-latest`
- High-precision Field Translation & Package Translation with bilingual resolution (Khmer 🇰🇭 ⇄ English 🇺🇸)

## How It Works
1. User clicks the chat bubble (bottom-right corner)
2. Types a message or selects a quick-reply option
3. Message is sent to Gemini API with context about their bookings
4. AI responds as a concierge agent
5. Messages are stored in Firestore `/support_messages`

## Requirements
- `GEMINI_API_KEY` must be set in `.env` file
- User must be logged in to access the chat

## Integration in AppContext
```typescript
sendSupportMessage(chatId: string, text: string, senderRole?: 'traveler' | 'admin')
```

## Message Roles

| Sender Role | Description |
|---|---|
| `user` | Traveller message |
| `ai` | Gemini AI response |
| `agent` | Human admin response |
| `system` | System messages |

## Setup
Create `.env` in project root:
```
GEMINI_API_KEY=your_api_key_here
APP_URL=http://localhost:3000
```

Get your API key from: https://aistudio.google.com/apikey

## Related Notes
- [[Authentication]]
- [[Firebase and Firestore]]
- [[Tech Stack]]
