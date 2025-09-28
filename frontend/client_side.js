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

// Small helper to POST JSON to the backend
async function postJSON(payload) {
  const res = await fetch(POST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

// In initializeSession, we first activate the Google API font loader,
// then we send a request to the server to update the amount of items in our cart and display it on the bubble
function initializeSession() {
  // Font loader
  const link = document.createElement("link");
  link.setAttribute("rel", "stylesheet");
  link.setAttribute("type", "text/css");
  link.setAttribute("href", "https://fonts.googleapis.com/css?family=Agdasima:300,400,700");
  document.head.appendChild(link);

  // Update the cart bubble
  postJSON({ action: "populateBubble" })
    .then(response)
    .catch(err => console.error("populateBubble error:", err));
}

// Same as initializeSession, plus populate the order table
function initializeOrderPage() {
  // Font loader
  const link = document.createElement("link");
  link.setAttribute("rel", "stylesheet");
  link.setAttribute("type", "text/css");
  link.setAttribute("href", "https://fonts.googleapis.com/css?family=Agdasima:300,400,700");
  document.head.appendChild(link);

  // Update cart bubble
  postJSON({ action: "populateBubble" })
    .then(response)
    .catch(err => console.error("populateBubble error:", err));

  // Populate the cart on the order page
  postJSON({ action: "populateCart" })
    .then(response)
    .catch(err => console.error("populateCart error:", err));
}

// Function addToCart activates when any add-to-cart button is pressed on either the home page or product page
function addToCart(name, price) {
  // Current item count from the bubble
  let items = document.getElementById("cart_bubble").innerHTML;

  if (items == null || items === "") {
    items = 1;
  } else {
    items = parseInt(items, 10) + 1;
  }

  // Reflect in UI immediately
  document.getElementById("cart_bubble").innerHTML = items;
  document.getElementById("cart_bubble").style.visibility = "visible";
  alert(name + " was added to cart!");

  // Tell the server
  postJSON({
    name: name,
    price: Number(price),
    items: items,
    action: "addToCart",
  }).catch(err => console.error("addToCart error:", err));
}

// Response handler used by populate calls above
function response(data) {
  // Ensure object
  const resp = (typeof data === "string") ? JSON.parse(data) : data;

  // Add rows to order table
  if (resp.action === "addToCart" || resp.action === "populateCart") {
    const cart = resp.cart || [];
    let total = 0;

    const table = document.getElementById("orderSummary");
    if (!table) return;

    // If you want a clean refresh each time, uncomment the next two lines:
    // while (table.rows.length > 1) table.deleteRow(1);
    // total = 0;

    for (let i = 0; i < cart.length; i++) {
      total += Number(cart[i].itemPrice);

      const newRow = table.insertRow(table.rows.length);
      newRow.insertCell(0).innerHTML = cart[i].itemName; // Name
      newRow.insertCell(1).innerHTML = 1;                // Qty
      newRow.insertCell(2).innerHTML = cart[i].itemPrice;// Price
      newRow.insertCell(3).innerHTML =
        '<button onclick="editData(this)" class="purchase_button">Add</button>' +
        '<button onclick="deleteData(this)" class="purchase_button">Delete</button>';
    }

    const totalEl = document.getElementById("total");
    if (totalEl) totalEl.innerHTML = Math.floor(total);

  } else if (resp.action === "populateBubble") {
    const updateitems = Number(resp.items || 0);
    const bubble = document.getElementById("cart_bubble");
    if (!bubble) return;

    if (updateitems <= 0) {
      bubble.style.visibility = "hidden";
      bubble.innerHTML = "";
    } else {
      bubble.innerHTML = updateitems;
      bubble.style.visibility = "visible";
    }
  }
}

// Edit quantity on the order page
function editData(button) {
  const row = button.parentNode.parentNode;
  const quantityCell = row.cells[1];
  const priceCell = row.cells[2];

  const oldPrice = Number(priceCell.innerHTML);
  const oldQuantity = Number(quantityCell.innerHTML);

  let quantityInput = prompt("Enter the new quantity:", oldQuantity);
  quantityInput = Number(quantityInput);

  while (!Number.isInteger(quantityInput) || quantityInput < 1) {
    alert("Please enter a value greater than 0!");
    quantityInput = Number(prompt("Enter the new quantity:", oldQuantity));
  }

  // Update row cells
  quantityCell.innerHTML = quantityInput;

  const unit = oldPrice / oldQuantity;
  const newPrice = unit * quantityInput;
  priceCell.innerHTML = newPrice;

  // Update total
  const totalEl = document.getElementById("total");
  const currentTotal = Number(totalEl?.innerHTML || 0);
  if (totalEl) totalEl.innerHTML = Math.floor(currentTotal - oldPrice + newPrice);
}

// Delete a row from the order table
function deleteData(button) {
  const row = button.parentNode.parentNode;
  const table = row.parentNode;

  const price = Number(row.cells[2].innerHTML);

  // Remove row from DOM
  table.removeChild(row);

  // Update bubble
  const bubble = document.getElementById("cart_bubble");
  if (bubble) {
    let num = Number(bubble.innerHTML || 0);
    num = Math.max(0, num - 1);
    bubble.innerHTML = num;
    bubble.style.visibility = num > 0 ? "visible" : "hidden";
  }

  // Update total
  const totalEl = document.getElementById("total");
  if (totalEl) {
    const total = Number(totalEl.innerHTML || 0);
    totalEl.innerHTML = Math.floor(total - price);
  }

  // If your table has a header row, the first data row index is 1 -> subtract 1.
  const removedIndex = row.rowIndex - 1;

  // Tell the server which row was removed
  postJSON({ row: removedIndex, action: "removeItem" })
    .catch(err => console.error("removeItem error:", err));
}

// Image zoom helpers
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

// Calorie calculator
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

