const express = require('express')
const router = require('./router')

const app = express()

app.use(express.static('public'))

app.set('views', 'views')
app.set('view engine', 'ejs')

app.use('/', router)

app.listen(3000)