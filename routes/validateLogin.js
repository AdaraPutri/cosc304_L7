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

router.post('/', function(req, res) {
    (async () => {
        let authenticatedUser = await validateLogin(req);
        if (authenticatedUser) {
            req.session.authenticatedUser = authenticatedUser.username; // Store username
            req.session.customerId = authenticatedUser.customerId; // Store customerId
            res.redirect("/");
        } else {
            req.session.loginMessage = "Invalid username or password.";
            res.redirect("/login");
        }
    })();
});

async function validateLogin(req) {
    if (!req.body || !req.body.username || !req.body.password) {
        return false;
    }

    const username = req.body.username;
    const password = req.body.password;

    try {
        const pool = await sql.connect(dbConfig);

        // Query to validate login and retrieve customerId
        const query = `
            SELECT c.userid, c.customerId 
            FROM customer c 
            WHERE c.userid = @userid AND c.password = @passcode
        `;
        const result = await pool.request()
            .input('userid', sql.NVarChar, username)
            .input('passcode', sql.NVarChar, password)
            .query(query);

        if (result.recordset.length > 0) {
            return {
                username: result.recordset[0].userid,
                customerId: result.recordset[0].customerId
            };
        } else {
            return false;
        }
    } catch (err) {
        console.error("Error validating login:", err);
        return false;
    }
}

module.exports = router;
