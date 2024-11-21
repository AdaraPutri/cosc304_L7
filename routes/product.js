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
	// Get product name to search for
   const query= "SELECT * from product p WHERE productId= @productId";
    let result= await request.query(query)

                
	// TODO: Retrieve and display info for the product
    result.recordset.forEach(product => {
        let displayImageLink="/displayImage?id="+ product.productId;
        let localImageLink="/public/"+ product.productImageURL;
        let addToCartLink = "/addcart?id=" + product.productId + "&name=" + encodeURIComponent(product.productName) + "&price=" + product.productPrice.toFixed(2);
        let continueShoppingLink="/listprod";

        res.write("<h1>" + product.productName+ "</h1>");
        if(product.productImageURL){
            res.write("<img src =" + localImageLink + "></img>")
        }
        
        // fetch(displayImageLink)
        // .then(response => response.text())  
        // .then(displayImage => {
        //     res.write ("<img src=' data:image/jpg;base64," + displayImage + "'></img>");    
        // })
        res.write("<h2><a href="  + addToCartLink + ">Add to Cart</a></h2>")
        res.write("<h2><a href=" + continueShoppingLink + " >Continue Shopping</a></h2>")
    } );   

	// TODO: If there is a productImageURL, display using IMG tag

	// TODO: Retrieve any image stored directly in database. Note: Call displayImage.jsp with product id as parameter.

	// TODO: Add links to Add to Cart and Continue Shopping
   

    

            res.end()
        } catch(err) {
            console.dir(err);
            res.write(err + "")
            res.end();
        }
    })();
});

module.exports = router;
