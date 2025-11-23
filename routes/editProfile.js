const express = require('express');
const router = express.Router();
const editCon = require('../controllers/editProfile')
const check = require('../middleware/checkUser')




router.post('/', check, editCon.updateProfile);


module.exports = router;

