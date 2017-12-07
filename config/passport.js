var LocalStrategy = require('passport-local').Strategy

//load user model
var User = require('../models/user');

module.exports = function(passport) {

    //////////////////////////
    //PASSPORT Session Setup//
    /////////////////////////

    //required for persistent login sessions
    //passport needs ability to serialize and unserialize users out of session
    

    //used to serialize user for the session
    passport.serializeUser(function(user, done) {
        console.log("passport serializeUser");
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        console.log("passport deserializeUser");
        
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    //=========================  LOCAL SIGNUP  ===========================

    passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        nickname: 'nickname',
        passReqToCallback: true
    },

    function(req, email, password, done) {
        //async
        //User.findOne won't fire unless data is sent back.
        console.log("passport about to execut passed function");
        console.log("passport req.body.nickname", req.body.nickname);
        console.log("passport email", email);
        console.log('passport password', password);
        //console.log('passport nickname', nickname)
        
        process.nextTick(function() {
            //find the user who has email sent by form
            User.findOne({'local.email': email}, function(err, user) {
                console.log("passport User.findOne return");
                console.log("user", user);
                console.log("err", err)
                
                if(err) {
                    console.log("passport User.findOne error returned", err);
                    return done(err);
                }
                console.log("about to check user")
                if(user) {
                    return done(null, false, req.flash('signupMessage', 'That email is already in use'));
                } else {
                    
                    console.log('no existing user else')                    
                    //if there is no user with the email create one
                    var newUser = new User();
                    //set the user's local creds
                    console.log('setting email')
                    newUser.local.email = email;
                    console.log('setting pw')
                    newUser.local.password = newUser.generateHash(password);
                    newUser.local.nickname = req.body.nickname;

                    //save the user
                    console.log("about to save new user")
                    newUser.save(function(err) {
                        if(err) {
                            throw err;
                        }
                        return done(null, newUser);
                    });
                }
            });
        });
    }));

     //=========================  LOCAL Login  =======================

    passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true

    },
    function(req, email, password, done){ //callback with email and password from our form
        //find a user whose email is the same as the forms email
        //we ar checking if the user is trying to login exists
        console.log("Passport.js Local Loging about to find one")
        User.findOne({'local.email' : email}, function(err, user){
            console.log("Passport.js local login after findOne user", user);
            if(err) {
                return done(err);
            }
            //if no user found return the message
            if(!user) {
                return done(null, false, req.flash('loginMessage', 'No user found'));
            }
            
            // if the user is found but the password wrong
            if(!user.validPassword(password)){

                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password'));
            }
            //user and password found correct
            return done(null, user);
        });
    }));
}