import express from "express";
import UserModel from "../models/userModel.js";
import { Mongoose } from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import NodeMailer from 'nodemailer';

const router = express.Router()

router.get('/get', async (req, res) => {
    const date = Mongoose.date
    console.log(date)
    try {
        const result = await UserModel.find({})
        res.send(result)
    }
    catch (error) {
        res.status(500).json(error)
    }
})

router.get('/today', async (req, res) => {

    try {
        const result = await UserModel.find({})
        res.send(result)
    }
    catch (error) {
        res.status(500).json(error)
    }
})

router.post('/signup', async (req, res) => {
    const { username, firstName, lastName, password } = req.body;
    try {
        const isUserExist = await UserModel.findOne({ username: username })

        if (isUserExist) {
            return res.status(400).json({ message: "username is already registered" })
        }

        const salt = await bcrypt.genSalt(10); //bcrypt.gensalt(no of rounds)

        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new UserModel({ username: username, firstName: firstName, lastName: lastName, password: hashedPassword, status: "inactive" })
        await newUser.save()

        const secret = process.env.SECRET_KEY + newUser.password
        const payload = {
            email: newUser.username,
            id: newUser._id
        }

        //User exist and now create a one time link valid for 15 minutes
        const token = jwt.sign(payload, secret, { expiresIn: '15m' });
        const link = `https://url-shortener-frontend-a1d3c9.netlify.app/register/verify/${newUser._id}/${token}`;
        var transporter = NodeMailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'panmonikmm@gmail.com',
                pass: 'lxkugchepioxgtmr'
            }
        });
        var mailOptions = {
            from: 'panmonikmm@gmail.com',
            to: `${newUser.username}`,
            subject: "Please confirm your account",
            html: `<div>
            <h1>Email Confirmation</h1>
            <h2>Hello ${newUser.firstName}</h2>
            <p>Thank you for subscribing. Please confirm your email by clicking on the following link. This link is valid for 15 minutes.</p>
            <a href=${link}>Click here</a>
            </div>`,
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            }
            else {
                console.log('Email sent:' + info.response);
            }
        })
        res.send({ message: "Email sent successfully" })
    }
    catch (error) {
        res.status(500).json(error)
    }

})

router.post('/signup/verify-account/:id/:token', async (req, res) => {
    const { id, token } = req.params;

    try {
        const isUserExist = await UserModel.findOne({ _id: id })

        if (!isUserExist) {
            return res.status(400).json({ message: "User not exists" })
        }

        const secret = process.env.SECRET_KEY + isUserExist.password;

        try {
            const verify = jwt.verify(token, secret)
            const result = await isUserExist.updateOne({ status: "active" })
            res.send({ message: "Email verified successfully" })
        }
        catch (error) {
            res.status(500).json({ message: "Token expired" })
        }
    }
    catch (error) {
        res.status(500).json("Server error")
    }

})

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const isUserExist = await UserModel.findOne({ username: username })

    if (!isUserExist) {
        return res.status(400).json({ message: "user not exists!!!" })
    }

    try {
        //check whether the account is active      
        if (isUserExist.status !== "active") {
            const secret = process.env.SECRET_KEY + isUserExist.password
            const payload = {
                email: isUserExist.username,
                id: isUserExist._id
            }

            //User exist and now create a one time link valid for 15 minutes
            const token = jwt.sign(payload, secret, { expiresIn: '15m' });
            const link = `https://url-shortener-frontend-a1d3c9.netlify.app/register/verify/${isUserExist._id}/${token}`;
            var transporter = NodeMailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'panmonikmm@gmail.com',
                    pass: 'lxkugchepioxgtmr'
                }
            });
            var mailOptions = {
                from: 'panmonikmm@gmail.com',
                to: `${isUserExist.username}`,
                subject: "Please confirm your account",
                html: `<div>
            <h1>Email Confirmation</h1>
            <h2>Hello ${isUserExist.firstName}</h2>
            <p>Thank you for subscribing. Please confirm your email by clicking on the following link. This link is valid for 15 minutes.</p>
            <a href=${link}>Click here</a>
            </div>`,
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log('Email sent:' + info.response);
                }
            })
            return res.send({ message: "Account is not activated. Email sent successfully" })
        }
    }
    catch (error) {
        res.status(500).json("Internal server error")
    }

    const storedPassword = isUserExist.password
    const isPasswordMatch = await bcrypt.compare(password, storedPassword)
    console.log(isPasswordMatch)

    if (!isPasswordMatch) {
        return res.status(400).send({ message: "Invalid credentials" })
    }

    const token = jwt.sign({ id: isUserExist._id }, process.env.SECRET_KEY)
    res.send({ message: "Successful login", token: token })

})

export const userRouter = router;


