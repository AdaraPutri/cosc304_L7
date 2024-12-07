const express = require('express');
const router = express.Router();
const auth = require('../auth');
const sql = require('mssql');

router.get('/', function(req, res, next) {

	
    auth.checkAuthentication(req,res);
    
	
    res.setHeader('Content-Type', 'text/html');
    let successMessage=req.session.successMessage? req.session.successMessage: false;
    let errorMessage=req.session.errorMessage? req.session.errorMessage: false;
    let updateSuccessMessage=req.session.updateSuccessMessage;
    let updateErrorMessage=req.session.updateErrorMessage;
    let deleteSuccessMessage=req.session.deleteSuccessMessage;
    let deleteErrorMessage=req.session.deleteErrorMessage;

    (async function() {
        try {
            let pool = await sql.connect(dbConfig);

            query="SELECT YEAR(o.orderDate) as year, MONTH(o.orderDate) as month, DAY(o.orderDate) as day, SUM(o.totalAmount) as totalSales FROM ordersummary o GROUP BY YEAR(o.orderDate), MONTH(o.orderDate), DAY(o.orderDate) "
        
            let result= await pool.request()
                            .query(query);

            const orders= result.recordset; 

            //Create a fullDate attribute for ease of using handlebars
            orders.forEach(order => {
                order.fullDate = `${order.year}-${order.month}-${order.day}`;
                
            });
            //render the admin page
            res.render('admin',{
                order: orders,
                successMessage: successMessage,
                errorMessage:errorMessage,
                updateSuccessMessage: updateSuccessMessage,
                updateErrorMessage: updateErrorMessage,
                deleteErrorMessage: deleteErrorMessage,
                deleteSuccessMessage: deleteSuccessMessage,
                navItems: [{ name: 'Home', link: '/', active: true },
                    { name: 'Cart', link: '/showcart', active: false },
                    { name: 'Login', link: '/login', active: false },
                    { name: 'Logout', link: '/logout', active: false },
                    {name: req.session.authenticatedUser, link: '/customer' ,active: false }]

            });
            req.session.successMessage=null;
            req.session.errorMessage=null;
            req.session.updateSuccessMessage=null;
            req.session.updateErrorMessage=null;
            req.session.deleteSuccessMessage=null;
            req.session.deleteErrorMessage=null;


        } catch(err) {
            console.dir(err);
            res.write(err + "");
            res.end();
        }
    })();
    
});


module.exports = router;