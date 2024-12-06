const express = require('express');
const router = express.Router();
const sql = require('mssql');


router.post('/', async(req, res) =>{
    const{ productId, productName, productPrice, productDesc} = req.body;

try{
    let pool= await sql.connect(dbConfig);
    //Update the database for the given product Id
    query="UPDATE product SET productName=@productName, productPrice=@productPrice, productDesc=@productDesc WHERE productId=@productId";

    result= await pool.request()
    .input("productName", sql.NVarChar,productName)
    .input("productPrice",sql.Decimal,productPrice)
    .input("productDesc",sql.NVarChar,productDesc)
    .input("productId",sql.Int, productId)
    .query(query);

    req.session.updateSuccessMessage=`Product "${productName}" updated successfully!`;
}
catch(err){
    console.error(err);
    req.session.updateErrorMessage='An error occurred while updating the product.';
       
}
res.redirect("/admin");

});

module.exports=router;