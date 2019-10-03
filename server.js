var express = require('express');
var passport = require('passport');
var session = require('express-session');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var hbs = require('handlebars');
var formHelpers = require('handlebars-form-helpers').register(hbs);
var customHelpers = require('./app/views/helpers/customHelpers');
var flash = require('express-flash');

customHelpers.register(hbs);

var app = express();

const PORT = process.env.PORT || 5000;

//For BodyParser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//For Passport
app.use(session({secret: 'keyboard cat',resave:true,saveUninitialized:true}));
app.use(passport.initialize());
app.use(passport.session());

// for unwrapping page URL and pass in User
app.use(userView);

// passing User data
function userView(req, res, next) {
    //grabs first param in url (page)
    var temp = {[req.originalUrl.split('/')[1]] :  true};
    //sets the page to page variable
    res.locals.Page = temp;
    //wraps req.User into local User
    res.locals.User = req.user;
    next();
}

//For Handlebars
var viewsPath = './app/views';
app.set('views', viewsPath);
app.engine('hbs', exphbs({
    extname: '.hbs',
    defaultLayout: 'layout',
    layoutsDir: viewsPath + '/layouts',
    partialsDir: viewsPath + '/partials'
}));
app.set('view engine', '.hbs');

//For static content
app.use(express.static('./app/static'));
app.use(flash());

//Models
var models = require("./app/models");

//Routes
var authRoute = require('./app/routes/auth.js')(app, passport);

//load passport strategies
require('./app/config/passport/passport.js')(passport, models.User, models.Snapshot);

models.sequelize.sync().then(function() {
    console.log('Nice! Database looks fine')
}).catch(function(err) {
    console.log(err, "Something went wrong with the Database Update!")
});

app.listen(PORT, function(err) {

    if (!err)
        console.log("Site is live");
    else console.log(err)

});
