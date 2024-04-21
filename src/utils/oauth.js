const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const prismaClient = require('./prisma.js');
const bcrypt = require('bcrypt');

require('dotenv').config();

passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback"
    },
    async function (accessToken, refreshToken, profile, cb) {
        try {
            let user = await prismaClient.user.findUnique({where: {email: profile.emails[0].value}});
            if (!user) {
                const hashedPassword = await bcrypt.hash(profile.id, 10);

                user = await prismaClient.user.create({
                    data: {
                        email: profile.emails[0].value,
                        name: profile.name.givenName + " " + profile.name.familyName,
                        password: hashedPassword,
                    }
                });
            }
            return cb(null, user);
        } catch (error) {
            return cb(error);
        }
    }
));
passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(async function (obj, cb) {
    cb(null, obj);
});

module.exports = passport;