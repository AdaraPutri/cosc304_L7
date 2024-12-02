const express = require('express');
const router = express.Router();
const sql = require('mssql');


router.post('/', async(req, res) =>{
    const productId= req.body.productId;
    console.log('productId:', productId);

try{
    let pool= await sql.connect(dbConfig);

    query="DELETE FROM product WHERE productId=@productId";

    result= await pool.request()
    .input("productId", sql.Int, productId)
    .query(query);

    req.session.deleteSuccessMessage=`Product "${productId}" deleted successfully!`;
}
catch(err){
    console.error(err);
    if (err.code === 'EPARAM' || err.message.includes('REFERENCE constraint')) {
        req.session.deleteErrorMessage = 'Cannot delete product because it is still associated with orders.';
    } else {
        req.session.deleteErrorMessage = 'An error occurred while deleting the product.';
    }       
}
res.redirect("/admin");

});

module.exports=router;