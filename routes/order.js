const express = require('express');
const router = express.Router();
const sql = require('mssql');
const moment = require('moment');

const config = {
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
    res.setHeader('Content-Type', 'text/html');
    
    // Begin HTML structure
    res.write(`
    <html>
        <head>
            <title>Order Processing</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    background-color: #f1f5f8; /* light gray background */
                    color: #333; /* dark text color */
                    text-align: center;
                    margin: 0;
                    padding: 0;
                }
                header {
                    background-color: #4CAF50; /* sage green background */
                    padding: 20px;
                    color: white;
                    font-size: 36px;
                }
                .content {
                    max-width: 900px;
                    margin: 30px auto;
                    background-color: #fff;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                table, th, td {
                    border: 1px solid #ddd;
                    text-align: left;
                }
                th, td {
                    padding: 10px;
                }
                th {
                    background-color: #f2f2f2;
                }
                h1, h2 {
                    color: #4CAF50;
                }
                a {
                    color: #4CAF50;
                    text-decoration: none;
                    font-weight: bold;
                }
                a:hover {
                    text-decoration: underline;
                }
            </style>
        </head>
        <body>
            <header>ZnA Grocery</header>
            <div class="content">
    `);

    let cart = req.session.productList;
    cart = cart.filter(item => item !== null); 

    console.log('Shopping Cart:', cart); // Log cart to check if it's being retrieved properly

    if (!cart || cart.length === 0) {
        res.write("<h1>Your shopping cart is empty!</h1>");
        res.end();
        return;
    }

    const customerId = req.query.customerId;
    const customerPassword = req.query.password;  // Password from the request
    console.log('Received Customer ID:', customerId); // Log the received customer ID

    if (!customerId || isNaN(customerId)) {
        res.write("<h1>Error: Please enter a valid Customer ID.</h1>");
        res.end();
        return;
    }

    if (!customerPassword) {
        res.write("<h1>Error: Please enter a password.</h1>");
        res.end();
        return;
    }

    try {
        const pool = await sql.connect(config);
        console.log('Connected to database'); // Log successful DB connection

        // Check if customer exists
        const customerCheck = await pool.request()
            .input('customerId', sql.Int, customerId)
            .input('password', sql.VarChar, customerPassword)  // Add password input here
            .query('SELECT * FROM customer WHERE customerId = @customerId AND password = @password');

        const customer = customerCheck.recordset[0];

        console.log('Customer Check Result:', customer); // Log customer data

        if (!customer) {
            res.write("<h1>Error: Customer not found. Please enter a valid ID.</h1>");
            res.end();
            return;
        }

        // Validate password
        if (customer.password !== customerPassword) {
            res.write("<h1>Error: Invalid password. Please try again.</h1>");
            res.end();
            return;
        }

        const orderDate = moment().format('YYYY-MM-DD HH:mm:ss');
        const totalAmount = cart.reduce((sum, item) => {
            // Ensure price is valid before using .toFixed()
            const price = parseFloat(item.price);
            if (isNaN(price)) {
                console.error(`Invalid price for item ${item.id}: ${item.price}`);
                return sum;
            }
            return sum + item.quantity * price;
        }, 0);

        console.log('Order Date:', orderDate); // Log the order date
        console.log('Total Amount:', totalAmount); // Log the total amount calculation

        const orderResult = await pool.request()
            .input('customerId', sql.Int, customerId)
            .input('orderDate', sql.DateTime, orderDate)
            .input('totalAmount', sql.Float, totalAmount)
            .query(`
                INSERT INTO OrderSummary (customerId, orderDate, totalAmount)
                OUTPUT INSERTED.orderId
                VALUES (@customerId, @orderDate, @totalAmount)
            `);

        console.log('Order Result:', orderResult.recordset); // Log the inserted order result

        const orderId = orderResult.recordset[0].orderId;
        console.log('Order ID:', orderId); // Log the generated Order ID

        for (const item of cart) {
            console.log(`Inserting item ${item.id} into OrderProduct...`); // Log each product being inserted
            await pool.request()
                .input('orderId', sql.Int, orderId)
                .input('productId', sql.Int, item.id)
                .input('quantity', sql.Int, item.quantity)
                .input('price', sql.Float, parseFloat(item.price)) // Ensure price is a valid float
                .query(`
                    INSERT INTO OrderProduct (orderId, productId, quantity, price)
                    VALUES (@orderId, @productId, @quantity, @price)
                `);
        }

        // Display order summary
        res.write("<h1>Order Summary</h1>");
        res.write("<p>Order ID: " + orderId + "</p>");
        res.write("<table><tr><th>Product ID</th><th>Product Name</th><th>Quantity</th><th>Price</th><th>Subtotal</th></tr>");
        
        cart.forEach(item => {
            // Ensure price is valid before using .toFixed()
            const price = parseFloat(item.price);
            if (isNaN(price)) {
                console.error(`Invalid price for item ${item.id}: ${item.price}`);
                return;
            }

            res.write("<tr><td>" + item.id + "</td>");
            res.write("<td>" + item.name + "</td>");
            res.write("<td>" + item.quantity + "</td>");
            res.write("<td>$" + price.toFixed(2) + "</td>");
            res.write("<td>$" + (item.quantity * price).toFixed(2) + "</td>");
        });

        res.write("<tr><td colspan=\"4\" align=\"right\"><b>Total Amount</b></td><td>$" + totalAmount.toFixed(2) + "</td></tr>");
        res.write("</table>");

        // Clear the shopping cart after order is placed
        req.session.productList = [];
        
        res.write("<h2>Thank you for your order!</h2>");
        res.write('<h2><a href="listprod">Continue Shopping</a></h2>');
        res.write("<a href='http://localhost:3000/index'>Return to Home</a>");
        res.end();

    } catch (error) {
        console.error("Error processing order:", error);
        res.write("<h1>Error: Something went wrong while processing your order. Please try again later.</h1>");
        res.end();
    }
});

module.exports = router;








