const express = require('express')
const { login, register, update, profile, getProfile, deleteProfile, changePassword, token } = require('../models/user/user_controller')
const verifyToken = require('../models/middleware/auth')


const router = express.Router()

router.post('/', register)
router.post('/login', login)
router.put('/',verifyToken, update)
router.get('/:email', verifyToken, profile)
router.get('/', getProfile)
router.delete('/:email',verifyToken, deleteProfile)
router.post('/change-password',verifyToken, changePassword)
router.post('/token',token)


module.exports = router