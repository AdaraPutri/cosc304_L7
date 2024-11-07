const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    res.write("<title>Grocery CheckOut Line</title>");
    
    res.write(`
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            margin: 0;
            padding: 0;
            background-image: url('https://img.freepik.com/premium-photo/fruits-vegetables-shopping-bag-wood-table-top-with-supermarket-grocery-store-background_293060-6898.jpg');
            background-size: cover;
            background-position: center;
            color: #333;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .container {
            background-color: rgba(255, 255, 255, 0.8); /* Semi-transparent white background */
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
            text-align: center;
            width: 400px;
        }

        h1 {
            color: #4CAF50; /* Sage green */
            margin-bottom: 20px;
        }

        input[type="text"] {
            width: 100%;
            padding: 10px;
            margin: 10px 0;
            border: 1px solid #4CAF50;
            border-radius: 4px;
            font-size: 16px;
        }

        input[type="submit"],
        input[type="reset"] {
            background-color: #4CAF50;
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 16px;
            border-radius: 4px;
            cursor: pointer;
            margin: 10px 5px;
        }

        input[type="submit"]:hover,
        input[type="reset"]:hover {
            background-color: #388E3C; /* Darker sage green */
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

    res.write('<!-- Back to Home Text with Arrow --><a href="http://localhost" class="back-link">&lt;&lt; Back to Home</a>');
    res.write("<div class='container'>");
    res.write("<h1>Enter your customer id to complete the transaction:</h1>");
    res.write('<form method="get" action="order">');
    res.write('<input type="text" name="customerId" size="50" required>');
    res.write('<input type="submit" value="Submit"><input type="reset" value="Reset">');
    res.write('</form>');
    res.write("</div>");
    
    res.end();
});

module.exports = router;

