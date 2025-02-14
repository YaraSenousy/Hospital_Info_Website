const express = require('express');
const router = express.Router();
const userController = require('../controllers/user_controller');
const verifyRole = require('../middlewares/verifyRole');
const verifyToken = require('../middlewares/verifyToken');


module.exports = router;
