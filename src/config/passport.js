
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const mongoose = require('mongoose');
const User = require('../models/User');

module.exports = function (passport) {
  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user has email
          if (!profile.emails || !profile.emails.length) {
            return done(new Error('No email found in Google profile'), null);
          }

          const newUser = {
            oauthId: profile.id,
            email: profile.emails[0].value,
            oauthProvider: 'google',
          };

          let user = await User.findOne({ oauthId: profile.id });

          if (user) {
            return done(null, user);
          } else {
            // Check if user with same email exists
            const existingUser = await User.findOne({ email: newUser.email });
            if (existingUser && existingUser.oauthProvider !== 'google') {
              return done(new Error('Email already registered with another method'), null);
            }

            user = await User.create(newUser);
            return done(null, user);
          }
        } catch (err) {
          console.error('Google OAuth Error:', err);
          return done(err, null);
        }
      }
    )
  );

  // GitHub OAuth Strategy
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID || 'your-github-client-id',
        clientSecret: process.env.GITHUB_CLIENT_SECRET || 'your-github-client-secret',
        callbackURL: process.env.GITHUB_CALLBACK_URL || '/api/auth/github/callback',
        scope: ['user:email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user has email
          if (!profile.emails || !profile.emails.length) {
            return done(new Error('No email found in GitHub profile'), null);
          }

          const newUser = {
            oauthId: profile.id,
            email: profile.emails[0].value,
            oauthProvider: 'github',
          };

          let user = await User.findOne({ oauthId: profile.id });

          if (user) {
            return done(null, user);
          } else {
            // Check if user with same email exists
            const existingUser = await User.findOne({ email: newUser.email });
            if (existingUser && existingUser.oauthProvider !== 'github') {
              return done(new Error('Email already registered with another method'), null);
            }

            user = await User.create(newUser);
            return done(null, user);
          }
        } catch (err) {
          console.error('GitHub OAuth Error:', err);
          return done(err, null);
        }
      }
    )
  );

  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};
