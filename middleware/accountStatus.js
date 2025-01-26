const { UserLink } = require('../models');

const linkedAccounts = async (req, res, next) => {
    if (!req.user) return res.locals.linkedAccounts = {};

    try {
        const user_id = req.user.id;
        const linkedAccounts = {};

        const googleAccount = await UserLink.findOne({
            where: {
                user_id: user_id,
                provider: 'google',
                removed: 0
            }
        });
        linkedAccounts.google = googleAccount;

        const facebookAccount = await UserLink.findOne({
            where: {
                user_id: user_id,
                provider: 'facebook',
                removed: 0
            }
        });
        linkedAccounts.facebook = facebookAccount;

        res.locals.linkedAccounts = linkedAccounts;
    } catch (err) {
        console.error(err);
        res.locals.linkedAccounts = {};
    }
};

module.exports = { linkedAccounts };
