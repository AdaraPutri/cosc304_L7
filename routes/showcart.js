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

// Display shopping cart
router.get('/', async function(req, res) {
    const customerId = req.session.customerId; // Assuming customer ID is stored in session after login

    if (!customerId) {
        return res.status(401).send("Please log in to view your cart.");
    }

    try {
        let pool = await sql.connect(dbConfig);

        // Retrieve active cart items for the user
        const result = await pool.request()
            .input('customerId', sql.Int, customerId)
            .query(`
                SELECT op.productId, p.productName, op.quantity, op.price,
                       (op.quantity * op.price) AS subtotal
                FROM ordersummary os
                JOIN orderproduct op ON os.orderid = op.orderid
                JOIN product p ON op.productid = p.productid
                WHERE os.customerid = @customerid AND os.totalamount IS NULL
            `);

        const cartItems = result.recordset;

        res.setHeader('Content-Type', 'text/html');
        res.write("<title>Your Shopping Cart</title>");
        res.write(`
        <style>
            body {
                font-family: Arial, Helvetica, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f5f5f5;
                color: #333;
            }

            .container {
                width: 80%;
                margin: 20px auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
            }

            h1 {
                font-family: 'Arial', sans-serif;
                color: #4CAF50;
                text-align: center;
            }

            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }

            th, td {
                padding: 12px;
                text-align: center;
                border: 1px solid #4CAF50;
            }

            th {
                background-color: #A5D6A7;
                color: white;
            }

            tr:nth-child(even) {
                background-color: #E8F5E9;
            }

            a {
                text-decoration: none;
                color: #4CAF50;
            }

            a:hover {
                color: #388E3C;
            }

            .total {
                font-weight: bold;
                color: #388E3C;
                text-align: right;
            }

            .actions {
                text-align: center;
                margin-top: 20px;
            }
        </style>
        `);

        res.write("<div class='container'>");
        if (cartItems.length > 0) {
            res.write("<h1>Your Shopping Cart</h1>");
            res.write("<table><tr><th>Product Name</th><th>Quantity</th><th>Price</th><th>Subtotal</th></tr>");

            let totalAmount = 0;
            cartItems.forEach(item => {
                totalAmount += item.subtotal;
                res.write(`<tr>
                    <td>${item.productName}</td>
                    <td>${item.quantity}</td>
                    <td align="right">$${item.price.toFixed(2)}</td>
                    <td align="right">$${item.subtotal.toFixed(2)}</td>
                    <td><a href="/updateQuantity?productId=${item.id}&action=decrease">-</a> <a href="/updateQuantity?productId=${item.id}&action=increase">+</a></td>
                    <td><a href="/removeItem?productId=${item.id}">Remove</a></td></tr>
                </tr>`);
            });

            res.write(`<tr><td colspan="3" class='total'>Order Total</td><td align="right" class='total'>$${totalAmount.toFixed(2)}</td></tr>`);
            res.write("</table>");

            res.write("<div class='actions'><h2><a href='/checkout'>Proceed to Checkout</a></h2></div>");
        } else {
            res.write("<h1>Your shopping cart is empty!</h1>");
        }
        res.write('<div class="actions"><h2><a href="/listprod">Continue Shopping</a></h2></div>');
        res.write("</div>");
        res.end();
    } catch (err) {
        console.error("Error retrieving cart:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Handle increase/decrease of quantity
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

// Handle removing an item from the cart
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

