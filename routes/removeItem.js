const express = require('express');
const router = express.Router();

function removeItemFromCart(cart, productId) {
    if (!Array.isArray(cart)) {
        return cart;
    }

    return cart.filter(item => item && item.id != productId);
}

router.get('/', function(req, res) {
    const productId = req.query.productId;
    let cart = req.session.productList;

    if (!cart) {
        return res.redirect('/showcart');
    }

    if (!productId || isNaN(productId)) {
        return res.redirect('/showcart');
    }

    cart = removeItemFromCart(cart, productId);
    req.session.productList = cart;

    res.redirect('/showcart');
});

module.exports = router;

