import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import app from "./app";

dotenv.config();

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

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
