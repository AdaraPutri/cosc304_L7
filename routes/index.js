const express = require('express');
const router = express.Router();

// Rendering the main page
router.get('/', function (req, res) {
    let username = req.session.authenticatedUser;
    let signedInText;
    console.log(1);
    console.log(username);

    if(req.session.authenticatedUser)
    {
        console.log(2);
        signedInText="Good to see you "+ req.session.authenticatedUser + "!";
    }
   
    res.render('index', {
        title: "Welcome to ZnA Grocery!",
        signedinuser: signedInText,
        navItems: [{ name: 'Home', link: '/', active: true },
            { name: 'Cart', link: '/showcart', active: false },
            { name: 'Login', link: '/login', active: false },
            { name: 'Logout', link: '/logout', active: false }]
        
    });
})

module.exports = router;
