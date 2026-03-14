const express = require("express");
const router = express.Router();
const { 
    getUserProfile,
    updateUserProfile,
    getUserBorrows,
    getUserBorrowHistory,
    getUserFines,
    getUserFineHistory
 } = require("../controllers/userController");


//Description       Get current user profile
//Method            GET
//Endpoint          /api/user/profile
router.get("/profile", getUserProfile);

router.put("/profile", updateUserProfile);

router.get("/borrows", getUserBorrows);

router.get("/borrows/history", getUserBorrowHistory);

router.get("/fines", getUserFines);

router.get("/fines/history", getUserFineHistory);

module.exports = router;