const express = require("express");
const router = express.Router();
const {getUsers, getUserById, createUser, updateUser, deleteUser, loginUser, logoutUser} = require("../controllers/userController");
const { requireAuth, isAdmin } = require("../middleware/authMiddleware");

router.get('/', requireAuth, isAdmin, getUsers);

router.get("/:id", requireAuth, isAdmin, getUserById);

router.post("/signup", createUser);

router.post("/login", loginUser);

router.post("/logout", logoutUser);

router.patch("/:id", requireAuth, isAdmin, updateUser);

router.delete("/:id", requireAuth, isAdmin, deleteUser);

module.exports = router
