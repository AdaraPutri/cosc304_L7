const express = require('express');
const router = express.Router();

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

module.exports = router;
