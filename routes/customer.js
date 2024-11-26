const express = require('express');
const router = express.Router();
const sql = require('mssql');
const auth = require('../auth'); // Assuming you have an auth module for authentication

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
// Styling
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
    </style>
    `);

    const userid = req.session.authenticatedUser;


    (async function() {
        try {
            // Connect to the SQL database
            let pool = await sql.connect(dbConfig);

            // Query to get customer information for userId 'arnold' and password 'test'
            let query = `
                SELECT customerId, firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid
                FROM customer
                WHERE userid = @userid
            `;

            // Execute the query
            let result = await pool.request()
                .input('userid', sql.NVarChar, userid)
                .query(query);

            // Check if any results were returned
            if (result.recordset.length > 0) {
                res.write('<h1>Customer Information</h1>');
                result.recordset.forEach(customer => {
                    res.write(`<p>Customer ID: ${customer.customerId}</p>`);
                    res.write(`<p>First Name: ${customer.firstName}</p>`);
                    res.write(`<p>Last Name: ${customer.lastName}</p>`);
                    res.write(`<p>Email: ${customer.email}</p>`);
                    res.write(`<p>Phone Number: ${customer.phonenum}</p>`);
                    res.write(`<p>Address: ${customer.address}</p>`);
                    res.write(`<p>City: ${customer.city}</p>`);
                    res.write(`<p>State: ${customer.state}</p>`);
                    res.write(`<p>Postal Code: ${customer.postalCode}</p>`);
                    res.write(`<p>Country: ${customer.country}</p>`);
                    res.write(`<p>User ID: ${customer.userid}</p>`);
                });
            } else {
                res.write('<h1>No customer found with the given credentials.</h1>');
            }

            res.end();
        } catch (err) {
            console.error(err);
            res.write('<h1>Error occurred while fetching customer data.</h1>');
            res.write(`<p>${err.message}</p>`);
            res.end();
        }
    })();
});

module.exports = router;
