const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user");
const bcrypt = require("bcryptjs");

module.exports = function (passport) {
  passport.use(
    new LocalStrategy({ usernameField: `email` }, async function (
      email,
      password,
      done
    ) {
      try {
        const user = await User.findOne({ _id: email });

        if (!user) {
          return done(null, false, { message: "No user found!" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (validPassword) {
          return done(null, user);
        } else {
          return done(null, false, { message: "Wrong password found!" });
        }
      } catch (e) {
        console.log(e);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
};
