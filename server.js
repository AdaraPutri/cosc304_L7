const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session')

let loadData = require('./routes/loaddata');
let listOrder = require('./routes/listorder');
let listProd = require('./routes/listprod');
let addCart = require('./routes/addcart');
let showCart = require('./routes/showcart');
let checkout = require('./routes/checkout');
let order = require('./routes/order');
let updateQuantity = require('./routes/updateQuantity');
let removeItem = require('./routes/removeItem');
let login = require('./routes/login');
let customer = require('./routes/customer');
let admin = require('./routes/admin');
let logout = require('./routes/logout');

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

// Setting up Express.js routes.
// These present a "route" on the URL of the site.
// Eg: http://127.0.0.1/loaddata
console.log('Setting up routes...');
app.use('/loaddata', loadData);
app.use('/listorder', listOrder);
app.use('/listprod', listProd);
app.use('/addcart', addCart);
app.use('/showcart', showCart);
app.use('/checkout', checkout);
app.use('/order', order);
app.use('/login', login);
app.use('/customer', customer);
app.use('/admin', admin);
app.use('/logout', logout);

// Rendering the main page
app.get('/', function (req, res) {
  console.log('Rendering main page...')
  res.render('index', {
    title: "ZnA Grocery Main Page"
  });
})

app.use('/updateQuantity', updateQuantity);
app.use('/removeItem', removeItem);

// Starting our Express app
console.log('Starting server and listening on port 3000...');
app.listen(3000)