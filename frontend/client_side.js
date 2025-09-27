// =======================
// Client_Side JavaScript for Court Crafters
// Authors: Ayaz Bhutta, Giovanni Rossi, and Aamir Sayed
// =======================

// --- BACKEND URL ----------------------------------------------
// Option 1 (recommended for deploy): in your HTML's <head> add:
// <script>window.API_BASE = "https://YOUR-BACKEND.onrender.com";</script>
// Option 2: edit the default below.
const API_BASE = (typeof window !== "undefined" && window.API_BASE)
  ? window.API_BASE
  : "https://tennis-project-gei8.onrender.com/";  // <-- put your Render URL here

const POST_URL = `${API_BASE}/post`;

// Small helper so we don't repeat the $.post pattern
function postJSON(payload, cb) {
  $.post(POST_URL + "?data=" + JSON.stringify(payload), cb);
}

// In initializeSession, we first activate the Google API font loader,
// then we send a request to the server to update the amount of items in our cart and display it on the bubble
function initializeSession() {
  // Font loader
  var link = document.createElement("link");
  link.setAttribute("rel", "stylesheet");
  link.setAttribute("type", "text/css");
  link.setAttribute(
    "href",
    "https://fonts.googleapis.com/css?family=Agdasima:300,400,700"
  );
  document.head.appendChild(link);

  // Request server to update cart item bubble
  postJSON({ action: "populateBubble" }, response);
}

// Same as the regular initializeSession, but with another server request to populate the cart on the order page
function initializeOrderPage() {
  // Font loader
  var link = document.createElement("link");
  link.setAttribute("rel", "stylesheet");
  link.setAttribute("type", "text/css");
  link.setAttribute(
    "href",
    "https://fonts.googleapis.com/css?family=Agdasima:300,400,700"
  );
  document.head.appendChild(link);

  // Update cart bubble
  postJSON({ action: "populateBubble" }, response);

  // Populate the cart on the order page
  postJSON({ action: "populateCart" }, response);
}

// Function addToCart activates when any add-to-cart button is pressed on either the home page or product page
function addToCart(name, price) {
  // Set item count from the bubble to var items
  var items = document.getElementById("cart_bubble").innerHTML;

  // If we have no items, it will return undefined -> start at 1
  if (items == undefined || items === "") {
    document.getElementById("cart_bubble").innerHTML = "1";
    document.getElementById("cart_bubble").style.visibility = "visible";
    alert(name + " was added to cart!");
    items = 1;
  } else {
    items = parseInt(items, 10) + 1;
    document.getElementById("cart_bubble").innerHTML = items;
    document.getElementById("cart_bubble").style.visibility = "visible";
    alert(name + " was added to cart!");
  }

  // Update server with the new cart information (no UI response needed)
  postJSON(
    {
      name: name,
      price: Number(price),
      items: items,
      action: "addToCart",
    },
    // no callback -> fire-and-forget
  );
}

// Here is our response section
function response(data, status) {
  // Parse our JSON info into readable JS
  var response = typeof data === "string" ? JSON.parse(data) : data;

  // Our first response action is addToCart which is activated when the order page loads
  // The server sends the latest cart data to the client to be manipulated
  if (response["action"] == "addToCart") {
    // Isolate the cart data
    var cart = response["cart"];
    var total = 0;

    // Get the table and insert rows
    let table = document.getElementById("orderSummary");

    // Clear any existing (optional, in case of refresh)
    // while (table.rows.length > 1) table.deleteRow(1);

    for (var i = 0; i < cart.length; i++) {
      // Update total
      total = total + Number(cart[i]["itemPrice"]);

      // Create a new row for our table
      let newRow = table.insertRow(table.rows.length);

      // Name | Qty | Price | Buttons
      newRow.insertCell(0).innerHTML = cart[i]["itemName"];
      newRow.insertCell(1).innerHTML = 1;
      newRow.insertCell(2).innerHTML = cart[i]["itemPrice"];
      newRow.insertCell(3).innerHTML =
        '<button onclick="editData(this)" class="purchase_button">Add</button>' +
        '<button onclick="deleteData(this)" class="purchase_button">Delete</button>';
    }

    // Update our total cost
    document.getElementById("total").innerHTML = Math.floor(total);

    // The second action is to update the bubble
    // This runs everytime a page is loaded or reloaded
  } else if (response["action"] == "populateBubble") {
    // Get latest number of items in cart data from server
    var updateitems = Number(response["items"] || 0);

    if (updateitems <= 0) {
      document.getElementById("cart_bubble").style.visibility = "hidden";
      document.getElementById("cart_bubble").innerHTML = "";
    } else {
      document.getElementById("cart_bubble").innerHTML = updateitems;
      document.getElementById("cart_bubble").style.visibility = "visible";
    }
  }
}

// Here is the editData function that activiates when we hit "add" on the order page
// This modifies the quantity of the specific row we clicked the button on
function editData(button) {
  // Get the parent row of the clicked button
  let row = button.parentNode.parentNode;

  // Get the cells within the row
  let quantity = row.cells[1];
  let price = row.cells[2];

  // We want the old price to adjust the total after the quantity change
  var oldPrice = Number(price.innerHTML);

  // Prompt the user to enter updated values
  let oldQuantity = Number(quantity.innerHTML);
  let quantityInput = prompt("Enter the new quantity:", oldQuantity);

  // Ensure valid positive integer quantity
  quantityInput = Number(quantityInput);
  while (!Number.isInteger(quantityInput) || quantityInput < 1) {
    alert("Please enter a value greater than 0!");
    quantityInput = Number(prompt("Enter the new quantity:", oldQuantity));
  }

  // Update the cell contents with the new values
  quantity.innerHTML = quantityInput;

  // Unit price = oldPrice / oldQuantity
  const unit = oldPrice / oldQuantity;
  const newPrice = unit * quantityInput;
  price.innerHTML = newPrice;

  // Update total
  var total = Number(document.getElementById("total").innerHTML || 0);
  document.getElementById("total").innerHTML = Math.floor(total - oldPrice + newPrice);
}

// Here is the deleteData function which activates when you delete an item from the cart
function deleteData(button) {
  // Get the parent row of the clicked button
  let row = button.parentNode.parentNode;
  let table = row.parentNode;

  let price = Number(row.cells[2].innerHTML);

  // Remove the row from the table
  table.removeChild(row);

  // Update the number of items in the bubble
  var bubble = document.getElementById("cart_bubble");
  var num = Number(bubble.innerHTML || 0);
  num = Math.max(0, num - 1);
  bubble.innerHTML = num;
  bubble.style.visibility = num > 0 ? "visible" : "hidden";

  // Update the total price
  var total = Number(document.getElementById("total").innerHTML || 0);
  document.getElementById("total").innerHTML = Math.floor(total - price);

  // Figure out the index we removed (minus header row if you have one).
  // If your table has a header row at index 0, use rowIndex - 1.
  // If it has no header, use rowIndex directly.
  // Adjust this line to match your table structure:
  const removedIndex = row.rowIndex - 1;

  // Inform server which row index was removed
  postJSON(
    {
      row: removedIndex,
      action: "removeItem",
    },
    // no UI callback needed
  );
}

// Zoom helpers
function zoomIn(ID) {
  document.getElementById(ID).style.width = "200%";
  document.getElementById(ID).style.height = "200%";
}
function zoomOut(ID) {
  document.getElementById(ID).style.width = "100%";
  document.getElementById(ID).style.height = "100%";
}

// Calorie calculator
function calorieCalculator() {
  var weight = Number(document.getElementById("weight").value || 0);
  var hours = Number(document.getElementById("hours").value || 0);
  var minutes = Number(document.getElementById("minutes").value || 0);

  var calories = Math.floor(
    ((hours * 60) + minutes) * (((weight * 0.453592) * 7.1 * 3.5) / 2000)
  );

  document.getElementById("calcdata").innerHTML =
    "Calories Burned: " + calories + " kCal";
}
