const Post = require('../models/Post')

exports.viewCreateScreen = function(req,res) {
    res.render('../views/create-post')
}

exports.create = function(req,res) {
    let post = new Post(req.body, req.session.user._id)
    post.create().then(() => {
        res.send("New Post created")
    }).catch((errors) => {
        res.send(errors)
    })  
}

exports.viewSingle = function(req,res){
    res.render('../views/single-post-screen')
}