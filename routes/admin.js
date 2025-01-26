const express = require('express');
const router = express.Router();

const rolesList = require('../config/rolesList');
const adminControler = require('../controllers/admin');
const verifyRole = require('../middleware/verifyRole');

router.get('/', verifyRole(rolesList.ADMIN), adminControler.home);

module.exports = router;