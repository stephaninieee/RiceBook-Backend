const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const schema = require("./schema");
const User = mongoose.model("user", schema.userSchema);
const Profile = mongoose.model("profile", schema.profileSchema);
const { cookieKey, sessionUser} = require('./auth')
const md5 = require("md5");

const bcrypt = require("bcrypt");
const saltRounds = 10;

let username = " ";

const mySecretMessage = "mysecretmessage";

const generateSessionKey = (username) => {
  return md5(mySecretMessage + new Date().getTime() + username);
};

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

/*passport.deserializeUser(function(user, done) {
    done(null, user);
});*/
passport.deserializeUser((id, done) => {
  User.findById(id)
    .then((user) => done(null, user))
    .catch((err) => done(err));
});

passport.use(
  new GoogleStrategy(
    {
      clientID:
        "109087866520-q7mavokrs0m9b8q6t6p504vkumfmb0gq.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "https://mysocialserver-626bbb68c54b.herokuapp.com/auth/google/callback",
    },
    //function(accessToken, refreshToken, profile, done) {
    //let user = {
    /*'email': profile.emails[0].value,
            'name' : profile.name.givenName + ' ' + profile.name.familyName,
            'id'   : profile.id,*/
    //'token': accessToken
    // };
    // You can perform any necessary actions with your user at this point,
    // e.g. internal verification against a users table,
    // creating new user entries, etc.

    //eturn done(null, user);
    // User.findOrCreate(..., function(err, user) {
    //     if (err) { return done(err); }
    //     done(null, user);
    // });
    async function (accessToken, refreshToken, profile, done) {
      try {
        let user = await User.findOne({ username: profile.emails[0].value });

        if (!user) {
          let newUser = new User({
            username: profile.displayName,
            email: profile.emails[0].value,
            googleAuth: true,
          });
          let createdProfile = new Profile({
            username: profile.displayName,
            email: profile.emails[0].value,
            phone: "000-000-0000",
            zipcode: "00000",
            dob: "2000-01-01",
            avatar: profile.photos[0].value,
          });
          //let sid = md5(new Date().getTime());

          const sessionKey = generateSessionKey(newUser.username);
          console.log('sessionUser', sessionUser);
          console.log('newUser.username', newUser.username);
          sessionUser[sessionKey] = newUser.username;
          /*res.cookie(cookieKey, sessionKey, {
            maxAge: 3600 * 1000,
            httpOnly: true,
            sameSite: "None",
            secure: true,
          });*/ 


          await newUser.save();
          await createdProfile.save();
          console.log("hiiere");
          return done(null, newUser);
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);
// Redirect the user to Google for authentication.  When complete,
// Google will redirect the user back to the application at
//     /auth/google/callback
//app.get('/auth/google', passport.authenticate('google',{ scope: ['https://www.googleapis.com/auth/plus.login'] })); // could have a passport auth second arg {scope: 'email'}

// Google will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
//app.get('/auth/google/callback',
//    passport.authenticate('google', { successRedirect: 'https://rc118-ricebook.surge.sh/login',
//        failureRedirect: 'https://rc118-ricebook.surge.sh/login' }));

//express endpoints would normally start hereç

// Get the port from the environment, i.e., Heroku sets it
/*const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
     const addr = server.address();
     console.log(`Server listening at http://${addr.address}:${addr.port}`)
});*/

module.exports = (app) => {
  // Redirect the user to Google for authentication.  When complete,
  // Google will redirect the user back to the application at
  //     /auth/google/callback
  app.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["https://www.googleapis.com/auth/plus.login", "email", "profile"],
    })
  ); // could have a passport auth second arg {scope: 'email'}

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: "https://rc118-ricebook.surge.sh/login",
    }),
    function (req, res) {
      if (req.user) {
        sid = req.cookies[cookieKey];
        username = req.user.username;
        console.log("Google profile data:", req.user);
        console.log("callback username", username);
        res.redirect(`https://rc118-ricebook.surge.sh/googleauth`);
      } else {
        res.redirect(`https://rc118-ricebook.surge.sh/login `);
      }
    }
  );
  app.get("/oauth_success",
    (req, res) => {
      console.log("username", username);
      if (username != " ") {
        const sessionKey = generateSessionKey(username);
        sessionUser[sessionKey] = username;

        res.cookie(cookieKey, sessionKey, {
          maxAge: 3600 * 1000,
          httpOnly: true,
          sameSite: "None",
          secure: true,
        });
        res.send({ result: "success", username });
        //res.send({ username: username, result: "success" });
      }
    });
};
