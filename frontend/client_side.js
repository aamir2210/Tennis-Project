// =======================
// Client_Side JavaScript for Court Crafters
// Authors: Ayaz Bhutta, Giovanni Rossi, and Aamir Sayed
// =======================

// --- BACKEND URL ----------------------------------------------
// Option 1 (recommended for deploy): in your HTML's <head> add:
// <script>window.API_BASE = "https://YOUR-BACKEND.onrender.com";</script>
// Option 2: edit the default below.
const API_BASE =
  (typeof window !== "undefined" && window.API_BASE)
    ? window.API_BASE
    : "https://tennis-project-gei8.onrender.com";

const POST_URL = `${API_BASE}/post`;

// ---------- small fetch helper ----------
async function postJSON(payload) {
  const res = await fetch(POST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ---------- render helpers ----------
function renderBubble(items) {
  const bubble = document.getElementById("cart_bubble");
  if (!bubble) return;
  const n = Number(items || 0);
  if (n <= 0) {
    bubble.innerHTML = "";
    bubble.style.visibility = "hidden";
  } else {
    bubble.innerHTML = n;
    bubble.style.visibility = "visible";
  }
}

function renderTable(cart) {
  const table = document.getElementById("orderSummary");
  const totalEl = document.getElementById("total");
  if (!table || !totalEl) return;

  // Clear all rows except the header (assumes header is rowIndex 0)
  while (table.rows.length > 1) table.deleteRow(1);

  let total = 0;
  (cart || []).forEach(item => {
    const row = table.insertRow(table.rows.length);
    row.insertCell(0).innerHTML = item.itemName;          // Item
    row.insertCell(1).innerHTML = 1;                       // Quantity (UI only)
    row.insertCell(2).innerHTML = Number(item.itemPrice);  // Amount
    row.insertCell(3).innerHTML =
      '<button onclick="editData(this)" class="purchase_button">Add</button>' +
      '<button onclick="deleteData(this)" class="purchase_button">Delete</button>';
    total += Number(item.itemPrice);
  });

  totalEl.innerHTML = Math.floor(total);
}

// ---------- unified response handler ----------
function handleResponse(resp) {
  if (!resp || typeof resp !== "object") return;

  // These actions all include the fresh server state (items, cart)
  if (resp.action === "addToCart" ||
      resp.action === "removeItem" ||
      resp.action === "populateCart") {
    renderBubble(resp.items);
    renderTable(resp.cart);
  }

  if (resp.action === "populateBubble") {
    renderBubble(resp.items);
  }
}

// ---------- page initializers ----------
function initializeSession() {
  // Font loader
  const link = document.createElement("link");
  link.setAttribute("rel", "stylesheet");
  link.setAttribute("type", "text/css");
  link.setAttribute("href", "https://fonts.googleapis.com/css?family=Agdasima:300,400,700");
  document.head.appendChild(link);

  // Bubble from server
  postJSON({ action: "populateBubble" })
    .then(handleResponse)
    .catch(err => console.error("populateBubble error:", err));
}

function initializeOrderPage() {
  // Font loader
  const link = document.createElement("link");
  link.setAttribute("rel", "stylesheet");
  link.setAttribute("type", "text/css");
  link.setAttribute("href", "https://fonts.googleapis.com/css?family=Agdasima:300,400,700");
  document.head.appendChild(link);

  // Bubble + full cart
  postJSON({ action: "populateBubble" })
    .then(handleResponse)
    .catch(err => console.error("populateBubble error:", err));

  postJSON({ action: "populateCart" })
    .then(handleResponse)
    .catch(err => console.error("populateCart error:", err));
}

// ---------- cart actions ----------
async function addToCart(name, price) {
  try {
    const resp = await postJSON({
      action: "addToCart",
      name,
      price: Number(price),
    });
    handleResponse(resp);     // bubble + table re-rendered from server
    alert(name + " was added to cart!");
  } catch (e) {
    console.error("addToCart error:", e);
    alert("Sorry, could not add to cart.");
  }
}

async function deleteData(button) {
  // Which row was clicked? Convert to server index (skip header)
  const row = button.parentNode.parentNode;
  const rowIdx = row.rowIndex - 1;

  try {
    const resp = await postJSON({ action: "removeItem", row: rowIdx });
    handleResponse(resp);     // bubble + table re-rendered from server
  } catch (e) {
    console.error("removeItem error:", e);
    alert("Sorry, could not remove the item.");
  }
}

// ---------- quantity editor (UI-only math) ----------
function editData(button) {
  const row = button.parentNode.parentNode;
  const quantityCell = row.cells[1];
  const priceCell = row.cells[2];

  const oldQty = Number(quantityCell.innerHTML || 1);
  const oldPrice = Number(priceCell.innerHTML || 0);

  let qty = prompt("Enter the new quantity:", oldQty);
  qty = Number(qty);

  while (!Number.isInteger(qty) || qty < 1) {
    alert("Please enter a value greater than 0!");
    qty = Number(prompt("Enter the new quantity:", oldQty));
  }

  // Update row visually
  quantityCell.innerHTML = qty;

  const unit = oldPrice / oldQty;
  const newPrice = unit * qty;
  priceCell.innerHTML = newPrice;

  // Update total visually (server still stores quantity = 1 per row)
  const totalEl = document.getElementById("total");
  if (totalEl) {
    const currentTotal = Number(totalEl.innerHTML || 0);
    totalEl.innerHTML = Math.floor(currentTotal - oldPrice + newPrice);
  }
}

// ---------- image zoom ----------
function zoomIn(ID) {
  const el = document.getElementById(ID);
  if (!el) return;
  el.style.width = "200%";
  el.style.height = "200%";
}
function zoomOut(ID) {
  const el = document.getElementById(ID);
  if (!el) return;
  el.style.width = "100%";
  el.style.height = "100%";
}

// ---------- calorie calculator ----------
function calorieCalculator() {
  const weight = Number(document.getElementById("weight")?.value || 0);
  const hours  = Number(document.getElementById("hours")?.value || 0);
  const minutes= Number(document.getElementById("minutes")?.value || 0);

  const calories = Math.floor(
    ((hours * 60) + minutes) * (((weight * 0.453592) * 7.1 * 3.5) / 2000)
  );

  const el = document.getElementById("calcdata");
  if (el) el.innerHTML = "Calories Burned: " + calories + " kCal";
}

// Exposed init functions if you use them inline in HTML
window.initializeSession   = initializeSession;
window.initializeOrderPage = initializeOrderPage;
window.addToCart           = addToCart;
window.deleteData          = deleteData;
window.editData            = editData;
window.zoomIn              = zoomIn;
window.zoomOut             = zoomOut;
window.calorieCalculator   = calorieCalculator;
