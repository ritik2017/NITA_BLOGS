const postCollection = require('../db').db().collection("posts")
const ObjectID = require('mongodb').ObjectID
const User = require('./User')

let Post = function(data, userid) {
    this.data = data
    this.errors = []
    this.userid = userid
}

Post.prototype.cleanUp = function() {
    if(typeof(this.data.title) != "string") {this.data.title = ""}
    if(typeof(this.data.body) != "string") {this.data.body = ""}

    // Getting Rid of any bogus properties
    this.data = {
        title: this.data.title,
        body: this.data.body,
        createdDate: new Date(),
        author: ObjectID(this.userid)
    }
}

Post.prototype.validate = function() {
    if(this.data.title.length == 0) {
        this.errors.push("You must provide a blog title")
    }
    if(this.data.body.length == 0) {
        this.errors.push("You must provide a blog body")
    }
}

Post.prototype.create = function() {
    return new Promise((resolve, reject) => {
        this.cleanUp()
        this.validate()
        if(!this.errors.length) {
            // Save Blogs in Database
            postCollection.insertOne(this.data).then(() => {
                resolve()
            }).catch((error) => {
                this.errors.push("Please try creating blog after some time")
            })
        } else {
            reject(this.errors)
        }
    })
}

Post.reusagePostQuery = function(uniqueOperations) {
    return new Promise(async function(resolve, reject) {
        let aggOperations = uniqueOperations.concat([
        {$lookup: {from: "users", localField: "author", foreignField: "_id",
        as: "authorDocument"}},
        {$project: {
           title: 1,
           body: 1,
           createdDate: 1,
           author: {$arrayElemAt: ["$authorDocument", 0]}
        }}])
        let posts = await postCollection.aggregate(aggOperations).toArray()

        //Clean the author property of posts
        posts.map(function(post){
            post.author = {
                username: post.author.username,
                avatar: new User(post.author, true).avatar
            }
            return post
        })
        resolve(posts)
    })
}

Post.findSingleById = function(id) {
    return new Promise(async function(resolve, reject) {
        if(typeof(id) != "string" || !ObjectID.isValid(id)) {
            reject()
            return
        }
        
        let posts = await Post.reusagePostQuery([
            {$match: {_id: new ObjectID(id)}}
        ])
        
        if(posts.length) {
            console.log(posts[0])
            resolve(posts[0])
        }
        else {
            reject()
        }
    })
}

Post.findByAuthorId = function(authorid) {
    return Post.reusagePostQuery([
        {$match: {author: authorid}},
        {$sort: {createdDate: -1}}
    ])
}

module.exports = Post