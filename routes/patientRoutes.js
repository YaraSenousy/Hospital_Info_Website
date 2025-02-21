const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient_controller');
const verifyRole = require('../middlewares/verifyRole');
const verifyToken = require('../middlewares/verifyToken');
const signupValidationRules = require('../validators/signupvalidator');
const validate = require('../middlewares/validate');

router.delete("/", [verifyToken, verifyRole(['admin'])], patientController.removePatient);
router.get("/getPatients", [verifyToken, verifyRole(['doctor', 'admin'])], patientController.getPatients);
router.post("/signup", signupValidationRules, validate, patientController.signup);

module.exports = router;
