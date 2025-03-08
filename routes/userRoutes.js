const express = require('express');
const router = express.Router();
const userController = require('../controllers/user_controller');
const verifyRole = require('../middlewares/verifyRole');
const verifyToken = require('../middlewares/verifyToken');
const upload = require('../middlewares/multer');

router.post('/login',userController.login);
router.put('/update-profile-picture',[verifyToken,verifyRole(['patient','doctor']),upload.single('image')],userController.updatepfp);
router.put('/update-profile',[verifyToken,verifyRole(['patient','doctor'])],userController.updateprofile);
router.get('/profile',[verifyToken],userController.getProfile);
router.delete("/delete", [verifyToken, verifyRole(['admin'])], userController.removeUser);

module.exports = router;
