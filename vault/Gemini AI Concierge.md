# 🤖 Gemini AI Concierge

← [[Home]] | File: `src/components/portal/SupportChatWidget.tsx`

## Overview
A 24/7 AI-powered support chat widget powered by **Google Gemini API** (`@google/genai` v2.4.0).

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
