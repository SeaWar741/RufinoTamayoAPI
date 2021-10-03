require("dotenv").config();
//require("../config/database").connect();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../model/user");

const { sendEmail } = require("../helpers/mailer");


router.post("/register/", async (req, res) => {
    try {
        // Get user input
        const { username,  password , email, name } = req.body;
    
        // Validate user input
        if (!(email && password && username && name)) {
            res.status(400).send("All input is required");
        }


        // check if user already exist
        // Validate if user exist in our database
        const oldUser = await User.findOne({ email });

        if (oldUser) {
            return res.status(409).send("User Already Exist. Please Login");
        }

        //Encrypt user password
        encryptedPassword = await bcrypt.hash(password, 10);
    
        // Create user in our database
        const user = await User.create({
            username,
            email: email.toLowerCase(), // sanitize: convert email to lowercase
            password: encryptedPassword,
            name
        });
    
        // Create token
        const token = jwt.sign(
            { user_id: user._id, email },
            process.env.TOKEN_KEY,
            {
            expiresIn: "2h",
            }
        );
        // save user token
        user.token = token;
    
        // return new user
        res.status(201).json(user);
    } catch (err) {
        console.log(err);
    }
});

router.post("/login/", async (req, res) => {
    try {
        // Get user input
        const { email, password } = req.body;
    
        // Validate user input
        if (!(email && password)) {
            res.status(400).send("All input is required");
        }
        // Validate if user exist in our database
        const user = await User.findOne({ email });
    
        if (user && (await bcrypt.compare(password, user.password))) {
            // Create token
            const token = jwt.sign(
            { user_id: user._id, email },
            process.env.TOKEN_KEY,
            {
                expiresIn: "2h",
            }
            );
    
            // save user token
            user.token = token;
    
            // user
            res.status(200).json(user);
        }
        else{
            res.status(400).send("Invalid Credentials");
        }
    } catch (err) {
        console.log(err);
    }
});

router.post("/forgotpassword", async (req, res) => {
    try {
        // Get user input
        const { email } = req.body;
    
        // Validate user input
        if (!(email)) {
            res.status(400).send("All input is required");
        }
        // Validate if user exist in our database
        const user = await User.findOne({ email:email });
        
        if(!user){
            return res.send({
            success: true,
            message:
                "If that email address is in our database, we will send you an email to reset your password",
            });
        }
    
        let code = Math.floor(100000 + Math.random() * 900000);
        let response = await sendEmail(user.email, code);
    
        if (response.error) {
            return res.status(500).json({
            error: true,
            message: "Couldn't send mail. Please try again later.",
            });
        }
    
        let expiry = Date.now() + 60 * 1000 * 15;
        user.resetPasswordToken = code;
        user.resetPasswordExpires = expiry; // 15 minutes
    
        await user.save();
    
        return res.send({
            success: true,
            message:
            "If that email address is in our database, we will send you an email to reset your password",
        });
    
    } catch (err) {
        console.log(err);
    }
});

router.post('/resetpassword/', async (req, res) => {
    try {
        const { token, newPassword, confirmPassword } = req.body;

        if (!token || !newPassword || !confirmPassword) {
            return res.status(403).json({
            error: true,
            message:
                "Couldn't process request. Please provide all mandatory fields",
            });
        }

        const user = await User.findOne({
            resetPasswordToken: req.body.token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.send({
            error: true,
            message: "Password reset token is invalid or has expired.",
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
            error: true,
            message: "Passwords didn't match",
            });
        }

        encryptedPassword = await bcrypt.hash(newPassword, 10);
        user.password = encryptedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = "";
    
        await user.save();
    
        return res.send({
            success: true,
            message: "Password has been changed",
        });
    } catch (error) {
        console.error("reset-password-error", error);
        
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
});


module.exports = router;