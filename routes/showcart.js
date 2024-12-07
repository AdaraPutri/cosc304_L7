const express = require('express');
const router = express.Router();

// Display shopping cart
router.get('/', function(req, res, next) {
    let productList = false;
    res.setHeader('Content-Type', 'text/html');
    res.write("<title>Your Shopping Cart</title>");
    res.write(`
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5; /* Light gray background */
            color: #333; /* Dark text color */
        }

        .container {
            width: 80%;
            margin: 20px auto;
            background-color: #ffffff; /* White background for the content */
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
        }

        h1 {
            font-family: 'Arial', sans-serif;
            color: #4CAF50; /* Sage green */
            text-align: center;
        }

        h2 {
            text-align: center;
            color: #388E3C; /* Darker sage green */
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        th, td {
            padding: 12px;
            text-align: center;
            border: 1px solid #4CAF50; /* Sage green border */
        }

        th {
            background-color: #A5D6A7; /* Light sage green */
            color: white;
        }

        tr:nth-child(even) {
            background-color: #E8F5E9; /* Light sage green for even rows */
        }

        a {
            text-decoration: none;
            color: #4CAF50; /* Sage green color for links */
        }

        a:hover {
            color: #388E3C; /* Darker sage green on hover */
        }

        .total {
            font-weight: bold;
            color: #388E3C; /* Dark sage green for total */
            text-align: right;
        }

        .actions {
            text-align: center;
            margin-top: 20px;
        }
    </style>
    `);

    if (req.session.productList) {
        productList = req.session.productList;
        res.write("<div class='container'>");
        res.write("<h1>Your Shopping Cart</h1>");
        res.write("<table><tr><th>Product Id</th><th>Product Name</th><th>Quantity</th>");
        res.write("<th>Price</th><th>Subtotal</th><th>Action</th></tr>");

        let total = 0;
        for (let i = 0; i < productList.length; i++) {
            product = productList[i];
            if (!product) {
                continue;
            }

            res.write("<tr><td>" + product.id + "</td>");
            res.write("<td>" + product.name + "</td>");
            res.write("<td align=\"center\">" + product.quantity + "</td>");
            res.write("<td align=\"right\">$" + Number(product.price).toFixed(2) + "</td>");
            res.write("<td align=\"right\">$" + (Number(product.quantity) * Number(product.price)).toFixed(2) + "</td>");
            res.write(`<td><a href="/updateQuantity?productId=${product.id}&action=decrease">-</a> <a href="/updateQuantity?productId=${product.id}&action=increase">+</a></td>`);
            res.write(`<td><a href="/removeItem?productId=${product.id}">Remove</a></td></tr>`);
            total = total + product.quantity * product.price;
        }
        res.write("<tr><td colspan=\"5\" class='total'>Order Total</td><td align=\"right\" class='total'>$" + total.toFixed(2) + "</td></tr>");
        res.write("</table>");

        res.write("<div class='actions'><h2><a href=\"checkout\">Check Out</a></h2></div>");
    } else {
        res.write("<div class='container'><h1>Your shopping cart is empty!</h1></div>");
    }
    res.write('<div class="actions"><h2><a href="listprod">Continue Shopping</a></h2></div>');
    res.end();
});

// Handle increase/decrease of quantity
router.get('/updateQuantity', function(req, res) {
    const productId = req.query.productId;
    const action = req.query.action;
    let cart = req.session.productList;

    if (cart) {
        updateCartQuantity(cart, productId, action);
        req.session.productList = cart; 
    }

    res.redirect('/showcart');
});

// Handle removing an item from the cart
router.get('/removeItem', function(req, res) {
    const productId = req.query.productId;
    let cart = req.session.productList;

    if (cart) {
        cart = removeItemFromCart(cart, productId);
        req.session.productList = cart; 
    }

    res.redirect('/showcart');
});

module.exports = router;


