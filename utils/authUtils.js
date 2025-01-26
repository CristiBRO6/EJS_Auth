const jwt = require('jsonwebtoken');

const authenticateUser = (res, user_id) => {
    const accessToken = createAccessToken(user_id);
    const refreshToken = createRefreshToken(user_id);

    setCookie(res, 'accessToken', accessToken, process.env.ACCESS_TOKEN_MAX_AGE);
    setCookie(res, 'refreshToken', refreshToken, process.env.REFRESH_TOKEN_MAX_AGE);
};

const createAccessToken = (user_id) => {
    return jwt.sign({ user_id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.EXPIRE_ACCESS_TOKEN_SECRET
    });
};

const createRefreshToken = (user_id) => {
    return jwt.sign({ user_id }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.EXPIRE_REFRESH_TOKEN_SECRET
    });
};

const setCookie = (res, name, value, maxAge) => {
    res.cookie(name, value, { 
        httpOnly: true,
        sameSite: 'None',
        secure: true,
        maxAge: maxAge * 1000 
    });
};

const validateEmail = (email) => {
    const patternEmail = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    if (email.match(patternEmail)) return true;
    return false;
}

const validatePassword = (password) => {
    const patternPassword = /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*_-])[a-zA-Z0-9!@#$%^&*_-]{8,}$/;

    if (password.match(patternPassword)) return true;
    return false;
}

module.exports = { authenticateUser, createAccessToken, createRefreshToken, setCookie, validateEmail, validatePassword };