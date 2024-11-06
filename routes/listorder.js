const express = require('express');
const router = express.Router();
const sql = require('mssql');
const moment = require('moment');

const dbConfig = {    
    server: 'cosc304_sqlserver',
    database: 'workson',
    authentication: {
        type: 'default',
        options: {
            userName: 'sa', 
            password: '304#sa#pw'
        }
    },   
    options: {      
        encrypt: false,      
        enableArithAbort: false,
        database: 'workson'
    }
};

router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    res.write('<title>YOUR NAME Grocery Order List</title>');

    (async function() {
        try {
            // Connect to the database
            let pool = await sql.connect(dbConfig);

            // Query to get all order headers
            let ordersQuery = `
                SELECT OrderID, CustomerName, OrderDate
                FROM Orders
            `;
            let ordersResult = await pool.request().query(ordersQuery);

            // Display each order's information
            for (let order of ordersResult.recordset) {
                res.write(`<h3>Order ID: ${order.OrderID}</h3>`);
                res.write(`<p>Customer Name: ${order.CustomerName}</p>`);
                res.write(`<p>Order Date: ${moment(order.OrderDate).format('MMMM Do YYYY')}</p>`);

                // Query to get products for the current order
                let productsQuery = `
                    SELECT ProductName, Quantity, Price
                    FROM OrderProducts
                    WHERE OrderID = ${order.OrderID}
                `;
                let productsResult = await pool.request().query(productsQuery);

                // Display products in a table
                res.write("<table border='1'><tr><th>Product Name</th><th>Quantity</th><th>Price</th><th>Total</th></tr>");
                for (let product of productsResult.recordset) {
                    let total = (product.Quantity * product.Price).toFixed(2); // Calculate total and format to 2 decimals
                    res.write(`<tr>
                        <td>${product.ProductName}</td>
                        <td>${product.Quantity}</td>
                        <td>$${parseFloat(product.Price).toFixed(2)}</td>
                        <td>$${total}</td>
                    </tr>`);
                }
                res.write("</table><br>");
            }
            res.end();

        } catch (err) {
            console.dir(err);
            res.write(JSON.stringify(err));
            res.end();
        }
    })();
});

module.exports = router;