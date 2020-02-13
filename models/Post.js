const postCollection = require('../db').db().collection("posts")
const ObjectID = require('mongodb').ObjectID

let Post = function(data, userid) {
    this.data = data
    this.errors = []
    this.userid = userid
}

Post.prototype.cleanUp = function() {
    if(typeof(this.data.title) != "string") {this.data.title = ""}
    if(typeof(this.data.body) != "string") {this.data.body = ""}

    // Get Rid of any bogus properties
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
        }else {
            reject(this.errors)
        }
    })
}

module.exports = Post