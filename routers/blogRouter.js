const express = require("express")
const router = express.Router()
const { getBlogs, getBlogById, createBlog, updateBlog, deleteBlog, createComment, updateComment, 
    deleteComment, getBlogsByUserId, addLike, removeLike, getMostLikedBlogs, getTrendingBlogs } = require("../controllers/blogController");
const { requireAuth, isAdmin } = require("../middleware/authMiddleware");


// Blogs

router.get('/', getBlogs);

router.get("/mostliked", getMostLikedBlogs);

router.get("/trending", getTrendingBlogs);

router.get("/:id", getBlogById);

router.get("/user/:user_id", getBlogsByUserId);

router.post("/", requireAuth, createBlog);

router.patch("/:id", requireAuth, updateBlog);

router.delete("/:id", requireAuth, isAdmin, deleteBlog);


// Likes

router.post("/addlike/:blog_id", requireAuth, addLike);

router.post("/removelike/:blog_id", requireAuth, removeLike);


// Comments

router.post("/comment/:id", requireAuth, createComment);

router.patch("/comment/:blog_id/:comment_id", requireAuth, updateComment);

router.delete("/comment/:blog_id/:comment_id", requireAuth, isAdmin, deleteComment);

module.exports = router
