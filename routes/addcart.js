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

router.get('/', async function(req, res) {
    const customerId = req.session.customerId; // Assuming customerId is stored in session after login
    if (!customerId) {
        return res.status(401).send("Please log in to add items to your cart.");
    }

    const { id: productId, name: productName, price } = req.query;

    if (!productId || !price) {
        return res.redirect("/listprod");
    }

    try {
        let pool = await sql.connect(dbConfig);

        // Check if a temporary "cart order" exists for this user
        let cartOrderResult = await pool.request()
            .input('customerId', sql.Int, customerId)
            .query(`
                SELECT TOP 1 orderId FROM ordersummary 
                WHERE customerId = @customerId AND totalAmount IS NULL
            `);

        let orderId;
        if (cartOrderResult.recordset.length > 0) {
            // Use existing cart order
            orderId = cartOrderResult.recordset[0].orderId;
        } else {
            // Create a new cart order
            const newOrderResult = await pool.request()
                .input('customerId', sql.Int, customerId)
                .query(`
                    INSERT INTO ordersummary (customerId, orderDate)
                    OUTPUT INSERTED.orderId
                    VALUES (@customerId, GETDATE())
                `);
            orderId = newOrderResult.recordset[0].orderId;
        }

        // Check if the product is already in the cart
        const existingProduct = await pool.request()
            .input('orderId', sql.Int, orderId)
            .input('productId', sql.Int, productId)
            .query(`
                SELECT * FROM orderproduct 
                WHERE orderId = @orderId AND productId = @productId
            `);

        if (existingProduct.recordset.length > 0) {
            // Update quantity if product already exists in the cart
            await pool.request()
                .input('orderId', sql.Int, orderId)
                .input('productId', sql.Int, productId)
                .query(`
                    UPDATE orderproduct 
                    SET quantity = quantity + 1 
                    WHERE orderId = @orderId AND productId = @productId
                `);
        } else {
            // Insert new product into the cart
            await pool.request()
                .input('orderId', sql.Int, orderId)
                .input('productId', sql.Int, productId)
                .input('quantity', sql.Int, 1)
                .input('price', sql.Decimal(10, 2), price)
                .query(`
                    INSERT INTO orderproduct (orderId, productId, quantity, price) 
                    VALUES (@orderId, @productId, @quantity, @price)
                `);
        }

        res.redirect("/showcart"); // Redirect to showcart page
    } catch (err) {
        console.error("Error adding to cart:", err);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
