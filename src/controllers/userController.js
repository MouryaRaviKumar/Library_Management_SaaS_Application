const jwt = require("jsonwebtoken");
const Borrow = require('../models/BorrowModel');
const Fine = require('../models/fineModel');
const User = require('../models/UserModel');
const asyncHandler = require("express-async-handler");

//Description       Get current user profile
//Method            GET
//Endpoint          /api/user/profile
const getUserProfile = asyncHandler(async (req, res) =>{
    const user = await User.findById(req.user._id).select('-password');
    if(user){
        res.json(user);
    }else{
        res.status(404);
        throw new Error('User not found');
    }
});

//Description       Update user profile
//Method            PUT
//Endpoint          /api/user/profile
const updateUserProfile = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id);

    const { name, email, password, address, mobile } = req.body;

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    user.name = name || user.name;
    user.email = email ? email.toLowerCase() : user.email;
    user.address = address || user.address;
    user.mobile = mobile || user.mobile;

    if (password) {
        user.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await user.save();

    res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        address: updatedUser.address,
        mobile: updatedUser.mobile,
        role: updatedUser.role,
        token: generateToken(updatedUser._id)
    });

});

//Description       Get list of Active borrowed books
//Method            GET
//Endpoint          /api/user/borrows
const getUserBorrows = asyncHandler(async (req, res) =>{
    const borrows = await Borrow
        .find({ user: req.user._id, isReturned: false })
        .populate('book', 'title author');

    if (!borrows.length) {
        return res.status(200).json({ message: "No active borrows" });
    }

    res.status(200).json({
        count: borrows.length,
        borrows
    });
});

//Description       Get borrowing history
//Method            GET
//Endpoint          /api/user/borrows/history
const getUserBorrowHistory = asyncHandler(async (req, res) => {
  const borrows = await Borrow
    .find({ user: req.user._id })
    .populate('book', 'title author')
    .sort({ createdAt: -1 });

  if (!borrows.length) {
    return res.status(200).json({
      message: "No borrow history",
      history: []
    });
  }

  res.status(200).json({
    count: borrows.length,
    history: borrows
  });
});

//Description       Get list of pending fines
//Method            GET
//Endpoint          /api/user/fines
const getUserFines = asyncHandler(async (req, res) =>{
    const fines = await Fine
        .find({ user: req.user._id, isPaid: false })
        .populate("book", "title author")
        .sort({ createdAt: -1 });

    if (!fines.length) {
        return res.status(200).json({
            count: 0,
            fines: [],
            message: "No pending fines"
        });
    }

    res.status(200).json({
        count: fines.length,
        fines
    });

});

//Description       Get list of fine history
//Method            GET
//Endpoint          /api/user/fines/history
const getUserFineHistory = asyncHandler(async (req, res) =>{
    const fines = await Fine
        .find({ user: req.user._id })
        .populate("book", "title author")
        .sort({ createdAt: -1 });

    if (!fines.length) {
        return res.status(200).json({
            count: 0,
            fineHistory: [],
            message: "No fine history"
        });
    }

    res.status(200).json({
        count: fines.length,
        fineHistory: fines
    });
});

const generateToken = (userId) => {
    return jwt.sign({ id : userId }, process.env.JWT_SECRET, { expiresIn : "1d" });
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    getUserBorrows,
    getUserBorrowHistory,
    getUserFines,
    getUserFineHistory
};
