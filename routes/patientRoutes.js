const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient_controller');
const verifyRole = require('../middlewares/verifyRole');
const verifyToken = require('../middlewares/verifyToken');


module.exports = router;
