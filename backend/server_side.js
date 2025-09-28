// server_side.js
// --------------------------------------------------
// Minimal Express API for the Tennis project (cart)
// --------------------------------------------------

const express = require("express");
const cors = require("cors");

const app = express();

// --- CORS: list the origins that are allowed to call your API
const allowedOrigins = [
  "https://precious-jalebi-364a34.netlify.app", // your Netlify site
  "http://localhost:5173",
  "http://localhost:3000"
];

app.use(cors({
  origin: function (origin, cb) {
    // allow tools with no Origin (curl, Postman) and the allowed list
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

// Handle preflights quickly
app.options("*", cors());

// --- Body parsers (safe even if you also read from req.query)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- In-memory state
let cart = [];
let items = 0;

// --- Health check
app.get("/health", (_req, res) => res.send("ok"));

// Helper: read payload from body or from ?data=JSON string
function getPayload(req) {
  if (req.body && Object.keys(req.body).length) return req.body;
  if (req.query?.data) {
    try { return JSON.parse(req.query.data); } catch { /* ignore */ }
  }
  return {};
}

// --- Main endpoint
app.post("/post", (req, res) => {
  const q = getPayload(req);
  console.log("New express client. Payload:", q);

  switch (q.action) {
    case "addToCart": {
      const itemName = q.name;
      const itemPrice = q.price;
      items = Number(q.items ?? items);

      if (itemName == null || itemPrice == null) {
        return res.status(400).json({ ok: false, msg: "Missing name or price" });
      }

      cart.push({ itemName, itemPrice });
      return res.json({ ok: true, action: "addToCart", items, cart });
    }

    case "populateCart": {
      return res.json({ ok: true, action: "populateCart", cart, items });
    }

    case "removeItem": {
      const idx = Number(q.row);
      if (Number.isInteger(idx) && idx >= 0 && idx < cart.length) {
        cart.splice(idx, 1);
        items = Math.max(0, items - 1);
        return res.json({ ok: true, action: "removeItem", items, cart });
      }
      return res.status(400).json({ ok: false, msg: "Invalid row index" });
    }

    case "populateBubble": {
      return res.json({ ok: true, action: "populateBubble", items });
    }

    default:
      return res.status(400).json({ ok: false, msg: "Unknown action" });
  }
});

// --- Listen (Render/Heroku style)
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});

