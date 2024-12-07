const express = require('express');
const router = express.Router();
const sql = require('mssql');

const dbConfig = {
    server: 'cosc304_sqlserver',
    database: 'orders',
    authentication: {
        type: 'default',
        options: {
            userName: 'sa',
            password: '304#sa#pw'
        }
    },
    options: {
        encrypt: false,
        enableArithAbort: false
    }
};

async function updateCartQuantity(cart, productId, action) {
    try {
        const pool = await sql.connect(dbConfig);
        console.log(`Checking stock for productId: ${productId}`);
        const product = cart.find(item => item && item.id == productId);

        if (product) {
            if (action === 'increase') {
                const result = await pool.request()
                    .input('productId', sql.Int, productId)
                    .query(`
                        SELECT SUM(quantity) AS stock 
                        FROM productinventory 
                        WHERE productId = @productId
                    `);

                const stock = result.recordset[0]?.stock || 0;
                if (product.quantity < stock) {
                    product.quantity++;
                } else {
                    console.log('Stock is not enough'); // Log stock limit warning
                }
            } else if (action === 'decrease' && product.quantity > 1) {
                product.quantity--;
            }
        }
    } catch (error) {
        console.error('Error updating cart quantity:', error.message);
    }
}

router.get('/', async function (req, res) {
    const productId = req.query.productId;
    const action = req.query.action;
    let cart = req.session.productList;

    if (cart) {
        await updateCartQuantity(cart, parseInt(productId, 10), action);
        req.session.productList = cart; // Update session after modifying the cart
    }

    res.redirect('/showcart');
});

module.exports = router;

