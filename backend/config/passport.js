// config/passport.js
// Passport.js Google OAuth 2.0 Strategy Configuration

const passport      = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User          = require('../models/User');

// ── Configure Google Strategy ─────────────────────────────────────────────────
passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  process.env.GOOGLE_CALLBACK_URL,

      // Pass the request to the callback so we can check for existing sessions
      passReqToCallback: true
    },

    // ── Verify Callback ─────────────────────────────────────────────────────
    // Called after Google authenticates the user
    // profile = the user's Google profile data
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Extract useful info from Google profile
        const googleId    = profile.id;
        const email       = profile.emails?.[0]?.value?.toLowerCase();
        const name        = profile.displayName;
        const avatar      = profile.photos?.[0]?.value || '';

        if (!email) {
          return done(
            new Error('No email found in Google profile'),
            null
          );
        }

        // ── Step 1: Check if user already linked Google account ─────────────
        let user = await User.findOne({ googleId });

        if (user) {
          // User has logged in with Google before. Refresh the Google avatar URL
          // without touching profilePicture, which stores a custom uploaded image.
          if (avatar && user.avatar !== avatar) {
            user.avatar = avatar;
            user.authProvider = 'google';
            await user.save({ validateBeforeSave: false });
          }

          return done(null, user);
        }

        // ── Step 2: Check if email already exists (local account) ───────────
        user = await User.findOne({ email });

        if (user) {
          // Email exists but no googleId — link the accounts
          user.googleId     = googleId;
          user.avatar       = avatar || user.avatar;
          user.authProvider = 'google';
          await user.save({ validateBeforeSave: false });

          return done(null, user);
        }

        // ── Step 3: New user — create account automatically ─────────────────
        user = await User.create({
          googleId,
          name,
          email,
          avatar,
          role:         'student',    // Default role for OAuth users
          authProvider: 'google',
          // No password for Google users
        });

        // Send welcome email (don't block)
        try {
          const { sendWelcomeEmail } = require('../utils/emailService');
          await sendWelcomeEmail({ toEmail: email, userName: name });
        } catch (emailErr) {
          console.error('Welcome email failed:', emailErr.message);
        }

        return done(null, user);

      } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, null);
      }
    }
  )
);

// ── Serialize / Deserialize ───────────────────────────────────────────────────
// These are required by Passport but we use JWT not sessions
// So we just pass the user ID through

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;