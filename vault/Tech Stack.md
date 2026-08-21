# 🛠️ Tech Stack & Build Pipeline

← [[Home]]

## Core Frontend Framework

| Library | Version | Role & Architectural Purpose |
|---|---|---|
| React | ^19.0.1 | Modern UI framework with React hooks and Context |
| TypeScript | ~5.8.2 | Strict static typing and complete interface validation |
| Vite | ^6.2.3 | Ultra-fast build tool and development server |
| TailwindCSS | ^4.1.14 | Next-gen CSS utility styling via `@tailwindcss/vite` |

---

## Document Generation & PDF Export

| Library | Version | Role & Purpose |
|---|---|---|
| `jspdf` | ^4.2.1 | Client-side statutory mission dossier and agenda PDF generator |
| `html2canvas` | ^1.4.1 | Visual canvas snapshotting for image exports |
| `@expo-google-fonts/noto-sans-khmer` | ^0.4.3 | Khmer Unicode glyph support for statutory PDFs |
| `@expo-google-fonts/noto-sans-arabic` | ^0.4.3 | Arabic glyph support |
| `@expo-google-fonts/noto-sans-hebrew` | ^0.4.1 | Hebrew glyph support |
| `@expo-google-fonts/noto-sans-jp` | ^0.4.3 | Japanese glyph support |

---

## Database, AI & Backend

| Library | Version | Role & Purpose |
|---|---|---|
| `firebase` | ^12.17.1 | Firestore database & Google OAuth authentication |
| `@google/genai` | ^2.4.0 | Official Google GenAI SDK for Gemini Copilot & Concierge |
| `express` | ^4.21.2 | Backend API server and static production fallback |
| `tsx` | ^4.21.0 | High-performance TypeScript execution in dev |
| `esbuild` | ^0.25.0 | Standalone CommonJS bundling for Cloud Run production start |

---

## UI, Icons & Animations

| Library | Version | Role & Purpose |
|---|---|---|
| `lucide-react` | ^0.546.0 | Clean vector icon system |
| `motion` | ^12.23.24 | Smooth transitions & entering animations |
| `canvas-confetti` | ^1.9.4 | Booking celebration animation |

---

## NPM Build & Verification Scripts

| Script Command | Target / Action |
|---|---|
| `npm run dev` | Boots dev server via `tsx server.ts` on port 3000 |
| `npm run build` | Builds Vite client bundle + bundles `server.ts` into `dist/server.cjs` via `esbuild` |
| `npm run start` | Launches compiled production server via `node dist/server.cjs` |
| `npm run lint` | Runs `tsc --noEmit` for zero-error type safety |
| `npm run clean` | Purges old build artifacts |

---

## Related Notes
- [[Architecture Overview]]
- [[File Structure]]
- [[Home]]

