const express = require('express');
const router = express.Router();
const sql = require('mssql');
const moment = require('moment');

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
        enableArithAbort: false,
        database: 'orders'
    }
};

router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    res.write('<title>ZnA Grocery Order List</title>');
    
    // Add the styling for the page
    res.write(`
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            color: #333;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
        }

        h1 {
            color: #4CAF50; /* Sage green */
            margin-top: 20px;
        }

        table {
            border-collapse: collapse;
            width: 80%;
            margin: 20px 0;
            box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
            background-color: #ffffff;
        }

        th, td {
            text-align: center;
            padding: 12px;
            border: 1px solid #ddd;
        }

        th {
            background-color: #4CAF50;
            color: white;
        }

        tr:nth-child(even) {
            background-color: #f2f2f2;
        }

        .back-link {
            position: fixed;
            top: 50px; /* Adjust this value to add more space from the top */
            left: 20px;
            font-size: 20px;
            color: #000000;
            cursor: pointer;
            text-decoration: none;
        }
    
        .back-link:hover {
            text-decoration: underline;
        }
    </style>
    `);

    (async function() {
        try {
            let pool = await sql.connect(dbConfig);

            let ordersQuery = 
            "SELECT o.orderid, o.orderdate, o.customerid, c.firstname + ' ' + c.lastname AS customername, o.totalamount, op.productid, op.quantity, op.price FROM ordersummary o JOIN customer c ON o.customerid = c.customerid JOIN orderproduct op ON o.orderid = op.orderid ORDER BY o.orderid ASC;";
            let ordersResult = await pool.request().query(ordersQuery);
            
            let groupedOrders = {}; 
            ordersResult.recordset.forEach((order) => {
                if (!groupedOrders[order.orderid]) {
                    groupedOrders[order.orderid] = {
                        orderid: order.orderid,
                        orderdate: order.orderdate,
                        customerid: order.customerid,
                        customername: order.customername,
                        totalamount: order.totalamount,
                        items: []
                    };
                }
                
                groupedOrders[order.orderid].items.push({
                    productid: order.productid,
                    quantity: order.quantity,
                    price: order.price
                });
            });
            
            res.write('<!-- Back to Home Text with Arrow --><a href="http://localhost" class="back-link">&lt;&lt; Back to Home</a>');
            res.write('<h1>Order List</h1>');

            res.write("<table><tr><th>Order Id</th><th>Order Date</th><th>Customer Id</th><th>Customer Name</th><th>Total Amount</th></tr>");
            
            for (let orderid in groupedOrders) {
                let order = groupedOrders[orderid];

                res.write("<tr>");
                res.write("<td>" + order.orderid + "</td>");
                res.write("<td>" + moment(order.orderdate).format("YYYY-MM-DD HH:mm:ss") + "</td>");
                res.write("<td>" + order.customerid + "</td>");
                res.write("<td>" + order.customername + "</td>");
                res.write("<td>" + new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(order.totalamount) + "</td>");
                res.write("</tr>");
                
                res.write("<tr><td colspan='2'>&nbsp;</td><td colspan='3'>");
                res.write("<table><tr><th>Product Id</th><th>Quantity</th><th>Price</th></tr>");
                order.items.forEach(item => {
                    res.write("<tr>");
                    res.write("<td>" + item.productid + "</td>");
                    res.write("<td>" + item.quantity + "</td>");
                    res.write("<td>" + new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.price) + "</td>");
                    res.write("</tr>");
                });
                res.write("</table>");
                res.write("</td></tr>");
            }

            res.write("</table>");
            res.end();

        } catch (err) {
            console.dir(err);
            res.write(JSON.stringify(err));
            res.end();
        }
    })();
});

module.exports = router;
