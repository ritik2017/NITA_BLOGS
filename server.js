const express = require('express')
const router = require('./router')
const session = require('express-session')

const app = express()

let sessionOptions = session({
    secret: "This is NITA BLOGS site",
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60 * 24, httpOnly: true}
})

app.use(express.static('public'))
app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.set('views', 'views')
app.set('view engine', 'ejs')

app.use('/', router)

module.exports = app