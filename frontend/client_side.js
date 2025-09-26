// Client_Side JavaScript File for Court Crafters site
// Here is where the client sends its request to the server
// The information sent relates to the cart:
// 1. When you add and item to your cart,
// 2. Updating the cart bubble on the menu, 
// 3. Updating and populating the cart when you go to the order page,
// 4. When you remove or change the quantity of an item in your cart.

// Authors: Ayaz Bhutta, Giovanni Rossi, and Aamir Sayed

var url = "http://localhost:3000/post";

// In initializeSession, we first activate the Google API font loader,
// then we send a request to the server to update the amount of items in our cart and display it on the bubble
function initializeSession() {

   // Font loader
   var link = document.createElement('link');
   link.setAttribute('rel', 'stylesheet');
   link.setAttribute('type', 'text/css');
   link.setAttribute('href', 'https://fonts.googleapis.com/css?family=Agdasima:300,400,700');
   document.head.appendChild(link);

   // Request server to update cart item bubble
   $.post(url+'?data='+JSON.stringify({
      'action': 'populateBubble'
   }), response);

}

// Same as the regular initializeSession, but with another server request to populate the cart on the order page
function initializeOrderPage() {

   // Font loader
   var link = document.createElement('link');
   link.setAttribute('rel', 'stylesheet');
   link.setAttribute('type', 'text/css');
   link.setAttribute('href', 'https://fonts.googleapis.com/css?family=Agdasima:300,400,700');
   document.head.appendChild(link);

   // Request server to update cart item bubble
   $.post(url+'?data='+JSON.stringify({
      'action': 'populateBubble'
   }), response);

   // Request server to populate the cart on the order page
   // This is only ran when you load the order page, hence why it is in its own function
   $.post(url+'?data='+JSON.stringify({
      'action': 'populateCart'
   }), response);

}

// Function addToCart activates when any add-to-cart button is pressed on either the home page or product page
function addToCart(name, price) {

   // Set item count from the bubble to var items
   var items = document.getElementById("cart_bubble").innerHTML;

   // If we have no items, it will return undefined
   // Thus, add an item because it is our first
   if (items == undefined) {

      document.getElementById("cart_bubble").innerHTML = "1";
      document.getElementById("cart_bubble").style.visibility = "visible";
      alert(name + " was added to cart!");

   // If we have items already then we will just increment our item total and apply it to our bubble innerHTML
   } else {

      items++;
      document.getElementById("cart_bubble").innerHTML = items;
      document.getElementById("cart_bubble").style.visibility = "visible";
      alert(name + " was added to cart!");

   }

   // Now we will update our server with the new cart information
   // No response for this action; it is only for server storage
   $.post(url+'?data='+JSON.stringify({
      'name': name,
      'price': price,
      'items' : items,
      'action': 'addToCart'
   }));

}

// Here is our response section
function response(data, status){

   // Parse our JSON info into readable JS
   var response = JSON.parse(data);

   // Our first response action is addToCart which is activated when the order page loads
   // The server sends the latest cart data to the client to be manipulated
   if (response['action'] == 'addToCart') {

      // Isolate the cart data
      cart = response['cart'];
      var total = 0;

      // Get the table and insert a new row at the end 
      let table = document.getElementById("orderSummary"); 
      
      // Insert data into cells of the new row 
      // The amount of rows depends on the amount of items in the cart (cart.length) :D
      for (var i = 0; i < cart.length; i++) {

         // Update our total cost
         total = total + cart[i]["itemPrice"];

         // Create a new row for our table
         let newRow = table.insertRow(table.rows.length); 

         // One row for the name, the next for the quantity (by deafult is 1), then price, and then our buttons to edit quantity or delete the entry
         newRow.insertCell(0).innerHTML = cart[i]["itemName"]; 
         newRow.insertCell(1).innerHTML = 1; 
         newRow.insertCell(2).innerHTML = cart[i]["itemPrice"];
         newRow.insertCell(3).innerHTML = 
            '<button onclick="editData(this)" class="purchase_button">Add</button>'+ 
            '<button onclick="deleteData(this)" class="purchase_button">Delete</button>';

      }

      // Update our total cost
      document.getElementById("total").innerHTML = Math.floor(total);

   // The second action is to update the bubble
   // This runs everytime a page is loaded or reloaded
   } else if (response['action'] == "populateBubble") {

      // Get latest number of items in cart data from server
      var updateitems = response['items'];

      // If we have no items, ensure the bubble is hidden
      if (updateitems == 0) {

         document.getElementById("cart_bubble").style.visibility = "hidden";
   
      // Otherwise, update the bubble with the item count and make it visible
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
   // We wanna get the old price to adjust the new price total after the quantity change
   var oldPrice = price.innerHTML;
   
   // Prompt the user to enter updated values
   let oldQuantity = quantity.innerHTML;
   let quantityInput = prompt("Enter the new quantity:", quantity.innerHTML);
   // Ensure they enter a valid quantity
   while (quantityInput < 1) {

      alert("Please enter a value greater than 0!");
      quantityInput = prompt("Enter the new quantity:", quantity.innerHTML); 

   }
   
   // Update the cell contents with the new values 
   quantity.innerHTML = quantityInput; 
   price.innerHTML = price.innerHTML/oldQuantity;
   price.innerHTML = price.innerHTML*quantityInput;
   var total = document.getElementById("total").innerHTML;
   document.getElementById("total").innerHTML = Math.floor(total - (oldPrice-price.innerHTML));

} 

// Here is the deleteData function which activates when you delete an item from the cart
function deleteData(button) { 
            
   // Get the parent row of the clicked button 
   let row = button.parentNode.parentNode; 

   let price = row.cells[2];
   // Again we need the old price to update the price total
   let oldPrice = price.innerHTML;

   // Remove the row from the table 
   row.parentNode.removeChild(row); 

   // Update the number of items in the bubble
   var num = parseInt(document.getElementById("cart_bubble").innerHTML);
   num--;
   document.getElementById("cart_bubble").innerHTML = num;

   // Update the total price   
   var total = document.getElementById("total").innerHTML;
   document.getElementById("total").innerHTML = Math.floor(total - oldPrice);

   // Send a request to the server to store the updated amount of items
   $.post(url+'?data='+JSON.stringify({
      'row': row,
      'action': 'removeItem'
   }));

} 

// This is the zoomIn function which zooms in the images on the home page
function zoomIn(ID) {

   document.getElementById(ID).style.width = "200%";
   document.getElementById(ID).style.height = "200%";

}

// This is the zoomOut function which zooms out the images on the home page
function zoomOut(ID) {

   document.getElementById(ID).style.width = "100%";
   document.getElementById(ID).style.height = "100%"; 

}

// Here is where the calorie calculator completes its math
function calorieCalculator() {

   // Get the inputted values
   var weight = document.getElementById("weight").value;
   var hours = document.getElementById("hours").value;
   var minutes = document.getElementById("minutes").value;

   // Get calorie count
   var calories = Math.floor(((hours * 60) + minutes)*(((weight*0.453592) * 7.1 * 3.5) / 2000));

   // Update calories burned
   document.getElementById("calcdata").innerHTML = "Calories Burned: " + calories + " kCal";

}