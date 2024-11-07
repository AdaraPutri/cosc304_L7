const express = require('express');
const router = express.Router();

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
