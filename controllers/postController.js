const Post = require('../models/Post')

exports.viewCreateScreen = function(req,res) {
    res.render('../views/create-post')
}

exports.create = function(req,res) {
    let post = new Post(req.body, req.session.user._id)
    post.create().then((postId) => {
        req.flash("success", "New post successfully created")
        req.session.save(function() {
            res.redirect(`post/${postId}`)
        })
    }).catch((errors) => {
        errors.forEach(function(error) {
            req.flash("errors", error)
        })
        req.session.save(function() {
            res.redirect("/create-post")
        })
    })  
}

exports.viewSingle = async function(req,res){
    Post.findSingleById(req.params.id, req.visitorId).then((post) => {
        res.render('../views/single-post-screen', {post: post})
    }).catch(() => {
        res.render('404')
    }) 
}

exports.viewEditScreen = function(req,res){
    Post.findSingleById(req.params.id, req.visitorId).then(function(post) {
        if(post.isVisitorOwner){
            res.render('edit-post', {post: post})
        }
        else {
            req.flash("errors", "You do not have permission to perform that action")
            req.session.save(function(){
                res.redirect("/")
            })
        }
    }).catch(function() {
        res.render('404')
    })
    
}

exports.edit = function(req, res){
    let post = new Post(req.body, req.visitorId, req.params.id)
    post.update().then(function(status) {
        //Post was successfully updated in database 
        // Or there were validation errors
        if(status == "success"){
            // Post Updated in Database
            req.flash("success", "Post Successfully Updated")
            req.session.save(function() {
                res.redirect(`/post/${req.params.id}/edit`)
            })
        }
        else {
            //There were Validation errors
            post.errors.forEach(function(error) {
                req.flash("errors", error)
            })
            req.session.save(function() {
                res.redirect(`/post/${req.params.id}/edit`)
            })
        }
    }).catch(function() {
        //Post Does not exist
        //Visitor is not owner 
        req.flash("errors", "You do not have enough permissions to perform that action.")
        req.session.save(function() {
            res.redirect("/")
        })
    })
}