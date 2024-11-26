const express = require('express');
const router = express.Router();

// Rendering the main page
router.get('/', function (req, res) {
    let username = req.session.authenticatedUser;
    let signedInText;
    console.log(1);
    console.log(username);

    // TODO: Display user name that is logged in (or nothing if not logged in)	
    if(req.session.authenticatedUser)
    {
        console.log(2);
        signedInText="Good to see you "+ req.session.authenticatedUser + "!";
    }
   
    res.render('index', {
        title: "Welcome to ZnA Grocery!",
        signedinuser: signedInText
        
        // HINT: Look at the /views/index.handlebars file
        // to get an idea of how the index page is being rendered
    });
})

module.exports = router;
