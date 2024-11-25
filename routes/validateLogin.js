const express = require('express');
const router = express.Router();
const auth = require('../auth');
const sql = require('mssql');

router.post('/', function(req, res) {
    // Have to preserve async context since we make an async call
    // to the database in the validateLogin function.
    (async () => {
        let authenticatedUser = await validateLogin(req);
        if (authenticatedUser) {
            res.redirect("/");
        } else {
            res.redirect("/login");
        }
     })();
});

async function validateLogin(req) {
    if (!req.body || !req.body.username || !req.body.password) {
        return false;
    }

    let username = req.body.username;
    let password = req.body.password;
    let authenticatedUser =  await (async function() {
        try {
            let pool = await sql.connect(dbConfig);

	// TODO: Check if userId and password match some customer account. 
	// If so, set authenticatedUser to be the username.
    let query="SELECT c.userid, c.password FROM customer c WHERE c.userid=@username AND c.password=@password";
    let result=await pool.request()
        .input('username',sql.NVarChar,username)
        .input('password',sql.NVarChar,password)
        .query(query);
       
    //currently assumes that userid and password pairs are unique 
    if(result.recordset.length> 0){
         //to test the output
         res.write("<h2>" + result.recordset[0].userid + " </h2>")
        req.session.authenticatedUser=result.recordset[0].userid;
        }
    else{
        return false;
        }
           
        
        } catch(err) {
            console.dir(err);
            return false;
        }
    })

    return authenticatedUser;
}

module.exports = router;
