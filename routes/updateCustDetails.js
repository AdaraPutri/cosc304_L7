const express = require('express');
const router = express.Router();
const sql = require('mssql');


router.post('/', async(req, res) =>{
    const{ customerId, userid, firstName, lastName, phonenum, address, country, city, state, postalCode} = req.body;


try{
   
    let pool= await sql.connect(dbConfig);
    query=`UPDATE customer 
        SET userid=@userid, firstName= @firstName, lastName=@lastName, phonenum=@phonenum, address=@address, country=@country, city=@city, state=@state, postalCode=@postalCode
        WHERE customerId=@customerId `;
    await pool.request()
                .input("userid", sql.NVarChar, userid)
                .input("firstName",sql.NVarChar, firstName)
                .input("lastName",sql.NVarChar,lastName)
                .input("phonenum", sql.NVarChar, phonenum)
                .input("address",sql.NVarChar, address)
                .input("country",sql.NVarChar, country)
                .input("state",sql.NVarChar, state)
                .input("city", sql.NVarChar, city)
                .input("customerId",sql.NVarChar, customerId)
                .input("postalCode", sql.NVarChar, postalCode)
                .query(query); 
        req.session.successfulInfoUpdate= "Your Personal Information has been updated!"        
    console.log("Personal Info has been updated")
}
catch(err){
    console.error(err);
    req.session.custDetailErrorMessage="Something went wrong with your Information Update";
    
}
res.redirect("/customer");

});

module.exports=router;