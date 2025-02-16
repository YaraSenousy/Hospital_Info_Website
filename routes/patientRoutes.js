const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient_controller');
const verifyRole = require('../middlewares/verifyRole');
const verifyToken = require('../middlewares/verifyToken');

router.delete("/",[verifyToken,verifyRole('admin')],patientController.removePatient);
router.get("/getPatients",[verifyToken,verifyRole('doctor','admin')],patientController.getPatients);

module.exports = router;
