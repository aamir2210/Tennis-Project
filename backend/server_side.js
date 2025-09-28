// server_side.js
// --------------------------------------------------
// Minimal Express API for the Tennis project (cart)
// --------------------------------------------------

const express = require("express");
const cors = require("cors");

const app = express();

// --- CORS: allowed origins (Netlify + local dev)
const allowedOrigins = [
  "https://courtcrafters.netlify.app", // Netlify site
  "http://localhost:5173",                      // Vite dev
  "http://localhost:3000"                       // CRA dev
];

app.use(
  cors({
    origin: function (origin, cb) {
      // allow tools with no Origin (curl, Postman) and the allowed list
      if (!origin || allowedOrigins.includes(origin)) {
        return cb(null, true);
      }
      return cb(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

// Handle preflight requests quickly
app.options("*", cors());

// --- Body parsers
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
    try {
      return JSON.parse(req.query.data);
    } catch {
      /* ignore */
    }
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
      const itemPrice = Number(q.price);
  
      if (!itemName || Number.isNaN(itemPrice)) {
        return res.status(400).json({ ok: false, msg: "Missing/invalid name or price" });
      }
  
      // Add item to cart
      cart.push({ itemName, itemPrice });
  
      // Always recompute
      items = cart.length;
  
      return res.json({ ok: true, action: "addToCart", items, cart });
    }
  
    case "removeItem": {
      const idx = Number(q.row);
  
      if (Number.isInteger(idx) && idx >= 0 && idx < cart.length) {
        cart.splice(idx, 1);
  
        // Always recompute after removal
        items = cart.length;
  
        return res.json({ ok: true, action: "removeItem", items, cart });
      }
  
      return res.status(400).json({ ok: false, msg: "Invalid row index" });
    }
  
    case "populateCart": {
      return res.json({ ok: true, action: "populateCart", items: cart.length, cart });
    }
  
    case "populateBubble": {
      return res.json({ ok: true, action: "populateBubble", items: cart.length });
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
