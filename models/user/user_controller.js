const User = require("../user/user_module")
const bcrypt = require('bcrypt')
const validationBody = require("../validation/validation")
const saltRounds = 10
const joi = require('joi')
const { func } = require("joi")
const generateToken = require('../utils/generatetoken')
const jwt = require("jsonwebtoken")


const register = async function (req, res) {
    validationBody({
        firstName: joi.string().required(),
        lastName: joi.string().required(),
        phoneNo: joi.string().length(10).pattern(/^[0-9]+$/).required(),
        email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
        password: joi.string().required()
    },
        req.body,
        res
    )
    try {

        const { firstName, lastName, phoneNo, email, password } = req.body

        const existingUser = await User.exists({ email })
        if (existingUser) {
            return res.json({
                status: false,
                message: "Account already exists, Please check your credentials."
            })
        }

        try {
            const user = new User({ firstName, lastName, phoneNo, email, password })
            const userSave = await user.save()
            return res.json({
                status: true,
                message: " New Account Created Successfully..!",
                firstName: userSave.firstName,
                lastName: userSave.lastName,
                phoneNo: userSave.phoneNo,
                email: userSave.email
            })

        } catch (error) {
            User.findOneAndDelete({
                $or: [{ email }, { phoneNo }]
            }), function (err, doc) {
                if (err) { return res.json({ status: false, message: "Data is already exists" }) }
            }
            return console.log('error', error)
        }
    } catch (error) {
        console.log(error)
        return res.json({status: false, message: "Something wrong, Please Try again..." })

    }

}


const login = async function (req, res) {
    validationBody({
        email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
        password: joi.string().required()
    },
        req.body,
        res
    )
    try {
        const { email, password } = req.body

        if (email) {
            const user = await User.findOne({ email })
            if (!user) {
                return res.json({ status: false, message: "Email does not exists" })
            }
            const hashedpassword = user.password

            bcrypt.compare(password, hashedpassword, function (cryptErr, cryptResult) {
                if (cryptResult) {
                    const userToken = generateToken({ email: user.email })
                    return res.json({ status: true, message: "Successfully login", token: userToken })
                }
                else { return res.json({ status: false, message: 'Incorrect Password!' }) }
            })
        }


    } catch (error) { return console.log('error', error) }

}

const update = async function (req, res) {
    validationBody({
        email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
        firstName: joi.string().required()
    },
        req.body,
        res
    )

    try {
        const { email, firstName } = req.body
        if (email) {
            const wrongEmail = await User.findOne({ email })
            if (!wrongEmail) {
                return res.json({ message: "Email doesnot exists" })
            }
        }
        const updateUser = await User.findOneAndUpdate(email, { firstName }, { new: true }).select('-password')
        console.log('updateUser', updateUser)
        return res.json({
            status: true,
            message: " Update successfully..!",
            firstName: updateUser.firstName,
            lastName: updateUser.lastName,
            email: updateUser.email,
            phoneNo: updateUser.phoneNo
        })


    } catch (error) { return console.log(error) }
}

const profile = async function (req, res) {
    const { email } = req.params
    if (email) {
        const user = await User.findOne({ email })
        if (!user) { return res.json({ status: false, message: " Email does not exists ..!" }) }
        res.json({
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNo: user.phoneNo,
            email: user.email
        })
    }
}

const getProfile = async function (req, res) {
    await User.find({}, { _id: 0 }).select('-password').exec((error, data) => {
        if (error) {
            return res.json({
                status: false,
                error
            })
        }
        return res.json(data)
    })
}

const deleteProfile = async function (req, res) {
    const { email } = req.params
    if (email) {
        const deleteProfile = await User.findOneAndDelete({ email: req.params.email })
        res.json({ status: true, message: "User Deleted" })
    }

}

const changePassword = async function (req, res) {

    validationBody({
        email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
        password: joi.string().required(),
        newPassword: joi.string().required(),
        confirmPassword: joi.string().required()
    },
        req.body,
        res
    )
    try {
        const { email, password, newPassword, confirmPassword } = req.body
        if (newPassword != confirmPassword) {
            return res.json({ status: false, message: "Password is not same" })
        }

        if (email) {
            const change = await User.findOne({ email })
            if (!change) {
                return res.json({ status: false, message: "Email does not exists" })
            }
            const hashedpassword = change.password

            bcrypt.compare(password, hashedpassword, async function (cryptErr, cryptResult) {
                if (cryptResult) {
                    const hashedNewPassword = newPassword

                    try {
                        const doc = await User.findOneAndUpdate(email, { password: hashedNewPassword }, { new: true })
                        return res.json({
                            status: true,
                            message: 'Password Updated '
                        })
                    } catch (error) {
                        console.log('error', error)
                        return res.json({
                            status: false,
                            msg: error.message
                        })
                    }

                }
                else { return res.json({ status: false, message: 'Incorrect Password!' }) }
            })
        }


    } catch (error) { return console.log('error', error) }

}

const token = async function (req, res) {
    const { token } = req.body

    try {

        if (!token) { return res.json({ status: false, message: "Token required" }) }
        jwt.verify(
            token, process.env.JWT_SECRET, async function (error, user) {
                const currentEmail = await User.findOne({ user })
                if (error) { return res.json({ status: false, message: "Something went wrong" }) }
                const userToken = currentEmail.generateAuthToken()
                return res.json({ userToken })

            }
        )

    } catch (error) {
        console.log('error', error)

    }


}


module.exports = { register, login, update, profile, getProfile, deleteProfile, changePassword, token }