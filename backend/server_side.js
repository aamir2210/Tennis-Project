// server_side.js
var express = require('express');
var cors = require('cors');

var app = express();

// CORS for your Netlify site (or "*" if you prefer)
app.use(cors({ origin: '*' })); // or: origin: 'https://<your-netlify-site>.netlify.app'

// These parsers are safe to enable even if you read from req.query
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



const express = require("express");
const cors = require("cors");

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));   // for form / query fallbacks
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173", "https://YOUR-FRONTEND.netlify.app"]
}));

// state
let cart = [];
let items = 0;

// health check
app.get("/health", (_, res) => res.send("ok"));

// helper: read { action, ... } from body or from ?data=JSON
function getPayload(req) {
  if (req.body && Object.keys(req.body).length) return req.body;
  if (req.query?.data) {
    try { return JSON.parse(req.query.data); } catch (_) {}
  }
  return {};
}

app.post("/post", (req, res) => {
  const q = getPayload(req);
  console.log("New express client");
  console.log("Payload:", q);

  if (q.action === "addToCart") {
    const itemName = q.name;
    const itemPrice = q.price;
    items = Number(q.items ?? items);

    if (itemName == null || itemPrice == null) {
      return res.status(400).json({ ok: false, msg: "Missing name or price" });
    }

    cart.push({ itemName, itemPrice });
    return res.json({ ok: true, action: "addToCart", items, cart });

  } else if (q.action === "populateCart") {
    return res.json({ ok: true, action: "populateCart", cart, items });

  } else if (q.action === "removeItem") {
    const row = Number(q.row);
    if (Number.isInteger(row) && row >= 0 && row < cart.length) {
      cart.splice(row, 1);        // remove by index
      items = Math.max(0, items - 1);
      return res.json({ ok: true, action: "removeItem", items, cart });
    }
    return res.status(400).json({ ok: false, msg: "Invalid row index" });

  } else if (q.action === "populateBubble") {
    return res.json({ ok: true, action: "populateBubble", items });

  } else {
    return res.status(400).json({ ok: false, msg: "Unknown action" });
  }
});

// IMPORTANT: proper listen for cloud hosts
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
