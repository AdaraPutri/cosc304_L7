const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');

let loadData = require('./routes/loaddata');
let listOrder = require('./routes/listorder');
let listProd = require('./routes/listprod');
let product= require('./routes/product');
let displayImage= require('./routes/displayImage');
let addCart = require('./routes/addcart');
let showCart = require('./routes/showcart');
let checkout = require('./routes/checkout');
let order = require('./routes/order');
let updateQuantity = require('./routes/updateQuantity');
let removeItem = require('./routes/removeItem');
let admin=require('./routes/admin');
let login=require('./routes/login');
let logout=require('./routes/logout');
let customer=require('./routes/customer');
let validateLogin=require('./routes/validateLogin');
let index=require('./routes/index');
let ship=require('./routes/ship');
let addprod=require('./routes/addprod');
let updateprod= require('./routes/updateprod');
let deleteprod=require('./routes/deleteprod');
let review=require('./routes/review')

const app = express();

// This DB Config is accessible globally
dbConfig = {    
  server: 'cosc304_sqlserver',
  database: 'orders',
  authentication: {
      type: 'default',
      options: {
          userName: 'sa', 
          password: '304#sa#pw'
      }
  },   
  options: {      
    encrypt: false,      
    enableArithAbort:false,
    database: 'orders'
  }
}

console.log('DB Config:', dbConfig);
// Setting up the session.
// This uses MemoryStorage which is not
// recommended for production use.

console.log('Setting up session...');
app.use(session({
  secret: 'COSC 304 Rules!',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: false,
    secure: false,
    maxAge: 60000,
  }
}))

// Setting up the rendering engine
console.log('Setting up handlebars rendering engine...');
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//To allow images from the public file to display
app.use('/public', express.static('public'));


// Setting up Express.js routes.
// These present a "route" on the URL of the site.
// Eg: http://127.0.0.1/loaddata
console.log('Setting up routes...');
app.use('/loaddata', loadData);
app.use('/listorder', listOrder);
app.use('/listprod', listProd);
app.use('/addcart', addCart);
app.use('/product',product)
app.use('/displayImage',displayImage)
app.use('/showcart', showCart);
app.use('/checkout', checkout);
app.use('/order', order);
app.use('/admin', admin);
app.use('/login', login);
app.use('/logout', logout);
app.use('/customer', customer);
app.use('/validateLogin', validateLogin);
app.use('/index', index);
app.use('/ship',ship);
app.use('/addprod', addprod);
app.use('/updateprod', updateprod);
app.use('/deleteprod', deleteprod);
app.use('/review', review);

// Rendering the main page
app.get('/', function (req, res) {
  console.log('Rendering main page...')
  res.redirect("/index")
})


app.use('/updateQuantity', updateQuantity);
app.use('/removeItem', removeItem);

// Starting our Express app
console.log('Starting server and listening on port 3000...');
app.listen(3000)