const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor_controller');
const verifyRole = require('../middlewares/verifyRole');
const verifyToken = require('../middlewares/verifyToken');

router.delete("/",verifyToken,verifyRole['admin'],doctorController.removeDoctor);

module.exports = router;
