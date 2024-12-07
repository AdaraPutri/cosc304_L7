const express = require('express');
const router = express.Router();

// Rendering the main page
router.get('/', function (req, res) {
    let username = req.session.authenticatedUser;
    let signedInText;
    

    
    if(req.session.authenticatedUser)
    {
        
        signedInText="Good to see you "+ req.session.authenticatedUser + "!";
    }
   
    res.render('index', {
        title: "Welcome to ZnA Grocery!",
        signedinuser: signedInText,
        navItems: [{ name: 'Home', link: '/', active: true },
            { name: 'Cart', link: '/showcart', active: false },
            { name: 'Login', link: '/login', active: false },
            { name: 'Logout', link: '/logout', active: false },
            { name: req.session.authenticatedUser , link: '/customer' , active: false }]
        
    });
})

module.exports = router;

       
        