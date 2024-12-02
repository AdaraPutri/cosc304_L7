const express = require('express');
const router = express.Router();
const auth = require('../auth');
const sql = require('mssql');

router.get('/', function(req, res, next) {

	
    auth.checkAuthentication(req,res);
    
	
    res.setHeader('Content-Type', 'text/html');

    (async function() {
        try {
            let pool = await sql.connect(dbConfig);

            query="SELECT YEAR(o.orderDate) as year, MONTH(o.orderDate) as month, DAY(o.orderDate) as day, SUM(o.totalAmount) as totalSales FROM ordersummary o GROUP BY YEAR(o.orderDate), MONTH(o.orderDate), DAY(o.orderDate) "
        
            let result= await pool.request()
                            .query(query);

            const orders= result.recordset;


            orders.forEach(order => {
                order.fullDate = `${order.year}-${order.month}-${order.day}`;
                
            });

            res.render('admin',{
                order: orders});

        } catch(err) {
            console.dir(err);
            res.write(err + "");
            res.end();
        }
    })();
});

module.exports = router;