const express = require('express');
const router = express.Router();

const userRouter = require('./userRoutes.js');
const patientRouter = require('./patientRoutes.js');
const doctorRouter = require('./doctorRoutes.js');

router.use('/user', userRouter);
router.use('/patient', patientRouter);
router.use('/doctor', doctorRouter);

module.exports = router;