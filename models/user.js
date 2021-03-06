var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

//define schema for our users
var userSchema = mongoose.Schema( {
    local           : {
        email       : String,
        password    : String,
        nickname    : String
    },
    facebook        : {
        id          : String,
        token       : String,
        email       : String,
        name        : String
    },
    twitter         : {
        id          : String,
        token       : String,
        displayName : String,
        username    : String
    },
    google          : {
        id          : String,
        token       : String,
        email       : String,
        name        : String
    }

});

//Methods

//generate a hash
userSchema.methods.generateHash = function(password) {
    console.log('user generate hash')
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//check if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

//create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);



