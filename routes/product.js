const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');

    (async function() {
        try {
            let productId=req.query.id;
            let pool = await sql.connect(dbConfig);
    
            let request=pool.request();

            request.input('productId', sql.Int, productId)
            
   const product_query= "SELECT * from product p WHERE productId= @productId";
    let result= await request.query(product_query)

    const review_query="SELECT* FROM review WHERE productId=@productId ORDER BY reviewDate desc";
    let review_results= await pool.request()
                                .input('productId', sql.Int, productId)
                                .query(review_query)



     //TODO Clean up code by using resultset[0] instead of product   
	//Retrieve and display info for the product
            const product= result.recordset;
            let productName=product[0].productName;
            console.log(productName);
            let displayImageLink=null;
            let localImageLink=null;
            let addToCartLink = "/addcart?id=" + product[0].productId + "&name=" + encodeURIComponent(product[0].productName) + "&price=" + product[0].productPrice.toFixed(2);
            let continueShoppingLink="/listprod";
            let productDesc=product[0].productDesc;
            
            console.log(product[0].productDesc)
            if(product[0].productImage){
                displayImageLink="/displayImage?id="+ product[0].productId;
            }
            if(product[0].productImageURL){
                localImageLink="/public/"+ product[0].productImageURL;
            }

    //Retrieve display info for review 
            let review=review_results.recordset;
            let noReviewMessage;
            console.log(review.length);

            if(review.length==0){
                noReviewMessage="No reviews yet!";
            }
            


        
        res.render('product',{
            productName: productName,
            localImageLink : localImageLink,
            displayImageLink: displayImageLink,
            productDesc: productDesc,
            addToCartLink: addToCartLink,
            continueShoppingLink: continueShoppingLink,
            review:review,
            noReviewMessage: noReviewMessage
        });
    

        } catch(err) {
            console.dir(err);
            res.write(err + "")
            res.end();
        }
    })();
});

module.exports = router;
