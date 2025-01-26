const express = require('express');
const router = express.Router();

const rootControler = require('../controllers/root');
const { requireAuth, checkIsLoggedOut } = require('../middleware/authMiddleware');

// USERS PAGES

router.get(['/', '/home'], requireAuth('/login'), rootControler.home);
router.get('/profile', requireAuth('/login'), rootControler.profile);

// AUTH PAGES

router.get('/login', checkIsLoggedOut('/'), rootControler.login);
router.get('/register', checkIsLoggedOut('/'), rootControler.register);
router.get('/forgot-password', checkIsLoggedOut('/'), rootControler.forgot_password);
router.get('/email-verification/:token', rootControler.email_verification);
router.get('/reset-password/:token', rootControler.reset_password);

module.exports = router;