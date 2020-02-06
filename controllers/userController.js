const User = require('../models/User')

exports.login = function(req,res){
    let user = new User(req.body)
    user.login().then(function(result){
        res.send(result)
    }).catch(function(error){
        res.send(error)
    })
}

exports.logout = function(req,res){

}

exports.register = function(req,res){
    let user = new User(req.body)
    user.register()
    if(user.errors.length == 0)
        res.send("Thank you for registering")
    else
        res.send(user.errors)
}

exports.home = function(req,res){
    res.render('home-guest')
}