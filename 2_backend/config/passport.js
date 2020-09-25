var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GitHubStrategy = require('passport-github').Strategy;

var mongoose = require('mongoose');
var User = mongoose.model('User');
var socialKeys = require('./credentials/credentials.json');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => {
      done(null, user);
    })
    .catch(error => {
      console.log(`Error: ${error}`)
    })
})

passport.use(new LocalStrategy({
  usernameField: 'user[email]',
  passwordField: 'user[password]'
}, function(email, password, done) {
  User.findOne({email: email}).then(function(user){
    if(!user || !user.validPassword(password)){
      return done(null, false, {errors: {'email or password': 'is invalid'}});
    }

    return done(null, user);
  }).catch(done);
}));

passport.use(new GitHubStrategy({
  clientID: socialKeys.GITHUB_CLIENT_ID,
  clientSecret: socialKeys.GITHUB_CLIENT_SECRET,
  callbackURL: socialKeys.GITHUB_CALLBACK,
  passReqToCallback: true,
},

function(request, accessToken, refreshToken, profile, done) {
  User.findOne({ idsocial: profile.id.toString()}, function(err, user) {
    console.log("====================================");
    if(err)
    return done(err);

    if(user) {
      console.log("Tenemos usuario");
      return done(null, user);
    }
    else {
      console.log("En el else (No tenemos usuario)");

      if(!profile.emails[0].value) {
      console.log("No tenemos email");

        return done("The email is private")
      }

      else {
        console.log("Vamos a crear un usuario");
        console.log("PROFILEEEEEEEEEEEEEE");
        console.log(profile);
        var user1 = new User({
          idsocial: profile.id,
          username: profile.username,
          type: "client",
          email: profile.emails[0].value,
          image: profile.photos[0].value
        });
        console.log("USEEEERRRRR");
        console.log(user1);
        

        user1.save(function(err) {
          if(err) {
            console.log(err);
            return done(null, user1);
          }else {
            console.log("correctotootototootototootto");
          }
        });
      }
    }
  });
}
));

