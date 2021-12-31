/* eslint-disable no-console */
const jwt = require('jsonwebtoken');

function verifyToken(req, res) {
  const bearer = req.headers?.authorization?.split(' ');
  const bearerToken = bearer[1];
  if (bearerToken) {
    return jwt.verify(bearerToken, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) {
        return res.sendStatus(403);
      }
      return decodedToken;
    });
  }
}

const userVerify = (req, res, next) => {
  const payload = verifyToken(req, res);
  if (payload.role === 'User') {
    return next();
  }
  return res.sendStatus(403);
};

async function adminVerify(req, res, next) {
  const payload = verifyToken(req, res);
  if (payload.role === 'Admin') {
    return next();
  }
  return res.json({ status: false, message: 'Only Admin can add the products' });
}
async function roleVerify(req, res, next) {
  const payload = verifyToken(req, res);
  if (payload) { return next(); }
}

module.exports = {
  verifyToken, userVerify, adminVerify, roleVerify,
};
