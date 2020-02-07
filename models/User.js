const userCollection = require('../db').collection('users')
const validator = require('validator')

let User = function(data) {
    this.data = data
    this.errors = []
}

User.prototype.validate = function() {
    if(this.data.username == "") { 
        this.errors.push("You must provide an username") 
    }
    if(this.data.username != "" && !validator.isAlphanumeric(this.data.username)){
        this.errors.push("Username can contain only alphabets and numbers")
    }
    if(this.data.password == "") { 
        this.errors.push("You must provide a password")
    }
    if(!validator.isEmail(this.data.email) ) { 
        this.errors.push("You must provide a valid email address")
    }
    if(this.data.password.length > 0 && this.data.password.length < 8){
        this.errors.push("The password must be atleast 8 characters long")
    }
    if(this.data.username.length > 0 && this.data.username < 5) {
        this.errors.push("The username must be atleast 5 characters long")
    }
    if(this.data.password.length > 100){
        this.errors.length.push("Password cannot be greater than 100 characters")
    }
    if(this.data.username.length > 30){
        this.errors.push("Username cannot be greater than 30 characters")
    }
}

User.prototype.cleanUp = function(){
    if(typeof(this.data.username) != "string") {this.data.username = ""}
    if(typeof(this.data.password) != "string") {this.data.password = ""}
    if(typeof(this.data.email) != "string") {this.data.email = ""}

    this.data = {
        username: this.data.username.trim().toLowerCase(),
        email: this.data.email.trim().toLowerCase(),
        password: this.data.password
    }
}

User.prototype.register = function() {
    // Validate User Data
    this.cleanUp()
    this.validate()
    // If Validation Successful then save user data in a database
    if(!this.errors.length){
        userCollection.insertOne(this.data) 
    }    
}

// Login Functionality
User.prototype.login = function(resolve,reject){
    return new Promise((resolve,reject) => {
        this.cleanUp()
        userCollection.findOne({username: this.data.username}).then((attemptedUser) => {
                if(attemptedUser && attemptedUser.password == this.data.password){
                    resolve("congrats")
                }
                else {
                    reject("Invalid Username or Password")
                }
        }).catch(() => {
            reject("Please try after some time")
        })
    })
}

module.exports = User