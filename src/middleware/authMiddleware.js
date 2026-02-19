const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

const authMiddleware = async (req,res,next) => {
    
    try {
        const header = req.headers.authorization;

        if (!header || !header.startsWith("Bearer ")) {
            return res.status(401).json({ error: "No token" });
        }

        const token = header.split(" ")[1];

        if(!token){
            return res.status(401).json({ message : "Unauthorized "});
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);  

        if(!user){
            return res.status(401).json({ message : "Unauthorized "});
        }

        req.user = user;
        next();

    } catch (error) {
        res.status(401).json({ message : "Unauthorized "});
    }
};

module.exports = authMiddleware;
