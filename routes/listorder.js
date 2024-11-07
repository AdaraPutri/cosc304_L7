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
    res.write('<title>YOUR NAME Grocery Order List</title>');

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
            
            res.write('<h1>Order List</h1>');

            res.write("<table border='1'><tr><th>Order Id</th><th>Order Date</th><th>Customer Id</th><th>Customer Name</th><th>Total Amount</th></tr>");
            
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
                res.write("<table border='1'><tr><th>Product Id</th><th>Quantity</th><th>Price</th></tr>");
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