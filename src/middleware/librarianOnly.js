const asyncHandler = require("express-async-handler");

const librarianOnly = asyncHandler(async (req, res, next) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    if (user.role !== "librarian") {
        return res.status(403).json({ message: "Access denied. Librarian only." });
    }

    next();
});

module.exports = librarianOnly;