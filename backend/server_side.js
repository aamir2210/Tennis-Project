// TYPE THE FOLLOWING CODE IN VS CODE TERMINAL TO RUN THIS SERVER: ls -> cd backend -> npm start
// Server_Side JavaScript File for Court Crafters site
// Here is where the server processes the clients requests
// The information processed relates to the cart:
// 1. When you add and item to your cart,
// 2. Updating the cart bubble on the menu, 
// 3. Updating and populating the cart when you go to the order page,
// 4. When you remove or change the quantity of an item in your cart.

// Authors: Ayaz Bhutta, Giovanni Rossi, and Aamir Sayed

// Get our express set up
var express = require('express'); 
var app = express();
// Add port
var port = 3000; 

// Global variables
var cart = [];
var items = 0;

// Here is where the server is listening for a request from the client
app.post('/post', (req, res) => {

    // Print info to console
    console.log("New express client");
    console.log("Query received: ");
    console.log(JSON.parse(req.query['data']));

    // Populate a header response
    res.header("Access-Control-Allow-Origin", "*");
    var queryInfo = JSON.parse(req.query['data']);

    // If the action given by the client is addToCart, we will store the cart info
    if (queryInfo['action'] == 'addToCart') {

        // Get cart info
        var itemName = queryInfo['name'];
        var itemPrice = queryInfo['price'];
        items = queryInfo['items'];

        // Send info to server addToCart function to store
        addToCart(itemName, itemPrice);

    // The second action is populateCart. This is used when we access the order page
    } else if (queryInfo['action'] == 'populateCart') {

        // Prepare the response
        // Here we are just gathering the info to send to the client
        // The clients action will be to visibly add the information to the cart on the order page
        var jsontext = JSON.stringify({
            'action': 'addToCart',
            'cart': cart,
            'msg': 'Populating cart!'
        });

        // Send the cart information to the client	
        res.send(jsontext);      

    // The third action is update the removal of an item from the cart
    } else if (queryInfo['action'] == 'removeItem') {

        // Get the item and its row it has been removed from
        var row = queryInfo['row'];

        // Remove that item from the array
        cart.pop(row);
        // Decrement the amount of items
        items--;

    // The final action is to update the cart bubble. This is ran everytime a page is loaded
    } else if (queryInfo['action'] == 'populateBubble') {

        // Prepare the response
        // Gather the up-to-date item information
        // The action for the client will be to display this updated item information to the user
        var jsontext = JSON.stringify({
            'action': 'populateBubble',
            'items': items,
            'msg': 'Populating bubble!'
        });

        // Send the response to the client	
        res.send(jsontext);       

    }

}).listen(3000);
console.log("Server is running!");

// Add to cart function where cart info is updated and stored
function addToCart(itemName, itemPrice) {

    // Create a new item object
    var newItem = {
        "itemName": itemName,
        "itemPrice": itemPrice,
    }

    // Add this new item to the cart array
    cart.push(newItem);

}