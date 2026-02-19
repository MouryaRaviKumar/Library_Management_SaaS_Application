const User = require("../models/UserModel");
const Library = require("../models/LibraryModel");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//Description       Student Self-Register 
//Method            POST
//Endpoint          /api/auth/register
const StudentSelfRegister = asyncHandler(async(req,res) =>{
    const { name , librarySlug , email , password , address , mobile } = req.body;
    if(!name  || !librarySlug || !email || !password || !address || !mobile) {
        return res.status(400).json({ message : "Please provide all required fields "});
    }
    const lowerCaseSlug = librarySlug.toLowerCase();
    const library = await Library.findOne({ slug : lowerCaseSlug });

    if(!library){
        return res.status(400).json({ message : "Invalid library slug "});
    }

    const lowerCaseEmail = email.toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(lowerCaseEmail)) {
        return res.status(400).json({ message: "Invalid email format" });
    }

    const userExists = await User.findOne({ email: lowerCaseEmail });

    if(userExists){
        return res.status(400).json({ message : " User already exists "});
    }

    const hashedPassword = await bcrypt.hash(password,10);
    const newUser = await User.create({
        libraryId : library._id,
        name,
        email : lowerCaseEmail,
        password : hashedPassword,
        address,
        mobile
    });

    const token = generateToken(newUser._id);

    res.status(201).json({
        message: "Student self registration is successful",
        user: {
            libraryId: newUser.libraryId,
            id: newUser._id,
            name: newUser.name,
            email: newUser.email
        },
        token
    });
});

//Description       User Login
//Method            POST
//Endpoint          /api/auth/login
const UserLogin = asyncHandler(async(req,res) => {
    const { email , password } = req.body;
    if(!email || !password) {
        return res.status(400).json({ message : "Please provide email and password "});
    }
    const lowerCaseEmail = email.toLowerCase();
    const user = await User.findOne({ email : lowerCaseEmail });
    if(!user){
        return res.status(400).json({ message : "Invalid email or password "});
    }
    const isPasswordValid = await bcrypt.compare(password,user.password);
    if(!isPasswordValid){
        return res.status(400).json({ message : "Invalid email or password "});
    }
    const token = generateToken(user._id);
    res.status(200).json({
        message : "User logged in successfully",
        user : {
            libraryId : user.libraryId,
            id : user._id,
            name : user.name,
            email : user.email
        },
        token
    });
});

//Description       User Change-password
//Method            POST
//Endpoint          /api/auth/me/change-password
const ChangePassword = asyncHandler(async(req,res) => {
    const { currentPassword , newPassword } = req.body;
    if(!currentPassword || !newPassword) {
        return res.status(400).json({ message : "Please provide current and new password "});
    }
    if(currentPassword === newPassword) {
        return res.status(400).json({ message : "New password must be different from current password "});
    }

    const isMatch = await bcrypt.compare(
        currentPassword,
        req.user.password
    );

    if (!isMatch) {
        return res.status(401).json({
            message: "Current password is incorrect"
        });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword,10);
    req.user.password = hashedNewPassword;
    await req.user.save();
    res.status(200).json({ message : "User password changed successfully "});
});

//Description       Get current user
//Method            GET
//Endpoint          /api/auth/me
const getUser = asyncHandler(async(req,res)=>{
    const user = await User.findById(req.user.id);
    
    if(!user){
        return res.status(404).json({ message : "User not found "});
    }

    res.status(200)
    .json({
        libraryId : user.libraryId,
        id : user._id,
        name : user.name,
        email : user.email,
        mobile : user.mobile,
        address : user.address,
        role : user.role
    })
});


module.exports = { StudentSelfRegister , UserLogin , ChangePassword , getUser };

const generateToken = (userId) => {
    return jwt.sign({ id : userId }, process.env.JWT_SECRET, { expiresIn : "1d" });
};