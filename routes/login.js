const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    // Set the message for the login, if present
    let loginMessage = false;
    if (req.session.loginMessage) {
        loginMessage = req.session.loginMessage;
        req.session.loginMessage = false;
    }

    res.render('login', {
        title: "Login Screen",
        loginMessage: loginMessage,
        navItems: [{ name: 'Home', link: '/', active: true },
            { name: 'Cart', link: '/showcart', active: false },
            { name: 'Login', link: '/login', active: false },
            { name: 'Logout', link: '/logout', active: false },
            {name: req.session.authenticatedUser, link: '/customer' ,active: false }]
    });
});

module.exports = router;
