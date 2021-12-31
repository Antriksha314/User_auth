const jwt = require('jsonwebtoken');

const generateToken = (data) => jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '1h' });

module.exports = generateToken;
