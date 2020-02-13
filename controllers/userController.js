const User = require('../models/User')

exports.login = function(req,res){
    let user = new User(req.body)
    user.login().then(function(result){
        req.session.user = {username: user.data.username, avatar: user.avatar}
        req.session.save(function() {
            res.redirect('/')
        })
    }).catch(function(error){
        req.flash('errors', error)
        req.session.save(function() {
            res.redirect('/')
        })
    })
}

exports.logout = function(req,res){
    req.session.destroy(function() {
        res.redirect('/') 
    })
}

exports.register = function(req,res){
    let user = new User(req.body)
    user.register().then(() => {
        req.session.user = {username: user.data.username, avatar: user.avatar}
        req.session.save(function() {
            res.redirect('/')
        })
    }).catch((regErrors) => {
        regErrors.forEach(function(error) {
            req.flash('regErrors', error)
        })
        req.session.save(function() {
            res.redirect('/')
        })
    })
    
}

exports.home = function(req,res){
    if(req.session.user){
        res.render('home-dashboard')
    }
    else {
        res.render('home-guest', {errors: req.flash('errors'), regErrors: req.flash('regErrors')})
    }
}

exports.mustBeLoggedIn = function(req,res,next){
    if(req.session.user){
        next()
    } else {
        req.flash('errors', "You must be logged in to create posts")
        req.session.save(function() {
            res.redirect('/')
        })
    }
}