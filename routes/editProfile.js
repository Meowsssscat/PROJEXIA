const express = require('express');
const router = express.Router();
const multer = require('multer');
const editCon = require('../controllers/editProfile')
const check = require('../middleware/checkUser')

// Use temporary storage for Multer
const upload = multer({ dest: 'temp/' });

router.post('/', check, upload.single('avatar'), editCon.updateProfile);

module.exports = router;

