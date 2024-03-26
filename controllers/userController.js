require("dotenv").config();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const SECRET = process.env.JWT_SECRET;
const maxAge = 24 * 60 * 60;

// Utils

const validateUsername = (username) => {
    const specialCharactersList = /^[\w\s]*$/;
    if (!specialCharactersList.test(username)) {
        return false
    }
    if (username.includes(" ")) {
        return false
    }
    return true
}

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt();
    const hashed_password = await bcrypt.hash(password, salt);
    return hashed_password
}

const createToken = (id) => {
    return jwt.sign( {id}, SECRET, {
        expiresIn: maxAge
    });
}

// Request controllers

const getUsers = (req, res) => {
    if (!req.isAdmin) {
        res.status(403).json({error: "admin privileges required"});
        return
    }
    User.find({}).then((users) => {
        res.status(200).json({data: users});
    });
} 

const getUserById = async (req, res) => {
    if (!req.isAdmin) {
        res.status(403).json({error: "admin privileges required"});
        return
    }
    const id = req.params.id
    try {
        const user = await User.find({_id: id});
        res.status(200).json({data: user});
    } catch(error) {
        res.status(404).json({error: error.message});
    }  
}

const createUser = async (req, res) => {
    const {username, email, password, birthYear} = req.body;
    const currentYear = new Date().getFullYear(); 
    if (!validateUsername(username)) {
        res.status(400).json({error: "Username cannot contain special characters or spaces"});
        return
    }
    if (currentYear-birthYear < 16) {
        res.status(400).json({error: "Age has to be above 16"});
        return
    }
    try {
        const role = "user"
        const user = await User.create({username, email, password, birthYear, role});
        const token = createToken(user._id);
        console.log(token);
        res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
        console.log("user created!");
        res.status(200).json({data: user});
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
        console.log("user logged in");
        res.status(200).json({data: user});
    }
    catch (error) {
        res.status(400).json({error: error.message});
    }
 }

 const logoutUser = async (req, res) => {
    res.cookie("jwt", "", { maxAge: 1});
    console.log("user logged out");
    res.status(200).json({data :{message: "User logged out"}});
 }

const update = async (res, id, newData) => {
    try {
        const user = await User.findOneAndUpdate({_id: id}, newData, { new: true});
        console.log("user updated!");
        res.status(200).json({data: user});
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

const updateUser = async (req, res) => {
    const user_id_to_be_updated = req.params.id;
    const { user_id, isAdmin } = req;
    const { username, password} = req.body;
    
    if (user_id_to_be_updated == user_id || isAdmin) {
        const newUser = { }
        if (username) {
            if (!validateUsername(username)) {
                res.status(400).json({error: "Username cannot contain special characters or spaces"});
                return;
            }
            newUser.username = username;
        }
        if (password) {
            if (password.length < 6) {
                res.status(400).json({error: "password has to be at least 6 characters"}); 
                return;
            }
            newUser.password = await hashPassword(password);
        }
        update(res, user_id_to_be_updated, newUser);
    } else {
        res.status(403).json({error: "user not authorized to update this user"}); 
    }
}

const deleteUser = async (req, res) => {
    const user_id_to_be_deleted = req.params.id;
    const { user_id, isAdmin } = req;
    try {
        if (user_id_to_be_deleted == user_id || isAdmin) {
            const user = await User.findOneAndDelete({_id: user_id_to_be_deleted});
            console.log("user deleted!");
            if (!isAdmin) {
                res.cookie("jwt", "", { maxAge: 1});
            }
            res.status(200).json({data: user});
        } else {
            res.status(403).json({error: "user not authorized to delete this user"}); 
        }
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

module.exports = {getUsers, getUserById, createUser, updateUser, 
    deleteUser, loginUser, logoutUser};