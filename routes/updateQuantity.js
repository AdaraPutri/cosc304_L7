const express = require('express');
const router = express.Router();

function updateCartQuantity(cart, productId, action) {
    let product = cart.find(item => item && item.id == productId); // Added null check here
    if (product) {
        if (action === 'increase') {
            product.quantity++;
        } else if (action === 'decrease' && product.quantity > 1) {
            product.quantity--;
        }
    }
}

router.get('/', function(req, res) {
    const productId = req.query.productId;
    const action = req.query.action;
    let cart = req.session.productList;

    if (cart) {
        updateCartQuantity(cart, productId, action);
        req.session.productList = cart; 
    }

    res.redirect('/showcart');
});

module.exports = router;
