const express = require('express')
const router = require('./router')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const flash = require('connect-flash')
const markdown = require('marked')
const sanitizeHTML = require('sanitize-html')

const app = express()

let sessionOptions = session({
    secret: "This is NITA BLOGS site",
    store: new MongoStore({client: require('./db')}),
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60 * 24, httpOnly: true}
})

app.use(sessionOptions)
app.use(flash())

app.use(function(req, res, next) {
    //Make Markdown available
    res.locals.filterUserHTML = function(content) {
        return sanitizeHTML(markdown(content),{
            allowedTags: ['p', 'br', 'i', 'h1', 'h2','h3', 'h4','h5','h6', 'strong', 'li', 'ol', 'ul'],
            allowedAttributes: {}
        })
    }

    // Make all error and success messages available
    res.locals.errors = req.flash("errors")
    res.locals.success = req.flash("success")

    // Make current user id available in req object
    if(req.session.user){
        req.visitorId = req.session.user._id
    }
    else{
        req.visitorId = 0
    }
    // Make User Session Data 
    res.locals.user = req.session.user
    next()
})

app.use(express.static('public'))
app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.set('views', 'views')
app.set('view engine', 'ejs')
app.use('/', router)

module.exports = app