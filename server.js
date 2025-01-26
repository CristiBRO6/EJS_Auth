const http = require('http');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const cookie = require('cookie-parser');
const flash = require('connect-flash');
const dotenv = require('dotenv');

const db = require('./models');
const authMiddleware = require('./middleware/authMiddleware');

// ENVIRONMENT CONFIGURATION
dotenv.config();

const app = express();
const server = http.createServer(app);
const port = process.env.SERVER_PORT || 5000;

if (app.get('env') === 'production') {
    app.set('trust proxy', 1); // TRUST FIRST PROXY
}

// VIEW ENGINE SETUP
app.set('view engine', 'ejs');

// SERVE STATIC FILES
app.use(express.static('public'));

// PARSE URL-ENCODED BODIES (AS SEND BY HTML FORMS)
app.use(express.urlencoded({ extended: false }))

// BUILT-IN MIDDLEWARE FOR JSON
app.use(express.json());

// MIDDLEWARE FOR CORS CONFIGURATION
app.use(cors());

// MIDDLEWARE FOR COOKIE
app.use(cookie());

// USE THE SESSION MIDDLEWARE
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: app.get('env') === 'production', // ONLY USE SECURE COOKIES IN PRODUCTION
        maxAge: 30 * 24 * 60 * 60 * 1000
    } 
}));

// INITIALIZE PASSPORT MIDDLEWARE FOR AUTHENTICATION SUPPORT
app.use(passport.initialize());

// SETUP PASSPORT TO MANAGE USER SESSION
app.use(passport.session());

// USE FLASH MESSAGES
app.use(flash());

// AUTHENTICATION AND USER SETUP MIDDLEWARE
app.use(authMiddleware.checkUser);

// USE GLOBAL MIDDLEWARE FOR VARIABLES
app.use(require('./middleware/globalVars'));

// ROUTES
app.use('/', require('./routes/root'));
app.use('/admin', require('./routes/admin'));
app.use('/auth', require('./routes/auth'));

// API
app.use('/api', require('./routes/api/root'));

// ROUTE FOR 404 PAGES
app.all('*', (req, res) => {
	res.status(404).render('404');
});

// SERVER STARTUP
db.sequelize.sync().then((req) => {
    server.listen(port, () => {
        console.log('Server started on port ' + port);
    }); 
});