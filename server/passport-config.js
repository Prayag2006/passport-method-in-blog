const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcrypt');
const User = require('./models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';

function initialize(passport) {
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await User.findOne({
          $or: [{ username }, { email: username }]
        });
        
        if (!user) {
          return done(null, false, { message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Invalid password' });
        }
      } catch (error) {
        return done(error);
      }
    })
  );

  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET,
  };

  passport.use(
    new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
      try {
        return done(null, jwt_payload);
      } catch (error) {
        return done(error, false);
      }
    })
  );
}

module.exports = initialize;



