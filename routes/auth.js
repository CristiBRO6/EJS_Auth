const express = require('express');
const path = require('path');
const router = express.Router();
const passport = require('passport');
const multer = require('multer');

const { authenticateUser } = require("../utils/authUtils");
const authControler = require('../controllers/auth');

const storage = multer.diskStorage({
    destination: (req, file, done) => {
        done(null, path.join(__dirname, '../public/uploads'));
    },
    filename: (req, file, done) => {
        done(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

// AUTHENTICATION WITH GOOGLE

require('../controllers/google');

router.get('/google', (req, res, next) => {
    const isLinkingAccount = req.query.link === 'true';
    req.session.isLinkingAccount = isLinkingAccount;
    req.session.returnTo = req.headers.referer || '/';

    passport.authenticate('google', { scope: ['email', 'profile'] })(req, res, next);
});
router.get('/google/callback', (req, res) => {
    passport.authenticate('google', {
        failureRedirect: '/login'
    }, (err, user) => {
        const isLinkingAccount = req.session.isLinkingAccount;
        const redirectTo = req.session.returnTo || '/';
        delete req.session.isLinkingAccount;
        delete req.session.returnTo;

        if (err) {
            req.flash('error', err || 'Authentication with Google failed');
            return res.redirect('/login');
        }

        if (!user) {
            req.flash('error', 'Authentication with Google failed');
            return res.redirect('/login');
        }
        
        if(!isLinkingAccount) authenticateUser(res, user);
        return res.redirect(redirectTo);
    })(req, res);
});

// AUTHENTICATION WITH FACEBOOK

require('../controllers/facebook');

router.get('/facebook', (req, res, next) => {
    const isLinkingAccount = req.query.link === 'true';
    req.session.isLinkingAccount = isLinkingAccount;
    req.session.returnTo = req.headers.referer || '/';

    passport.authenticate('facebook', { scope: 'email' })(req, res, next);
});
router.get('/facebook/callback', (req, res) => {
    passport.authenticate('facebook', {
        failureRedirect: '/login'
    }, (err, user) => {
        const isLinkingAccount = req.session.isLinkingAccount;
        const redirectTo = req.session.returnTo || '/';
        delete req.session.isLinkingAccount;
        delete req.session.returnTo;

        if (err) {
            req.flash('error', err || 'Authentication with Google failed');
            return res.redirect('/login');
        }

        if (!user) {
            req.flash('error', 'Authentication with Google failed');
            return res.redirect('/login');
        }
        
        if(!isLinkingAccount) authenticateUser(res, user);
        return res.redirect(redirectTo);
    })(req, res);
});

// LOGIN AND REGISTER
router.post('/register', authControler.register);
router.post('/login', authControler.login);

// EMAIL VERIFICATION
router.post('/email-verification', authControler.emailVerification);

// FORGOT PASSWORD
router.post('/forgot-password', authControler.forgotPassword);

// RESET PASSWORD
router.post('/reset-password', authControler.resetPassword);

// CHANGE AVATAR
router.post('/change-avatar', upload.single('avatar'), authControler.changeAvatar);

// UPDATE PROFILE
router.post('/update-profile', authControler.updateProfile);

// CHANGE PASSWORSD
router.post('/change-password', authControler.changePassword);

// LOGOUT
router.get('/logout', authControler.logout);

module.exports = router;