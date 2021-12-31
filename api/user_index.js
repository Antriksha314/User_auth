/* eslint-disable no-unused-vars */
const express = require('express');
const { userVerify, adminVerify, roleVerify } = require('../models/middleware/auth');
const {
  login, register, update, profile, getProfile, deleteProfile, changePassword, Checktoken,
  addProduct,
} = require('../models/user/user_controller');

const router = express.Router();

router.post('/', register);
router.post('/login', login);
router.put('/', roleVerify, update);
router.get('/:email', roleVerify, profile);
router.get('/', getProfile);
router.delete('/:email', roleVerify, deleteProfile);
router.post('/change-password', roleVerify, changePassword);
router.post('/token', Checktoken);
router.post('/addProduct', adminVerify, addProduct);

module.exports = router;
