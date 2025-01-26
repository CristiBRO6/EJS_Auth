const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User, UserLink } = require('../models');

const time = Date.now();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/callback",
    passReqToCallback: true
},
async (req, accessToken, refreshToken, profile, done) => {
    try {
        const account_id = profile.id;
        const isLinkingAccount = req.session.isLinkingAccount;

        const userAccounts = await UserLink.findOne({
            where: {
                provider: 'google',
                providerAccountId: account_id,
                removed: 0
            }
        });

        if (isLinkingAccount) {
            if (userAccounts) return done("This Google account is already linked to another user", null);

            const loggedInUser = req.user;
            if (!loggedInUser) return done("You need to be logged in to link accounts", null);

            await UserLink.create({
                user_id: loggedInUser.id,
                provider: 'google',
                providerAccountId: account_id,
                time: time
            });

            return done(null, loggedInUser.id);
        } else {
            if(userAccounts) return done(null, userAccounts.user_id);

            const email = profile.emails[0].value;

            const user = await User.findOne({ where: { email } });

            if (user) {
                const user_id = user.id;

                const userAccounts = await UserLink.findOne({
                    where: {
                        user_id,
                        provider: 'google',
                        removed: 0
                    }
                });

                if(userAccounts) return done(null, user.id);
                return done("Account already linked with another user", null);
            }        

            const name = profile.displayName;
            const avatar = profile.photos[0].value;

            const userDB = await User.create({
                verified: 1,
                name,
                email,
                avatar,
                time
            });

            const user_id = userDB.id;

            await UserLink.create({
                user_id,
                provider: 'google',
                providerAccountId: account_id,
                time
            });

            return done(null, user_id);
        }
    } catch (err) {
        return done(err, false);
    }
}
));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser(async (user, done) => {
    done(null, user);
});
