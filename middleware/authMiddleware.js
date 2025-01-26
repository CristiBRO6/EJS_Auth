const jwt = require("jsonwebtoken");
const authUtils = require("../utils/authUtils");

const { User } = require('../models');

const createAccessToken = authUtils.createAccessToken;
const setCookie = authUtils.setCookie;

const checkIsAutentificate = async (req, res) => !!req.user;

const requireAuth = (redirectRoute) => async (req, res, next) => {
    if (await checkIsAutentificate(req, res)) return next();
    return res.status(401).redirect(redirectRoute);
};

const checkIsLoggedOut = (redirectRoute) => async (req, res, next) => {
    if (await checkIsAutentificate(req, res)) return res.status(401).redirect(redirectRoute);
    return next()
};

const verifyToken = (token, secret) => {
    try {
        return jwt.verify(token, secret);
    } catch (err) {
        return null;
    }
};

const checkUser = async (req, res, next) => {
    const { accessToken, refreshToken } = req.cookies;

    req.user = null;

    if (!accessToken && !refreshToken) return next();

    if(!refreshToken || !verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET)){
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        return next();
    }

    if (!accessToken || !verifyToken(accessToken, process.env.ACCESS_TOKEN_SECRET)) {
        try {
            const decoded = verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            const user_id = decoded.user_id;

            const newAccessToken = createAccessToken(user_id);
            setCookie(res, 'accessToken', newAccessToken, process.env.ACCESS_TOKEN_MAX_AGE);

            req.cookies.accessToken = newAccessToken;
        } catch (err) {
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            return next();
        }
    }

    const token = req.cookies.accessToken;

    if (!token) return next();

    try {
        const decoded = verifyToken(token, process.env.ACCESS_TOKEN_SECRET);
        const user_id = decoded.user_id;

        const user = await User.findOne({ where: { id: user_id } });

        if (!user || !user.verified) {
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            return next();
        }

        req.user = user;
    } catch (err) {
        console.error(err);
        
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        return next();
    }

    return next();
};

module.exports = { requireAuth, checkIsLoggedOut, checkUser };
