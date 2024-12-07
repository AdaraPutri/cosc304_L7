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
    res.write("<title>ZnA Grocery</title>");

    res.write(`
    <style>
    body {
        font-family: Arial, sans-serif;
        margin: 20px;
        background-color: #e8f5e9; /* Light sage green background */
    }

    h1 {
        text-align: center;
        color: #81c784; /* Soft sage green */
    }

    h2, h3 {
        color: #66bb6a; /* Slightly darker sage green */
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
    }

    th, td {
        padding: 12px;
        text-align: left;
        border: 1px solid #66bb6a; /* Sage green border */
    }

    th {
        background-color: #a5d6a7; /* Light sage green table header */
        color: white;
    }

    tr:nth-child(even) {
        background-color: #e8f5e9; /* Light sage green for even rows */
    }

    .form-container {
        text-align: center;
        margin-bottom: 20px;
    }

    input[type="text"], select {
        padding: 10px;
        width: 300px;
        border: 1px solid #81c784; /* Soft sage green border */
    }

    button {
        padding: 10px 20px;
        background-color: #81c784; /* Soft sage green button */
        color: white;
        border: none;
        cursor: pointer;
    }

    button:hover {
        background-color: #66bb6a; /* Darker sage green on hover */
    }

    button[type="reset"] {
        background-color: #a5d6a7; /* Light sage green reset button */
    }

    button[type="reset"]:hover {
        background-color: #66bb6a; /* Darker sage green on hover */
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

    res.write("<h2>Search for the products you want to buy:</h2>");
    
    res.write(`
    <!-- Back to Home Text with Arrow -->
    <a href="http://localhost:3000/index" class="back-link">&lt;&lt; Back to Home</a>
    <div class="form-container">
        <form method="get" action="/listprod">
            <input type="text" name="productName" placeholder="Enter product name" />
            <select name="category">
                <option value="">Select Category</option>
                <option value="Beverages">Beverages</option>
                <option value="Condiments">Condiments</option>
                <option value="Dairy Products">Dairy Products</option>
                <option value="Produce">Produce</option>
                <option value="Meat/Poultry">Meat/Poultry</option>
                <option value="Seafood">Seafood</option>
                <option value="Confections">Confections</option>
                <option value="Grains/Cereals">Grains/Cereals</option>
            </select>
            <button type="submit">Search</button>
            <button type="reset">Reset</button>
        </form>
    </div>
`);

    let productName = req.query.productName;
    let category = req.query.category;

    let searchQuery = productName ? `%${productName}%` : '';
    let categoryFilter = category ? ` AND category = @category` : '';

    let query = `
    SELECT p.productId, p.productName, p.productPrice, c.categoryName
    FROM product p
    JOIN category c ON p.categoryId = c.categoryId
    WHERE 1=1`;    
    if (searchQuery) {
        query += " AND p.productName LIKE @searchQuery";
    }
    if (category) {
        query += " AND c.categoryName = @category";
    }
    query += " ORDER BY p.productId";

    (async function() {
        try {
            let pool = await sql.connect(dbConfig);
            let result = await pool.request()
                .input('searchQuery', sql.NVarChar, searchQuery)
                .input('category', sql.NVarChar, category)
                .query(query);

            res.write("<h3>All Products </h3>");
            res.write("<table border='1'><tr><th>Add to Cart</th><th>Product Name</th><th>Category</th><th>Price</th></tr>");

            result.recordset.forEach(product => {
                let addToCartLink = "/addcart?id=" + product.productId + "&name=" + encodeURIComponent(product.productName) + "&price=" + product.productPrice.toFixed(2);
                let productPageLink= "/product?id=" + product.productId;

                res.write("<tr>");
                res.write("<td><a href='" + addToCartLink + "'>Add to Cart</a></td>");
                res.write("<td><a href='" + productPageLink + "'>" + product.productName+ "</a></td>");                
                res.write("<td>" + product.categoryName + "</td>");
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


