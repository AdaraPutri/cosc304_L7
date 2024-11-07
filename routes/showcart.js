const express = require('express');
const router = express.Router();

// Helper function to update cart quantity
function updateCartQuantity(cart, productId, action) {
    let product = cart.find(item => item.id == productId);
    if (product) {
        if (action === 'increase') {
            product.quantity++;
        } else if (action === 'decrease' && product.quantity > 1) {
            product.quantity--;
        }
    }
}

// Helper function to remove item from cart
function removeItemFromCart(cart, productId) {
    return cart.filter(item => item.id != productId);
}

// Display shopping cart
router.get('/', function(req, res, next) {
    let productList = false;
    res.setHeader('Content-Type', 'text/html');
    res.write("<title>Your Shopping Cart</title>");
    if (req.session.productList) {
        productList = req.session.productList;
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
        res.write("<tr><td colspan=\"5\" align=\"right\"><b>Order Total</b></td><td align=\"right\">$" + total.toFixed(2) + "</td></tr>");
        res.write("</table>");

        res.write("<h2><a href=\"checkout\">Check Out</a></h2>");
    } else{
        res.write("<h1>Your shopping cart is empty!</h1>");
    }
    res.write('<h2><a href="listprod">Continue Shopping</a></h2>');

    res.end();
});

// Handle increase/decrease of quantity
router.get('/updateQuantity', function(req, res) {
    const productId = req.query.productId;
    const action = req.query.action;
    let cart = req.session.productList;

    if (cart) {
        updateCartQuantity(cart, productId, action);
        req.session.productList = cart; // update the session cart
    }

    res.redirect('/showcart');
});

// Handle removing an item from the cart
router.get('/removeItem', function(req, res) {
    const productId = req.query.productId;
    let cart = req.session.productList;

    if (cart) {
        cart = removeItemFromCart(cart, productId);
        req.session.productList = cart; // update the session cart
    }

    res.redirect('/showcart');
});

module.exports = router;
