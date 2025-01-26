const { EmailVerification, UserPasswordReset } = require('../models');

exports.home = async (req, res) => {
    res.render('index');
};

exports.profile = async (req, res) => {
    res.render('profile');
};

exports.login = async (req, res) => {
    res.render('login');
};

exports.register = async (req, res) => {
    res.render('register');
};

exports.forgot_password = async (req, res) => {
    res.render('forgot-password');
};

exports.email_verification = async (req, res) => {
    const token = req.params.token;

    const checkEmailVerification = await EmailVerification.findOne({
        where: {
            token: token,
            used: 0,
            removed: 0
        }
    });

    if (!checkEmailVerification) return res.status(401).redirect('/');

    req.session.email_verification_token = token;

    res.render('email-verification');
};

exports.reset_password = async (req, res) => {
    const token = req.params.token;

    const checkResetPassword = await UserPasswordReset.findOne({
        where: {
            token: token,
            used: 0,
            removed: 0,
            [Sequelize.Op.or]: [
                { expire: -1 },
                { expire: { [Sequelize.Op.gt]: Date.now() } }
            ]
        }
    });

    if(!checkResetPassword) return res.status(401).redirect('/');

    req.session.reset_password_token = token;

    res.render('reset-password');
};

exports.login = async (req, res) => {
    res.render('login');
};
