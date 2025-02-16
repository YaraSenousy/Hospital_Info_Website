const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient_controller');
const verifyRole = require('../middlewares/verifyRole');
const verifyToken = require('../middlewares/verifyToken');

router.delete("/",[verifyToken,verifyRole(['admin'])],patientController.removePatient);

module.exports = router;
