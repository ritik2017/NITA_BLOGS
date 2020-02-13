const userCollection = require('../db').db().collection('users')
const validator = require('validator')
const bcrypt = require('bcrypt')
const md5 = require('md5')

let User = function(data) {
    this.data = data
    this.errors = []
}

User.prototype.validate = function(){
    return new Promise(async (resolve,reject) => {
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
        if(this.data.password.length > 50){
            this.errors.length.push("Password cannot be greater than 100 characters")
        }
        if(this.data.username.length > 30){
            this.errors.push("Username cannot be greater than 30 characters")
        }
    
        // Check if Username is already taken
        if(this.data.username.length >= 5 && this.data.username.length <= 30 && validator.isAlphanumeric(this.data.username)) {
            let usernameExists = await userCollection.findOne({username: this.data.username})
            if(usernameExists){
                this.errors.push("That username is alrady taken")
            }
        }
        if(validator.isEmail(this.data.email)) {
            let emailExists = await userCollection.findOne({email: this.data.email})
            if(emailExists){
                this.errors.push("That email is already used")
            }
        }
        resolve()
    })
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
    return new Promise(async (resolve, reject) => {
        // Validate User Data
        this.cleanUp()
        await this.validate()
        // If Validation Successful then save user data in a database
        if(!this.errors.length){
            // Hash user Password
            let salt = bcrypt.genSaltSync(10)
            this.data.password = bcrypt.hashSync(this.data.password, salt)
            await userCollection.insertOne(this.data) 
            this.getAvatar()
            resolve()
        }    
        else {
            reject(this.errors)
        }
    })
}

// Login Functionality
User.prototype.login = function(resolve,reject){
    return new Promise((resolve,reject) => {
        this.cleanUp()
        userCollection.findOne({username: this.data.username}).then((attemptedUser) => {
                if(attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password)){
                    this.data.email = attemptedUser.email
                    this.getAvatar()
                    resolve("Congrats!")
                }
                else {
                    reject("Invalid Username or Password")
                }
        }).catch(() => {
            reject("Please try after some time")
        })
    })
}

User.prototype.getAvatar = function(){
    this.avatar = `https://gravatar.com/avatar/${md5(this.data.email)}?s=128`
} 

module.exports = User