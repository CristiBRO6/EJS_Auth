const { User, EmailVerification, UserPasswordReset } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require("bcrypt");

const { authenticateUser, createAccessToken, createRefreshToken, setCookie, validateEmail, validatePassword } = require("../utils/authUtils");
const { sendMail, generateEmailHTML } = require('../utils/mailer');

const generateRandomHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
const generateCode = (min, max) => Math.floor(Math.random() * (max - min) + min);

const time = Date.now();

exports.register = async (req, res) => {
    const { name, email, password, confirm_password } = req.body;
    if(!name || !email || !password || !confirm_password) return res.status(400).json({ "status": false, "message": "Please fill the fields" });
    if(!validateEmail(email)) return res.status(401).send({ "status": false, "message": 'Invalid Email' });
    if(password != confirm_password) return res.status(401).json({ "status": false, "message": 'Passwords do not match' });
    if(!validatePassword(password)) return res.status(401).json({ "status": false, "message": 'The password must have at least 8 characters, an uppercase letter, a lowercase letter, a number and a symbol' });

    try {
        const emailExists = await User.findOne({ where: { email: email } });
        if (emailExists) return res.status(401).send({ "status": false, "message": "The email address entered already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name,
            email: email,
            password: hashedPassword,
            time: time
        });

        const user_id = user.id;

        const token = generateRandomHex(32);
        const code = generateCode(100000, 1000000);

        await EmailVerification.create({
            user_id: user_id,
            token: token,
            code: code,
            time: time
        });

        const subject = 'Account Verification Code';
        const html = generateEmailHTML(
            'Account Verification',
            `<p>Your account verification code is:</p>
            <h3><b>${code}</b></h3>`,
            true,
            'Verify Account',
            `${req.protocol}://${req.get('host')}/email-verification/${token}`
        );

        const mailSent = await sendMail(email, subject, html);

        if (!mailSent) return res.status(400).json({ "status": false, "message": "Failed to send verification email" });

        res.status(200).json({ "status": true, "message": "User successfully registered", "redirect_url": '/email-verification/' + token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ "status": false, "message": "Internal Server Error" });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    const cookies = req.cookies;

    if(cookies.refreshToken) return res.status(409).json({ "status": false, "message": "You are already logged in" });
    if(!email || !password) return res.status(400).json({ "status": false, "message": "Please fill the fields" });

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) return res.status(401).send({ "status": false, "message": 'Email or password do not match' });
        if(!await bcrypt.compare(password, user.password)) return res.status(401).send({ "status": false, "message": 'Email or password do not match'});

        let redirect_url = '/';
        const user_id = user.id;

        if(!user.verified){
            const emailVerification = await EmailVerification.findOne({
                where: {
                    user_id: user_id,
                    used: 0,
                    removed: 0
                }
            });

            if(emailVerification) redirect_url = '/email-verification/' + emailVerification.token;
            else{
                const token = generateRandomHex(32);
                const code = generateCode(100000, 1000000);

                await EmailVerification.create({ user_id, token, code, time });

                const subject = 'Account Verification Code';
                const html = generateEmailHTML(
                    'Account Verification',
                    `<p>Your account verification code is:</p>
                    <h3><b>${code}</b></h3>`,
                    true,
                    'Verify Account',
                    `${req.protocol}://${req.get('host')}/email-verification/${token}`
                );

                const mailSent = await sendMail(email, subject, html);

                if (!mailSent) return res.status(400).json({ "status": false, "message": "Failed to send verification email" });

                redirect_url = '/email-verification/' + token;
            }
        }else{
            authenticateUser(res, user_id);
        }

        return res.status(200).json({ "status": true, "message": "Logged successful", "redirect_url": redirect_url});
    } catch (err) {
        console.error(err);
        return res.status(500).json({ "status": false, "message": "Internal Server Error" });
    }
};

exports.emailVerification = async (req, res) => {
    const { code } = req.body;
    const token = req.session.email_verification_token;
    
    if(!token) return res.status(400).json({ "status": false, "message": "Something went wrong, please refresh" });
    if(!code) return res.status(400).json({ "status": false, "message": "Please fill the fields" });
    if(code.length != 6) return res.status(400).json({ "status": false, "message": "The code must have 6 digits" });

    try {
        const emailVerification = await EmailVerification.findOne({
            where: {
                token,
                code,
                used: 0,
                removed: 0,
                [Op.or]: [
                    { expire: -1 },
                    { expire: { [Op.gt]: time } }
                ]
            }
        });

        if(!emailVerification) return res.status(400).json({ "status": false, "message": "The code is incorrect" });

        const user_id = emailVerification.user_id;

        await EmailVerification.update(
            { used: 1 },
            { where: { user_id, token, code } }
        );

        await User.update(
            { verified: 1 },
            { where: { id: user_id } }
        );

        authenticateUser(res, user_id);

        req.session.email_verification_token = null;

        return res.status(200).json({ "status": true, "message": "verification_successful", "redirect_url": "/" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ "status": false, "message": "Internal Server Error" });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    if(!email) return res.status(400).json({ "status": false, "message": "Please fill the fields" });
    if(!validateEmail(email)) return res.status(401).send({ "status": false, "message": 'Invalid Email' });

    try {
        const user = await User.findOne({ where: { emai } });

        if(!user) return res.status(400).json({ "status": false, "message": "This email address do not found" });

        const user_id = user.id;

        await UserPasswordReset.update(
            { removed: 1 },
            { where: { user_id } }
        );
        
        const token = generateRandomHex(32);
        const expire = time + 10 * 60 * 1000;

        await UserPasswordReset.create({ user_id, token, expire, time });

        const subject = 'Reset Password';
        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${token}`;
        const html = generateEmailHTML(
            'Reset Your Password',
            '<p>You have requested to reset your password. Click the button below to reset your password. This link will expire in 10 minutes.</p>',
            true,
            'Reset Password',
            resetUrl
        );

        const mailSent = await sendMail(email, subject, html);

        if (!mailSent) return res.status(400).json({ "status": false, "message": "Failed to send the recovery link due to an error" });

        return res.status(200).json({ "status": true, "message": "A email with recover password link was sent" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ "status": false, "message": "Internal Server Error" });
    }
};

exports.resetPassword = async (req, res) => {
    const { password, confirm_password } = req.body;
    const token = req.session.reset_password_token;

    try {
        if (!token) return res.status(400).json({ "status": false, "message": "Something went wrong, please refresh" });
        if (!password || !confirm_password) return res.status(400).json({ "status": false, "message": "Please fill the fields" });
        if (password !== confirm_password) return res.status(401).json({ "status": false, "message": 'Passwords do not match' });
        if (!validatePassword(password)) return res.status(401).json({ "status": false, "message": 'The password must have at least 8 characters, an uppercase letter, a lowercase letter, a number and a symbol' });

        const forgotPassword = await UserPasswordReset.findOne({
            where: {
                token,
                used: 0,
                removed: 0,
                [Op.or]: [
                    { expire: -1 },
                    { expire: { [Op.gt]: time } }
                ]
            }
        });

        if (!forgotPassword) return res.status(400).json({ "status": false, "message": "The link has expired" });

        const user_id = forgotPassword.user_id;
        const hashedPassword = await bcrypt.hash(password, 10);

        await UserPasswordReset.update(
            { used: 1 },
            { where: { user_id, token } }
        );

        await User.update(
            { password: hashedPassword },
            { where: { id: user_id } }
        );

        authenticateUser(res, user_id);

        const redirect_url = '/';
        req.session.reset_password_token = null;

        return res.status(200).json({ "status": true, "message": "reset_password_successful", "redirect_url": redirect_url });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ "status": false, "message": "Internal Server Error" });
    }
};

exports.changeAvatar = async (req, res) => {
    try {
        const filename = req.file.filename;
        const user_id = req.user.id;

        await User.update(
            { avatar: filename },
            { where: { id: user_id } }
        );
        
        res.status(200).send({ "status": true, "message": 'Avatar uploaded successfully' });
    } catch (error) {
        console.error(err);
        return res.status(500).json({ "status": false, "message": "Internal Server Error" });
    }
};

exports.updateProfile = async (req, res) => {
    const { name } = req.body;
    const user_id = req.user.id;

    if(!name) return res.status(400).json({ "status": false, "message": "Please fill the fields" });

    await User.update(
        { name },
        { where: { id: user_id } }
    );

    return res.status(200).json({ "status": true, "message": "Account details successfully updated" });
};

exports.changePassword = async (req, res) => {
    const { current_password, new_password, confirm_new_password } = req.body;
    const user_id = req.user.id;

    if(!current_password || !new_password || !confirm_new_password) return res.status(400).json({ "status": false, "message": "Please fill the fields" });

    const user = await User.findOne({ where: { id: user_id } });

    if(!await bcrypt.compare(current_password, user.password)) return res.status(401).send({ "status": false, "message": 'Current password do not match'});
    if(new_password != confirm_new_password) return res.status(401).json({ "status": false, "message": 'Passwords do not match' });
    if(!validatePassword(new_password)) return res.status(401).json({ "status": false, "message": 'The password must have at least 8 characters, an uppercase letter, a lowercase letter, a number and a symbol' });

    const hashedPassword = await bcrypt.hash(new_password, 10);

    await User.update(
        { password: hashedPassword },
        { where: { id: user_id } }
    );

    return res.status(200).json({ "status": true, "message": "Password changed successfully" });
};

exports.logout = async (req, res) => {
    req.logout((err) => {
        if (err) return next(err);
        
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        res.redirect('/login');
    });
};