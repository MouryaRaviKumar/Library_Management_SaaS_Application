const express = require("express");
const router = express.Router();

const protected = require("../middleware/authMiddleware");

const { 
        StudentSelfRegister , 
        UserLogin , 
        ChangePassword , 
        getUser 
    } = require("../controllers/authController");

//Description       Student Self-Register 
//Method            POST
//Endpoint          /api/auth/register
router.post("/register", StudentSelfRegister);

//Description       User Login
//Method            POST
//Endpoint          /api/auth/login
router.post('/login',UserLogin);

//Description       User Change-password
//Method            POST
//Endpoint          /api/auth/me/change-password
router.post("/me/password",protected, ChangePassword);

//Description       Get current user
//Method            GET
//Endpoint          /api/auth/me
router.get("/me",protected , getUser);


module.exports = router;