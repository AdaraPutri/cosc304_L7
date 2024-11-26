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
            req.session.authenticatedUser=authenticatedUser;
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
   // let authenticatedUser =  await (async function() {
        try {
            let pool = await sql.connect(dbConfig);

	// TODO: Check if userId and password match some customer account. 
	// If so, set authenticatedUser to be the username.
    let query="SELECT c.userid FROM customer c WHERE c.userid=@userid AND c.password= @passcode";
    let result=await pool.request()
        .input('userid',sql.NVarChar, username)
        .input('passcode',sql.NVarChar, password)
        .query(query);
       
    //currently assumes that userid and password pairs are unique 
    if(result.recordset.length > 0){
    
        return username;
        }
    else{
        
        return false;
        }
           
        
        } catch(err) {
            
            console.dir(err);
            return false;
        }
    //})

    return authenticatedUser;
}

module.exports = router;
