const asyncHandler = require("express-async-handler");

const blockedUser = asyncHandler(async(req,res,next)=>{
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    if(user.role == "blocked"){
        return res.status(403).json({ message: "Access denied. User is blocked from this library ." });
    }

    next();
});

module.exports = blockedUser;