const asyncHandler = require("express-async-handler");

const adminOnly = asyncHandler(async (req, res, next) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    if (user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admin only." });
    }

    next();
});

module.exports = adminOnly;