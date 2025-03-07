const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor_controller');
const verifyRole = require('../middlewares/verifyRole');
const verifyToken = require('../middlewares/verifyToken');
const signupvalidator= require('../validators/signupvalidator');
const validate = require('../middlewares/validate')

router.get("/getDoctors",[verifyToken,verifyRole(['patient','admin'])],doctorController.getDoctors);
router.post("/addDoctor",[verifyToken,verifyRole("admin"),signupvalidator,validate],doctorController.addDoctor);
module.exports = router;
