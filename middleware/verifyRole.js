const verifyRole = (...allowedRoles) => {
    return (req, res, next) => {
        if(!req.user) return res.status(404).render('404');

        const arrayRoles = [...allowedRoles];
        const result = arrayRoles.includes(req.user.role);

        if(!result) return res.status(404).render('404');
        next();
    }
}

module.exports = verifyRole;