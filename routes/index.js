const express = require('express');
const router = express.Router();

// Rendering the main page
router.get('/', function (req, res) {
    let username = false;
    let signedInText= "";
    
    // TODO: Display user name that is logged in (or nothing if not logged in)	
    if(authenticatedUser)
    {
        let signedInText="Good to see you"+ authenticatedUser
    }

    res.render('index', {
        title: "Welcome to ZnA Grocery!",
        signedinuser: signedInText
        
        // HINT: Look at the /views/index.handlebars file
        // to get an idea of how the index page is being rendered
    });
})

module.exports = router;
