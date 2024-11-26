const express = require('express');
const router = express.Router();
const auth = require('../auth');
const sql = require('mssql');

router.get('/', function(req, res, next) {

	
	// TODO: Include files auth.jsp and jdbc.jsp
    auth.checkAuthentication(req,res);
    
	
    res.setHeader('Content-Type', 'text/html');

    (async function() {
        try {
            let pool = await sql.connect(dbConfig);

	    // TODO: Write SQL query that prints out total order amount by day

        query="SELECT YEAR(o.orderDate) as year, MONTH(o.orderDate) as month, DAY(o.orderDate) as day, o.totalAmount FROM ordersummary o ORDER BY o.orderDate"
        
        let result= await pool.request().query(query);

                    res.write("<table border='1'<tr><th>Order Date</th><th>Total Order Amount</th>></tr>");
                    result.recordset.forEach(order=>{
                        formattedDate= order.year + "-" + order.month + "-" + order.day
                        res.write("<tr>");
                        res.write("<td>" + formattedDate + "</td>");
                        res.write("<td>" + order.totalAmount + "</td>");
                        res.write("<tr>");
                    })
                res.write("</table>");
                res.end();
        } catch(err) {
            console.dir(err);
            res.write(err + "");
            res.end();
        }
    })();
});

module.exports = router;