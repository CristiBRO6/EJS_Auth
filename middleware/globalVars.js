const rolesList = require('../config/rolesList');
const { linkedAccounts } = require('./accountStatus');

const globalVars = async (req, res, next) => {
    res.locals.rolesList = rolesList;
    res.locals.flashes = req.flash();
    res.locals.user = req.user || null;

    await linkedAccounts(req, res, next);

    next();
};

module.exports = globalVars;
