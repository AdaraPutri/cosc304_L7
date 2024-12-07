const express = require('express');
const router = express.Router();
const sql = require('mssql');
const auth = require('../auth'); // Assuming you have an auth module for authentication


router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');

    const userid = req.session.authenticatedUser;
    console.log(userid);


    (async function() {
        try {
            console.log("Checking for customer Information...")
            // Connect to the SQL database
            let pool = await sql.connect(dbConfig);
            console.log("Connecting to the database...")

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
            let notLoggedIn;
            let customer;

            if(result.recordset.length==0){
                notLoggedIn= "You're not currently logged in :(";
            }
            else{
                customer=result.recordset[0];
                customer.header=customer.firstName + " " + customer.lastName + "'s Profile Information";
            }

            console.log(req.session.successfulInfoUpdate)
            res.render("customer", {
                customer: customer,
                notLoggedIn: notLoggedIn,
                successfulInfoUpdate: req.session.successfulInfoUpdate,
                custDetailErrorMessage: req.session.custDetailErrorMessage
        });

        req.session.successfulInfoUpdate=null;
        req.session.custDetailErrorMessage=null;
        
        } catch (err) {
            console.error(err);
            res.write('<h1>Error occurred while fetching customer data.</h1>');
            res.write(`<p>${err.message}</p>`);
            res.end();
        }
    })();
});

module.exports = router;
