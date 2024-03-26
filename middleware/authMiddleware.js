require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const SECRET = process.env.JWT_SECRET;

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;
    
    if (!token) {
        console.log("User not logged in! No token provided");
        res.status(401).json({error: "User not logged in! No token provided"});
    }
    jwt.verify(token, SECRET, (err, decodedToken) => {
        if (err) {
            console.log(err.message);
            res.status(400).json({error: err.message});
        } 
        console.log(decodedToken);
        req.user_id = decodedToken.id;
        next();
    })
}

const isAdmin = async (req, res, next) => {
    const user_id = req.user_id;
    const user = await User.findById(user_id);
    req.isAdmin = user.role == "admin";
    next()
}

module.exports = { requireAuth, isAdmin };
