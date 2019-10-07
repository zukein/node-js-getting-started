// Bot
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const MONGODB_URI = 'mongodb://heroku_qwxzlktt:crq18acv2fph60hu0np1cb67ia@ds331568.mlab.com:31568/heroku_qwxzlktt';
// const csrf = require('csurf');
const flash = require('connect-flash');

// Exp
// const layouts = require("express-ejs-layouts");
const router = require("./routes/index");
const morgan = require("morgan");
const methodOverride = require("method-override");
// const passport = require("passport");
const expressValidator = require("express-validator");

const User = require('./models/user');

// const indexRouter = require('./routes/botRoutes');
// const authRoutes = require('./routes/authRoutes');

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});
// const csrfProtection = csrf();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);
// app.use(csrfProtection);
app.use(flash());

// ユーザーを指定して認証後、次のミドルウェア関数処理を実行
app.use((req, res, next) => {
  console.log(req.session.user)
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
})

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  // res.locals.csrfToken = req.csrfToken();
  next();
});

// Exp
app.use(
  methodOverride("_method", {
    methods: ["POST", "GET"]
  })
);
app.use(morgan("combined"));
// app.use(layouts);
app.use(expressValidator());

app.use("/", router);
// app.use(indexRouter);
// app.use(authRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


mongoose
  .connect(MONGODB_URI)
  .then(result => {
    console.log('Mongo Connection Success')
  })
  .catch(err => {
    console.log(err);
  });

module.exports = app;
