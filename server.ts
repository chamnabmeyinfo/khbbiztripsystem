import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Shared Gemini client utility on the server with User-Agent telemetry
  const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") return null;
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // Health check API
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "khb-ai-copilot", timestamp: new Date().toISOString() });
  });

  // Advanced AI Copilot Endpoint
  app.post("/api/ai-copilot", async (req, res) => {
    try {
      const { prompt, contextData } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Missing prompt" });
      }

      const client = getAiClient();
      const lang = contextData?.language || "km";

      if (!client) {
        return res.status(200).json({
          mode: "fallback_needed",
          message: "No Gemini API key available on server, triggering adaptive client engine."
        });
      }

      const systemInstruction = `You are the Lead Autonomous Operations AI & Strategic Copilot for KHB Events Business Trip System.
You possess adaptive reasoning and full authority to perform CRUD operations, multi-entity orchestration, financial yield analysis, tour itinerary engineering, and procurement optimization across the KHB ERP ecosystem:
1. Tour Packages (title, destination, country, coordinates, images, priceUSD, discountPriceUSD, durationDays, durationNights, itinerary, inclusions, exclusions, tags, availableDates, emergencyContact)
2. Suppliers (hotel, transport, airline, guide, restaurant, activity, insurance; payment terms, contact details)
3. Cost Templates & Pricing (cost items, adultMarginPercent, minGroupSize, fixed & per-pax costs)
4. Purchase Orders (PO numbers, supplier, line items, totalUSD, due dates, status)
5. Customer & Supplier Payments (amounts, methods, dates, status)
6. Expenses (category, description, amountUSD, submittedBy)

CRITICAL INSTRUCTIONS FOR ADAPTIVE THINKING:
- First, deconstruct the user's request. Adapt your thinking persona dynamically (e.g., Financial Yield Strategist, Tour Package Architect, Procurement Negotiator, Multi-Entity Orchestrator).
- Formulate an explicit 4-step cognitive thinking trace (intent_extraction, context_retrieval, strategic_reasoning, action_synthesis).
- Identify operational opportunities and risk alerts (e.g. cash runway impact, margin gains, supplier lead times, seasonal discounts).
- Synthesize actionable system actions with complete, validated data payloads ready for one-click live execution.
- Respond in the user's requested language (${lang === 'km' ? 'Khmer / ភាសាខ្មែរ' : lang === 'ar' ? 'Arabic' : lang === 'he' ? 'Hebrew' : lang === 'es' ? 'Spanish' : lang === 'ja' ? 'Japanese' : 'English'}).`;

      const promptPayload = `${systemInstruction}

CURRENT LIVE ERP STATE:
- Packages (${contextData?.packages?.length || 0}): ${(contextData?.packages || []).map((p: any) => `${p.id}: "${p.title}" ($${p.priceUSD})`).join(", ")}
- Suppliers (${contextData?.suppliers?.length || 0}): ${(contextData?.suppliers || []).map((s: any) => `${s.id}: "${s.name}" (${s.type})`).join(", ")}
- Purchase Orders (${contextData?.purchaseOrders?.length || 0}): ${(contextData?.purchaseOrders || []).map((po: any) => `${po.poNumber}: ${po.supplierName} ($${po.totalUSD})`).join(", ")}
- Cost Templates (${contextData?.costTemplates?.length || 0})
- Operating Expenses (${contextData?.expenses?.length || 0})

USER REQUEST:
"${prompt}"

Please respond strictly with a valid JSON object in this schema:
{
  "thoughtTrace": {
    "adaptedPersona": "Strategic Role Adapted (e.g. Chief Travel Architect | Financial Yield Strategist | Procurement Master | Autonomous Operator)",
    "detectedIntent": "Precise summary of intent",
    "confidence": 98,
    "steps": [
      {
        "phase": "intent_extraction",
        "title": "Intent & Constraint Deconstruction",
        "detail": "Detailed explanation of entities, duration, price, parameters identified or inferred",
        "insights": ["Key extracted point 1", "Key extracted point 2"]
      },
      {
        "phase": "context_retrieval",
        "title": "ERP System Cross-Referencing",
        "detail": "Analysis of existing database records, active inventory, and dependencies",
        "insights": ["Contextual point 1"]
      },
      {
        "phase": "strategic_reasoning",
        "title": "Adaptive Strategy & Optimization",
        "detail": "Reasoning about pricing margins, supplier matchmaking, logistical itinerary flow, or cash runway",
        "insights": ["Strategic recommendation 1", "Strategic recommendation 2"]
      },
      {
        "phase": "action_synthesis",
        "title": "Execution Formulation",
        "detail": "Summary of proposed database mutations ready for live execution"
      }
    ],
    "riskOrOpportunityAlerts": [
      { "type": "opportunity | risk | note", "message": "Helpful proactive alert or optimization tip" }
    ]
  },
  "text": "Your helpful, professional response in ${lang === 'km' ? 'Khmer (ភាសាខ្មែរ)' : 'English'} explaining the outcome, strategic rationale, and next steps.",
  "actions": [
    {
      "type": "create_package | update_package | delete_package | create_supplier | update_supplier | delete_supplier | create_cost_template | create_purchase_order | log_expense | log_payment | query_analytics",
      "summary": "Clear 1-line action description",
      "payload": { ...complete fields ready for live ERP insertion... },
      "explanation": "Why this action is proposed"
    }
  ]
}`;

      // Resilient Model Fallback Chain & Retry Logic for High Demand / 503 / 429
      const candidateModels = ["gemini-3.7-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
      let parsedData: any = null;
      let lastErrorMessage = "";

      for (const modelName of candidateModels) {
        let attempts = 0;
        const maxAttemptsForModel = 2;

        while (attempts < maxAttemptsForModel) {
          attempts++;
          try {
            const response = await client.models.generateContent({
              model: modelName,
              contents: [
                {
                  role: "user",
                  parts: [{ text: promptPayload }],
                },
              ],
              config: {
                responseMimeType: "application/json",
                temperature: 0.2,
              },
            });

            let rawJson = (response.text || "").trim();
            // Clean markdown code blocks if returned
            if (rawJson.startsWith("```json")) {
              rawJson = rawJson.replace(/^```json\s*/, "").replace(/\s*```$/, "");
            } else if (rawJson.startsWith("```")) {
              rawJson = rawJson.replace(/^```\s*/, "").replace(/\s*```$/, "");
            }

            parsedData = JSON.parse(rawJson);
            break; // Success with this model!
          } catch (modelErr: any) {
            lastErrorMessage = modelErr?.message || String(modelErr);
            const isTransient =
              lastErrorMessage.includes("503") ||
              lastErrorMessage.includes("UNAVAILABLE") ||
              lastErrorMessage.includes("high demand") ||
              lastErrorMessage.includes("429") ||
              lastErrorMessage.includes("RESOURCE_EXHAUSTED");

            if (isTransient && attempts < maxAttemptsForModel) {
              // Wait briefly before retrying this model
              await new Promise((resolve) => setTimeout(resolve, 800));
            } else {
              // Move to next candidate model in fallback chain
              break;
            }
          }
        }

        if (parsedData) {
          break; // Successfully generated and parsed
        }
      }

      if (parsedData) {
        return res.json({ mode: "gemini_success", data: parsedData });
      }

      // If all upstream Gemini models are experiencing temporary demand spikes,
      // seamlessly return fallback_needed so the frontend adaptive cognitive engine activates instantly
      console.warn("Gemini upstream experiencing temporary high demand, activating adaptive fallback:", lastErrorMessage);
      return res.status(200).json({
        mode: "fallback_needed",
        message: "Gemini capacity busy, adaptive autonomous engine activated.",
      });
    } catch (error: any) {
      console.warn("AI Copilot request error handled gracefully:", error?.message || error);
      return res.status(200).json({
        mode: "fallback_needed",
        message: "Handled gracefully via adaptive client engine",
      });
    }
  });

  // Advanced AI Tour Package Parser Endpoint
  app.post("/api/ai-parse-package", async (req, res) => {
    try {
      const { text, language } = req.body;
      if (!text || typeof text !== "string" || !text.trim()) {
        return res.status(400).json({ error: "Missing text to parse" });
      }

      const client = getAiClient();
      const lang = language || "km";

      if (!client) {
        return res.status(200).json({
          mode: "fallback_needed",
          message: "No Gemini API key on server, using adaptive client parser.",
        });
      }

      const parsePrompt = `You are the Master Travel Architect & Tour Package Data Parser for KHB Events Business Trip System.
Analyze the following unstructured raw text (which may be a Telegram message, Facebook announcement, brochure, WhatsApp message, PDF export, or flyer in Khmer, English, Vietnamese, or other languages) and extract/synthesize a complete, production-ready TourPackage JSON object.

RAW UNSTRUCTURED TOUR TEXT:
"""
${text}
"""

EXTRACTION & INFERENCE RULES:
1. Extract or intelligently infer all commercial, logistical, itinerary, tour guide, and emergency attributes.
2. Title: A clean, compelling tour package title matching the language of the source or standard bilingual format.
3. Destination & Country: Specific city/island/region and country (e.g. "Ho Chi Minh & Phu Quoc", "Bangkok & Pattaya", "Tokyo & Osaka", "Singapore", "Guangzhou").
4. Category: Choose from 'trade_mission', 'franchise', 'coffee_tea_bakery', 'technology', 'retail_expo', 'cultural', 'luxury'.
5. PriceUSD & DiscountPriceUSD: Extract base price (number in USD). If an early-bird or discount price/date is mentioned, extract discountPriceUSD.
6. Duration: durationDays (number) and durationNights (number).
7. Hotel & Flight: hotelStars (number, default 4 or 5), flightIncluded (boolean).
8. AvailableDates: Array of dates in YYYY-MM-DD format (e.g. ["2026-10-29", "2026-10-30"]).
9. Tags: Array of tags like ["trending", "popular", "cultural", "luxury"].
10. Description: A well-written promotional summary highlighting the business opportunities, delegation benefits, and key value propositions.
11. Highlights: 4-7 punchy bullet points with relevant emojis (Wholesale sourcing, Equipment, Franchise licensing, VIP expo access, Networking).
12. Inclusions: 6-10 clear itemized inclusions (transport, 4-star hotel, buffet breakfast, ferry/flights, bilingual guide, VIP badges, fast-track border).
13. Exclusions: 3-5 standard exclusions (personal shopping, personal meals, insurance).
14. TermsAndConditions: 4-6 official delegate terms and policies (Passport validity, 50% deposit rule, cancellation/refund policy, code of conduct, force majeure).
15. TourGuide: {
      name: string (e.g. "Mr. Tim Vutha" or lead coordinator mentioned, default "Mr. Tim Vutha & Senior Escort Team"),
      title: string,
      phone: string,
      telegram: string,
      languages: string[],
      badgeNumber: string,
      bio: string,
      briefingMeetingPoint: string,
      briefingTime: string,
      photoUrl: string
    }
16. Itinerary: Array of day-by-day steps:
    [
      {
        day: 1,
        title: "Day 1 Title",
        description: "Detailed description of activities",
        hotelName: "Hotel Name (4-Star)",
        mealsIncluded: ["Breakfast", "Dinner"],
        guideAgenda: [
          { time: "06:00 AM", activity: "Assembly & Departure", location: "Departure Point", notes: "Passport required" },
          { time: "02:00 PM", activity: "Expo / Factory Visit", location: "Convention Center" }
        ]
      }
    ]
17. Coordinates: { lat: number, lng: number, mapX: number, mapY: number } (appropriate for the destination).
18. EmergencyContact: { country: string, police: string, ambulance: string, touristHelpline: string, embassySupport: string }.
19. OptionalPrograms: Array of optional programs if any are mentioned or suitable for delegates.

Please respond strictly with a valid JSON object in this exact schema:
{
  "summary": "1-2 sentence summary of what was extracted from the raw text in ${lang === 'km' ? 'Khmer (ភាសាខ្មែរ)' : 'English'}",
  "package": {
    "title": "string",
    "destination": "string",
    "country": "string",
    "category": "string",
    "priceUSD": 350,
    "discountPriceUSD": 299,
    "durationDays": 4,
    "durationNights": 3,
    "hotelStars": 4,
    "flightIncluded": true,
    "availableDates": ["2026-10-29"],
    "tags": ["trending", "popular"],
    "description": "string",
    "highlights": ["string"],
    "inclusions": ["string"],
    "exclusions": ["string"],
    "termsAndConditions": ["string"],
    "coordinates": { "lat": 10.8231, "lng": 106.6297, "mapX": 74, "mapY": 62 },
    "images": [
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200&auto=format&fit=crop&q=80"
    ],
    "tourGuide": {
      "name": "string",
      "title": "string",
      "phone": "string",
      "telegram": "string",
      "languages": ["Khmer", "English"],
      "badgeNumber": "string",
      "bio": "string",
      "briefingMeetingPoint": "string",
      "briefingTime": "string",
      "photoUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80"
    },
    "itinerary": [
      {
        "day": 1,
        "title": "string",
        "description": "string",
        "hotelName": "string",
        "mealsIncluded": ["Breakfast"],
        "guideAgenda": [
          { "time": "08:00 AM", "activity": "string", "location": "string", "notes": "string" }
        ]
      }
    ],
    "optionalPrograms": [
      {
        "id": "opt_1",
        "title": "string",
        "description": "string",
        "additionalCostUSD": 100,
        "durationHours": 3,
        "recommendedAudience": "string",
        "highlights": ["string"],
        "includesGuide": true,
        "includedMeals": ["Dinner"],
        "meetingPoint": "string"
      }
    ],
    "emergencyContact": {
      "country": "string",
      "police": "113",
      "ambulance": "115",
      "touristHelpline": "string",
      "embassySupport": "string"
    }
  }
}`;

      const candidateModels = ["gemini-3.7-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
      let parsedResult: any = null;

      for (const modelName of candidateModels) {
        try {
          const response = await client.models.generateContent({
            model: modelName,
            contents: [{ role: "user", parts: [{ text: parsePrompt }] }],
            config: {
              responseMimeType: "application/json",
              temperature: 0.1,
            },
          });

          let rawJson = (response.text || "").trim();
          if (rawJson.startsWith("```json")) {
            rawJson = rawJson.replace(/^```json\s*/, "").replace(/\s*```$/, "");
          } else if (rawJson.startsWith("```")) {
            rawJson = rawJson.replace(/^```\s*/, "").replace(/\s*```$/, "");
          }

          parsedResult = JSON.parse(rawJson);
          if (parsedResult?.package) {
            break;
          }
        } catch (err) {
          console.warn(`Model ${modelName} parsing attempt failed, trying next:`, err);
        }
      }

      if (parsedResult && parsedResult.package) {
        return res.json({
          mode: "gemini_success",
          summary: parsedResult.summary || "Extracted tour package attributes successfully.",
          package: parsedResult.package,
        });
      }

      return res.status(200).json({
        mode: "fallback_needed",
        message: "Gemini parser unavailable, activating adaptive client parser.",
      });
    } catch (error: any) {
      console.warn("AI parse package error:", error);
      return res.status(200).json({
        mode: "fallback_needed",
        message: "Handled gracefully via adaptive client parser",
      });
    }
  });

  // AI Theme & Color Detection Endpoint
  app.post("/api/ai-detect-theme", async (req, res) => {
    try {
      const { prompt, imageUrl, destination, brandKeyword, language } = req.body;
      const client = getAiClient();
      const lang = language || "km";

      if (!client) {
        return res.status(200).json({
          mode: "fallback_needed",
          message: "No Gemini API key available, using adaptive color detection engine.",
        });
      }

      const themeSystemPrompt = `You are the Lead Digital Brand Architect & UI Color Palette Engineer for KHB Events Business Trip Platform.
Your task is to analyze the user's input (a brand keyword, destination, delegation theme, industry category, or image description) and synthesize a sophisticated, mathematically harmonious, WCAG AA compliant color code template for the entire web application.

INPUT DATA:
- Prompt/Request: "${prompt || ''}"
- Destination/Event: "${destination || ''}"
- Brand Keyword: "${brandKeyword || ''}"
- Image Reference: "${imageUrl || ''}"

DESIGN & HARMONY RULES:
1. Avoid generic purple-to-blue clichés.
2. Select a refined primary brand color suitable for international B2B delegations (e.g., Deep Oceanic Azure #0284c7, Canton Emerald Jade #059669, Diplomatic Navy #0f172a, Imperial Saffron #d97706, Crimson Delegation #be123c, Cyber Cobalt #2563eb, Royal Amethyst #7c3aed, Executive Titanium #475569).
3. Primary Hover color (a slightly darker or more saturated hue).
4. Secondary anchor color for dark navigation bars, header ribbons, and structural framing (e.g. #0f172a, #090d16, #064e3b, #1e1b4b, #31102b).
5. Radiant Accent color for tags, badges, savings pills, and star ratings (e.g. #f59e0b, #10b981, #06b6d4, #f43f5e, #fbbf24).
6. Dark Background (#090d16, #0b1120, #0a0f1d, #022c22) and Light Background (#f8fafc, #f0fdf4, #fffbeb, #fdf2f8).
7. Dark Card Surface (#111827, #0f172a, #064e3b, #1e1b4b) and Light Card Surface (#ffffff, #f8fafc).
8. Text Contrast recommendation.
9. Explain your design psychology rationale in ${lang === 'km' ? 'Khmer (ភាសាខ្មែរ)' : 'English'}.
10. Match one of the closest standard presets ('navy' | 'emerald' | 'crimson' | 'indigo' | 'amber' | 'cyan' | 'slate' | 'custom').

Respond strictly in valid JSON format with this exact structure:
{
  "themeName": "Theme Title (e.g., Canton Fair High-Tech Emerald | Royal Phnom Penh Gold)",
  "suggestedPreset": "navy",
  "primary": "#0284c7",
  "primaryHover": "#0369a1",
  "secondary": "#0f172a",
  "accent": "#f59e0b",
  "accentGlow": "rgba(245, 158, 11, 0.25)",
  "bgDark": "#0b1120",
  "bgLight": "#f8fafc",
  "cardDark": "#111827",
  "cardLight": "#ffffff",
  "textContrast": "#ffffff",
  "rationale": "Clear 2-sentence rationale explaining the psychological and cultural alignment of the colors.",
  "fontScaleRecommendation": "normal"
}`;

      const candidateModels = ["gemini-3.7-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
      let parsedTheme: any = null;

      for (const modelName of candidateModels) {
        try {
          const response = await client.models.generateContent({
            model: modelName,
            contents: [
              {
                role: "user",
                parts: [{ text: themeSystemPrompt }],
              },
            ],
            config: {
              responseMimeType: "application/json",
              temperature: 0.3,
            },
          });

          let rawJson = (response.text || "").trim();
          if (rawJson.startsWith("```json")) {
            rawJson = rawJson.replace(/^```json\s*/, "").replace(/\s*```$/, "");
          } else if (rawJson.startsWith("```")) {
            rawJson = rawJson.replace(/^```\s*/, "").replace(/\s*```$/, "");
          }
          parsedTheme = JSON.parse(rawJson);
          if (parsedTheme && parsedTheme.primary) {
            break;
          }
        } catch (e) {
          // Fall through to next model
        }
      }

      if (parsedTheme && parsedTheme.primary) {
        return res.json({
          mode: "gemini_success",
          palette: parsedTheme,
        });
      }

      return res.status(200).json({
        mode: "fallback_needed",
        message: "Activating adaptive client theme engine",
      });
    } catch (err: any) {
      console.warn("AI theme detection error:", err);
      return res.status(200).json({
        mode: "fallback_needed",
        message: "Handled gracefully via adaptive client fallback",
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = fs.existsSync(path.join(process.cwd(), "dist", "index.html"))
      ? path.join(process.cwd(), "dist")
      : typeof __dirname !== "undefined" && fs.existsSync(path.join(__dirname, "index.html"))
      ? __dirname
      : path.join(process.cwd(), "dist");

    const KNOWN_PACKAGES: Record<string, { title: string; desc: string; img: string }> = {
      'pkg_canton_fair_2026_phase1': {
        title: 'Canton Fair 2026 Phase 1 (Electronics & Machinery)',
        desc: '📍 Guangzhou, China • 🗓️ 5 Days / 4 Nights • 💼 Official B2B Trade Mission & VIP Business Delegation Agenda.',
        img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'
      },
      'pkg_canton_fair_2026_phase2': {
        title: 'Canton Fair 2026 Phase 2 (Consumer Goods & Home Decor)',
        desc: '📍 Guangzhou, China • 🗓️ 5 Days / 4 Nights • 💼 Official B2B Trade Mission & VIP Business Delegation Agenda.',
        img: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80'
      },
      'pkg_canton_fair_2026_phase3': {
        title: 'Canton Fair 2026 Phase 3 (Textiles, Fashion & Health)',
        desc: '📍 Guangzhou, China • 🗓️ 5 Days / 4 Nights • 💼 Official B2B Trade Mission & VIP Business Delegation Agenda.',
        img: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80'
      },
      'canton-fair-2026-phase1': {
        title: 'Canton Fair 2026 Phase 1 (Electronics & Machinery)',
        desc: '📍 Guangzhou, China • 🗓️ 5 Days / 4 Nights • 💼 Official B2B Trade Mission & VIP Business Delegation Agenda.',
        img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'
      },
      'canton-fair-2026-phase2': {
        title: 'Canton Fair 2026 Phase 2 (Consumer Goods & Home Decor)',
        desc: '📍 Guangzhou, China • 🗓️ 5 Days / 4 Nights • 💼 Official B2B Trade Mission & VIP Business Delegation Agenda.',
        img: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80'
      },
      'canton-fair-2026-phase3': {
        title: 'Canton Fair 2026 Phase 3 (Textiles, Fashion & Health)',
        desc: '📍 Guangzhou, China • 🗓️ 5 Days / 4 Nights • 💼 Official B2B Trade Mission & VIP Business Delegation Agenda.',
        img: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80'
      }
    };

    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      const indexPath = path.join(distPath, "index.html");
      if (!fs.existsSync(indexPath)) {
        return res.status(404).send("Application not built.");
      }

      let html = fs.readFileSync(indexPath, "utf8");
      const pkgKey = (req.query.a || req.query.agenda || req.query.pkg || req.query.p) as string;
      const matched = pkgKey ? KNOWN_PACKAGES[pkgKey] : null;

      if (matched) {
        html = html
          .replace(/<title>.*?<\/title>/, `<title>${matched.title} | KHB Business Trips</title>`)
          .replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${matched.title}" />`)
          .replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${matched.desc}" />`)
          .replace(/<meta property="og:image" content=".*?" \/>/, `<meta property="og:image" content="${matched.img}" />`)
          .replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${matched.title}" />`)
          .replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${matched.desc}" />`)
          .replace(/<meta name="twitter:image" content=".*?" \/>/, `<meta name="twitter:image" content="${matched.img}" />`);
      }

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(html);
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 KHB Trip Server running on http://localhost:${PORT}`);
  });
}

startServer();
