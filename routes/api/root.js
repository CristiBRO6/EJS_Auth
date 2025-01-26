const express = require('express');
const router = express.Router();

const authMiddleware = require('../../middleware/authMiddleware');

router.get('/users', authMiddleware.requireAuth('/login'), (req, res) => {
    res.status(200).send("api/users");
});

router.get('/user/:id', authMiddleware.requireAuth('/login'), (req, res) => {
    const id = req.params.id;

    res.status(200).send("api/user/" + id);
});

module.exports = router;