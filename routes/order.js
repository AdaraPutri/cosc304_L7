const express = require('express');
const router = express.Router();
const sql = require('mssql');
const moment = require('moment');

router.get('/', async function(req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.write("<title>Order Processing</title>");

    let cart = req.session.productList;

    if (!cart || cart.length === 0) {
        res.write("<h1>Your shopping cart is empty!</h1>");
        return res.end();
    }

    const customerId = req.query.customerId;

    if (!customerId || isNaN(customerId)) {
        res.write("<h1>Error: Please enter a valid Customer ID.</h1>");
        return res.end();
    }

    try {
        const pool = await sql.connect(config);
        const customerCheck = await pool.request()
            .input('customerId', sql.Int, customerId)
            .query('SELECT COUNT(*) AS count FROM Customers WHERE customerId = @customerId');

        if (customerCheck.recordset[0].count === 0) {
            res.write("<h1>Error: Customer not found. Please enter a valid ID.</h1>");
            return res.end();
        }

        const orderDate = moment().format('YYYY-MM-DD HH:mm:ss');
        const totalAmount = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);

        const orderResult = await pool.request()
            .input('customerId', sql.Int, customerId)
            .input('orderDate', sql.DateTime, orderDate)
            .input('totalAmount', sql.Float, totalAmount)
            .query(`
                INSERT INTO OrderSummary (customerId, orderDate, totalAmount)
                OUTPUT INSERTED.orderId
                VALUES (@customerId, @orderDate, @totalAmount)
            `);

        const orderId = orderResult.recordset[0].orderId;

        for (const item of cart) {
            await pool.request()
                .input('orderId', sql.Int, orderId)
                .input('productId', sql.Int, item.id)
                .input('productName', sql.NVarChar, item.name)
                .input('quantity', sql.Int, item.quantity)
                .input('price', sql.Float, item.price)
                .query(`
                    INSERT INTO OrderProduct (orderId, productId, productName, quantity, price)
                    VALUES (@orderId, @productId, @productName, @quantity, @price)
                `);
        }

        // Display order summary
        res.write("<h1>Order Summary</h1>");
        res.write("<p>Order ID: " + orderId + "</p>");
        res.write("<table><tr><th>Product ID</th><th>Product Name</th><th>Quantity</th><th>Price</th><th>Subtotal</th></tr>");
        
        cart.forEach(item => {
            res.write("<tr><td>" + item.id + "</td>");
            res.write("<td>" + item.name + "</td>");
            res.write("<td>" + item.quantity + "</td>");
            res.write("<td>$" + item.price.toFixed(2) + "</td>");
            res.write("<td>$" + (item.quantity * item.price).toFixed(2) + "</td>");
            res.write(`<td><a href="/updateQuantity?productId=${item.id}&action=decrease">-</a> <a href="/updateQuantity?productId=${item.id}&action=increase">+</a></td>`);
            res.write(`<td><a href="/removeItem?productId=${item.id}">Remove</a></td></tr>`);
        });

        res.write("<tr><td colspan=\"4\" align=\"right\"><b>Total Amount</b></td><td>$" + totalAmount.toFixed(2) + "</td></tr>");
        res.write("</table>");

        // Clear the shopping cart after order is placed
        req.session.productList = [];
        
        res.write("<h2>Thank you for your order!</h2>");
        res.write('<h2><a href="listprod">Continue Shopping</a></h2>');
        res.end();

    } catch (err) {
        console.error("Order processing error:", err);
        res.write("<h1>Oops! Something went wrong. Please try again later.</h1>");
        res.end();
    }
});

module.exports = router;


