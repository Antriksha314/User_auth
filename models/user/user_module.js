/* eslint-disable func-names */
const mongoose = require('mongoose');
require('mongoose-type-email');
const bcrypt = require('bcrypt');

const SALT_WORK_FACTOR = 10;
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  phoneNo: {
    type: String,
  },
  email: {
    type: mongoose.SchemaTypes.Email,
    allow: ['com', 'net'],
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },

});
userSchema.pre('save', function (next) {
  const user = this;

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, (error, hash) => {
      if (error) return next(err);
      user.password = hash;
      next();
    });
  });
});

userSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.password !== '') {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(update.password, salt, (error, hash) => {
        this.getUpdate().password = hash;
        next();
      });
    });
  } else { next(); }
});

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { _id: this._id, email: this.email },
    process.env.JWT_SECRET,
  );
};

module.exports = mongoose.model('User', userSchema);
