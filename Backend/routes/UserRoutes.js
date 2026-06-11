const express = require('express');
const User = require('../models/user');
const {jwtAuthMiddleWare,generateToken} = require('../jwt')
const Profile = require('../models/profile');
const Post = require('../models/posts');
const jwt = require("jsonwebtoken");
const router = express.Router();
const crypto = require('crypto')
const nodemailer = require('nodemailer');
const client = require('../cache/redis');
const bcrypt = require('bcrypt');

// router.post('/signup',async(req,res) => {
//     try{
//         const data = req.body;

//         await register(data.username,data.email,data.password);

//         // const newPerson = new User(data);
//         // const response = await newPerson.save();
//         const payload = {
//             email : response.email,
//             id : response._id,
//             role : response.roles,
//             username : response.username
//         }
//         const token = generateToken(payload);

//         const profileres = new Profile();
//         profileres.user = newPerson._id;

//         await profileres.save();

//         res.status(200).json({token : token});
        
//     }catch(err){
//         console.log(err);
//     }
// })

router.post('/verify',async(req,res) => {
    try{
        const data = req.body;

        await verifyOTP(data.email,data.otp);

        // const newPerson = new User(data);
        // const response = await newPerson.save();
        const payload = {
            email : response.email,
            id : response._id,
            role : response.roles,
            username : response.username
        }
        const token = generateToken(payload);

        const profileres = new Profile();
        profileres.user = newPerson._id;

        await profileres.save();

        res.status(200).json({token : token});
        
    }catch(err){
        console.log(err);
    }
})

router.post('/login',async (req,res) => {
    try{
        const data = req.body;
        // const newPerson = new Person(data);
        const email = data.email;

        let user = await client.get(email);

        if(!user){
            user = await User.findOne({email : email});
            client.setEx(email,3600,JSON.stringify(user))
        }
        else {
            console.log("cache hit")
            user = JSON.parse(user) 
        }      
        if(user==null)return res.status(404).json({error : 'user not found'});
        // if(!user.isVerified){
        //     return res.status(404).json({error : 'please verify with otp'});
        // }
        const password = data.password;

        // const ismatch = await user.comparePassword(password);

        const ismatch = await bcrypt.compare(password,user.password);

        if(!ismatch){
            return res.status(400).json({error : 'Incorrect password or username'});
        }

        const payload = {
            email : user.email,
            id : user._id,
            role : user.roles,
            username : user.username
        }

        const token = generateToken(payload);

        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // true in production with HTTPS
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
        });

        return res.status(200).json(token);
    }catch(err){
        console.log(err);
    }
})

router.get('/isLogin',jwtAuthMiddleWare, async (req, res) => {

    const token = req.cookies.token

    if(!token)return res.status(200).json(false); 

    return res.status(200).json(true);
});

router.get('/private',jwtAuthMiddleWare,async (req,res) => {
    try{
        const userid = req.user.id;
        const user = await User.findById(userid);
        if(user.isPrivate==false){
            return res.status(200).json(false); 
        }     
        return res.status(200).json(true); 
    }catch(e){
        return res.status(500).json({message : "internal server error!!!"})
    }
})

router.post('/private', jwtAuthMiddleWare, async (req, res) => {
    try {

        const userid = req.user.id;
        const isPrivate  = req.body.isPrivate;

        const user = await User.findById(userid);
        if(!user)return res.status(404).json(
            "user not found!!!"
        );

        user.isPrivate = isPrivate;
        console.log(user)
        await user.save();

        return res.status(200).json(
            "account type updated successfully"
        );

    } catch (e) {
        return res.status(500).json({
            message: "internal server error!!!"
        });
    }
});

router.post('/reset-pass/:emailorusername', async (req, res) => {
    try {

        const emailorusername = req.params.emailorusername
        
        const newpass = req.body.password;

        let user = await User.findOne({
            email : emailorusername
        })

        if(!user){
            user = await User.findOne({
                username : emailorusername
            }) 
        }

        if(!user){
            return res.status(404).json({
                message: "user not found!!!"
            });
        }

        user.password = newpass

        await user.save();

        return res.status(200).json({
            message: "password updated successfully!!!"
        }); 

    } catch (e) {
        return res.status(500).json({
            message: "internal server error!!!"
        });
    }
});


const transporter = nodemailer.createTransport({
    service : "gmail",
    auth : {
        user : 'vishw2723@gmail.com',
        pass : 'rclizllbeczgxxcl'
    }
})

const generateOTP = () => crypto.randomInt(100000,999999).toString();

// Register User and Send OTP
router.post('/signup',async (req,res) => {
    try {

        const { username, email, password } = req.body;
        let user = await User.findOne({ email });

        if (user) return res.status(400).json({ message: 'User already exists' });

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        user = new User({ username, email, password, otp, otpExpiry });
        await user.save();

        await transporter.sendMail({
            from: 'vishw2723@gmail.com',
            to: email,
            subject: 'OTP Verification',
            text: `Your OTP is: ${otp}`
        });

        res.status(201).json({ message: 'User registered. Please verify OTP sent to email.' });

    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
})

// Verify OTP
router.post('/verify-otp', async (req,res) => {
    try {

        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: 'User not found' });
        if (user.isVerified) return res.status(400).json({ message: 'User already verified' });

        if (user.otp !== otp || user.otpExpiry < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        const payload = {
            email : user.email,
            id : user._id,
            role : user.roles,
            username : user.username
        }
        const token = generateToken(payload);

        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // true in production with HTTPS
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
        });
        
        let profileres = await Profile.findOne({
            user : user
        })

        if(!profileres)profileres = new Profile();

        profileres.user = user._id;

        await profileres.save();

        res.status(200).json({ message: 'Email verified successfully. You can now log in.',
            token : token,
         });

    } catch (error) {
        res.status(500).json({ message: 'Error verifying OTP', error });
    }
});

router.post('/resend-otp',async (req, res) => {
    try {

        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: 'User not found' });
        if (user.isVerified) return res.status(400).json({ message: 'User already verified' });

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await transporter.sendMail({
            from: 'vishw2723@gmail.com',
            to: email,
            subject: 'Resend OTP Verification',
            text: `Your new OTP is: ${otp}`
        });
        res.json({message : 'OTP Resent Successfully.'})
    }
    catch (error) {
        res.status(500).json({ message: 'Error resending OTP', error });
    }
})

router.post('/logout',async (req, res) => {
    try {
        res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        });

        return res.status(200).json({
            message: "Logged out successfully",
        });
    }
    catch (error) {
        res.status(500).json({ message: "internal server error" });
    }
})

router.get('/userid',jwtAuthMiddleWare,async (req,res) => {
    try{
        if(!req.user || !req.user.id)return res.status(404).json({message : "user not found!"})
        return res.status(200).json(req.user.id)
    }catch(e){
        return res.status(500).json("internal server error!!!")
    }
})
module.exports = router;