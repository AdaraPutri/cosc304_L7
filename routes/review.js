const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.post('/', async(req, res) =>{
    

    let date=new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let reviewDate=`${year}-${month}-${day}`;
    const {productId,customerId, reviewRating,reviewComment}=req.body;
    

    try{
            let pool = await sql.connect(dbConfig);

            // first check if there is a review with same customer id and product id, if so prevent the user from entering a new review
            check_query="SELECT * FROM review WHERE productId=@productId and customerId=@customerId"

            let result= await pool.request()
                    .input('customerId',sql.Int,customerId)
                    .input('productId', sql.Int, productId)
                    .query(check_query);

            if(result.recordset.length>0){
                req.session.existingReviewMessage="You have already submitted a review for this product"    
            }

            else
            {
            query="INSERT INTO review (reviewRating, reviewDate, customerId, productId, reviewComment) VALUES (@reviewRating, @reviewDate, @customerId, @productId, @reviewComment) "

            await pool.request()
                .input('reviewRating', sql.Int,reviewRating)
                .input('reviewDate',sql.Date,reviewDate)
                .input('reviewComment',sql.NVarChar, reviewComment)
                .input('customerId',sql.Int,customerId)
                .input('productId', sql.Int, productId)
                .query(query);

            req.session.successfulReviewMessage="Your review has been submitted!";
            }
        } catch(err) {
            console.dir(err);
            res.write(err + "")
            res.end();
    }
    res.redirect('/product?id='+ productId);

});

module.exports=router;