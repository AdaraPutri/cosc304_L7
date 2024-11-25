const express = require('express');
const router = express.Router();
const auth = require('../auth');
const sql = require('mssql');

router.get('/', function(req, res, next) {

	
	// TODO: Include files auth.jsp and jdbc.jsp
    
	
    res.setHeader('Content-Type', 'text/html');

    (async function() {
        try {
            let pool = await sql.connect(dbConfig);

	    // TODO: Write SQL query that prints out total order amount by day

        query="SELECT o.DateTime, o.totalAmount FROM ordersummary o WHERE orderDate=?"
        let currentDate= newDate();
        let result= await pool.request()
                    .input('currentDate',sql.DateTime,currentDate)
                    .query(query);

                    res.write("<table border='1'<tr><th>Order Date</th><th>Total Order Amount</th>></tr>");
                    result.recordset.forEach(order=>{
                        res.write("<tr>");
                        res.write("<td>" + order.DateTime + "</td>");
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