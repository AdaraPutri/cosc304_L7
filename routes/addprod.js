const express = require('express');
const router = express.Router();
const sql = require('mssql');


router.post('/', async(req, res) =>{
    const{ productName, productPrice, productDesc, productCategory} = req.body;

    if(!productName||!productPrice||!productDesc||!productCategory){
        return res.status(400).send('All fields are required.');

    }
try{
    let pool= await sql.connect(dbConfig);

    query="INSERT INTO product(productName, productPrice, productDesc, categoryId) VALUES (@productName, @productPrice, @productDesc, @productCategory)";
    result= await pool.request()
    .input("productName", sql.NVarChar,productName)
    .input("productPrice",sql.Decimal,productPrice)
    .input("productDesc",sql.NVarChar,productDesc)
    .input("productCategory",sql.Int,productCategory)
    .query(query);

    req.session.successMessage=`Product "${productName}" added successfully!`;
}
catch{
    console.error(err);
    console.error(err);
    req.session.errorMessage='An error occurred while adding the product.';
       
}
res.redirect("/admin");

});

module.exports=router;