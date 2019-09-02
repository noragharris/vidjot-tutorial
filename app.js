const express = require('express')
const path = require('path')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const flash = require('connect-flash')
const session = require('express-session')
const mongoose = require('mongoose')
const passport = require('passport')

const app = express()

// Load routes
const ideas = require('./routes/ideas')
const users = require('./routes/users')
const core = require('./routes/core')

//Passport config
require('./config/passport')(passport)

const db = require('./config/database')

// TODO move middleware to own namespace
//Connect to mongoose
mongoose.connect(db.mongoURI, {
  useNewUrlParser: true
})
  .then(() => { console.log('MongoDB connected...') })
  .catch(err => console.log(err))

// Handlebars Middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}))
app.set('view engine', 'handlebars')

//method override middleware
app.use(methodOverride('_method'))

//express session middleware
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}))

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(flash())

//global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.error = req.flash('error')
  res.locals.user = req.user || null
  next()
})

// Static Folder
app.use(express.static(path.join(__dirname, 'public')))

//Body-Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//Use Routes
app.use('/ideas', ideas)
app.use('/users', users)
app.use('/', core)

const port = process.env.PORT || 5000

app.listen(port, () => {
  console.log(`Server started on port ${port}`)
})