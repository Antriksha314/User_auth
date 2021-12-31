/* eslint-disable no-console */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const joi = require('joi');

const User = require('./user_module');
const Product = require('../product/product_module');
const validationBody = require('../validation/validation');
const generateToken = require('../utils/generatetoken');

async function register(req, res) {
  validationBody(
    {
      firstName: joi.string().required(),
      lastName: joi.string().required(),
      phoneNo: joi.string().length(10).pattern(/^[0-9]+$/).required(),
      email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
      password: joi.string().required(),
      role: joi.string().required(),
    },
    req.body,
    res,
  );
  try {
    const {
      firstName, lastName, phoneNo, email, password, role,
    } = req.body;

    const existingUser = await User.exists({ email });
    if (existingUser) {
      return res.json({
        status: false,
        message: 'Account already exists, Please check your credentials.',
      });
    }

    try {
      const user = new User({
        firstName, lastName, phoneNo, email, password, role,
      });
      const userSave = await user.save();
      return res.json({
        status: true,
        message: ' New Account Created Successfully..!',
        firstName: userSave.firstName,
        lastName: userSave.lastName,
        phoneNo: userSave.phoneNo,
        email: userSave.email,
        role: userSave.role,
      });
    } catch (error) {
      await User.findOneAndDelete({
        $or: [{ email }, { phoneNo }],
      }, (err) => {
        if (err) { return res.json({ status: false, message: 'Data is already exists' }); }
      });
    }
  } catch (error) {
    return res.json({ status: false, message: 'Something wrong, Please Try again...' });
  }
}

const login = async (req, res) => {
  validationBody(
    {
      email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
      password: joi.string().required(),
    },
    req.body,
    res,
  );
  try {
    const { email, password } = req.body;

    if (email) {
      const user = await User.findOne({ email });
      if (!user) {
        return res.json({ status: false, message: 'Email does not exists' });
      }
      const hashedpassword = user.password;

      bcrypt.compare(password, hashedpassword, (cryptErr, cryptResult) => {
        if (cryptResult) {
          const userToken = generateToken({ email: user.email, role: user.role });
          return res.json({ status: true, message: 'Successfully login', token: userToken });
        } return res.json({ status: false, message: 'Incorrect Password!' });
      });
    }
  } catch (error) { return console.log('error', error); }
};

const update = async (req, res) => {
  validationBody(
    {
      email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
      firstName: joi.string().required(),
    },
    req.body,
    res,
  );

  try {
    const { email, firstName } = req.body;
    if (email) {
      const wrongEmail = await User.findOne({ email });
      if (!wrongEmail) {
        return res.json({ message: 'Email doesnot exists' });
      }
    }
    await User.updateOne({ email }, { firstName }).exec((err, doc) => {
      if (doc) {
        return res.json({
          status: true,
          message: 'Updated Successfully',
        });
      }
      return console.log('err', err);
    });
    // eslint-disable-next-line no-console
  } catch (error) { return console.log(error); }
};

async function profile(req, res) {
  const { email } = req.params;
  console.log('email', email);
  if (email) {
    const user = await User.findOne({ email });
    if (!user) { return res.json({ status: false, message: ' Email does not exists ..!' }); }
    return res.json({
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNo: user.phoneNo,
      email: user.email,
    });
  }
}

const getProfile = async (req, res) => {
  await User.find({}, { _id: 0 }).select('-password').exec((error, data) => {
    if (error) {
      return res.json({
        status: false,
        error,
      });
    }
    return res.json(data);
  });
};

const deleteProfile = async (req, res) => {
  const { email } = req.params;
  if (email) {
    await User.findOneAndDelete({ email });
    return res.json({ status: true, message: 'User Deleted' });
  }
};

const changePassword = async (req, res) => {
  validationBody(
    {
      email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
      password: joi.string().required(),
      newPassword: joi.string().required(),
      confirmPassword: joi.string().required(),
    },
    req.body,
    res,
  );
  try {
    const {
      email, password, newPassword, confirmPassword,
    } = req.body;
    if (newPassword !== confirmPassword) {
      return res.json({ status: false, message: 'Password is not same' });
    }

    if (email) {
      const change = await User.findOne({ email });
      if (!change) {
        return res.json({ status: false, message: 'Email does not exists' });
      }
      const hashedpassword = change.password;

      bcrypt.compare(password, hashedpassword, async (cryptErr, cryptResult) => {
        if (cryptResult) {
          const hashedNewPassword = newPassword;

          try {
            await User.findOneAndUpdate(email, { password: hashedNewPassword }, { new: true });
            return res.json({
              status: true,
              message: 'Password Updated ',
            });
          } catch (error) {
            // eslint-disable-next-line no-console
            console.log('error', error);
            return res.json({
              status: false,
              msg: error.message,
            });
          }
        } else { return res.json({ status: false, message: 'Incorrect Password!' }); }
      });
    }
  } catch (error) { return console.log('error', error); }
};

const Checktoken = async (req, res) => {
  const { token } = req.body;

  try {
    if (!token) { return res.json({ status: false, message: 'Token required' }); }
    jwt.verify(token, process.env.JWT_SECRET, async (error, user) => {
      const currentEmail = await User.findOne({ user });
      if (error) { return res.json({ status: false, message: 'Something went wrong' }); }
      const userToken = currentEmail.generateAuthToken();
      return res.json({ userToken });
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('error', error);
  }
};

const addProduct = async (req, res) => {
  validationBody(
    {

      productName: joi.string().required(),
      productPrice: joi.string().required(),
      productDesc: joi.string().required(),

    },
    req.body,
    res,
  );

  try {
    const {
      productName, productPrice, productDesc,
    } = req.body;

    try {
      const addNewProduct = new Product({ productName, productPrice, productDesc });
      const saveProduct = await addNewProduct.save();
      return res.json({
        status: true,
        message: 'Products are successfully saved',
        productName: saveProduct.productName,
        productPrice: saveProduct.productPrice,
        productDesc: saveProduct.productDesc,
      });
    } catch (error) {
      console.log('error', error);
    }
  } catch (error) {
    console.log('error', error);
  }
};

module.exports = {
  register,
  login,
  update,
  profile,
  getProfile,
  deleteProfile,
  changePassword,
  Checktoken,
  addProduct,
};
