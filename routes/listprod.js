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

router.get('/', function(req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.write("<title>YOUR NAME Grocery</title>");
    res.write("<h2>Search for the products you want to buy:</h2>");
    
    res.write(`
        <form method="get" action="/listprod">
            <input type="text" name="productName" placeholder="Enter product name" />
            <button type="submit">Submit</button>
            <button type="reset">Reset</button>
        </form>
    `);

    let productName = req.query.productName;
    let searchQuery = productName ? `%${productName}%` : '';

    let query = "SELECT productId, productName, productPrice FROM product";
    if (searchQuery) {
        query += " WHERE productName LIKE @searchQuery";
    }
    query += " ORDER BY productId";

    (async function() {
        try {
            let pool = await sql.connect(dbConfig);
            let result = await pool.request()
                .input('searchQuery', sql.NVarChar, searchQuery)
                .query(query);

            res.write("<h3>All Products</h3>");
            res.write("<table border='1'><tr><th>Add to Cart</th><th>Product Name</th><th>Price</th></tr>");

            result.recordset.forEach(product => {
                let addToCartLink = "/addcart?id=" + product.productId + "&name=" + encodeURIComponent(product.productName) + "&price=" + product.productPrice.toFixed(2);

                res.write("<tr>");
                res.write("<td><a href='" + addToCartLink + "'>Add to Cart</a></td>");
                res.write("<td>" + product.productName + "</td>");
                res.write("<td>$" + product.productPrice.toFixed(2) + "</td>");
                res.write("</tr>");
            });

            res.write("</table>");
            res.end();

        } catch (err) {
            console.error("Database error:", err);
            res.write("<h2>Oops! Something went wrong.</h2>");
            res.end();
        }
    })();
});

module.exports = router;


