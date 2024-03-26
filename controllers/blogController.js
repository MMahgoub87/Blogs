const Blog = require("../models/Blog");
const User = require("../models/User");

// Utils

const update = async (res, id, newData) => {
    try {
        const blog = await Blog.findOneAndUpdate({_id: id}, newData, {new: true});
        console.log("entry updated!");
        res.status(200).json({data: blog});
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

// Request controllers

// Blogs

const getBlogs = (req, res) => {
    Blog.find({}).then((blogs) => {
        res.status(200).json({data: blogs});
        });
} 

const getBlogById = async (req, res) => {
    const id = req.params.id
    try {
        const blog = await Blog.findOne({_id: id});
        res.status(200).json({data: blog});
    } catch(error) {
        res.status(400).json({error: error.message});
    }  
}

const getBlogsByUserId = async (req, res) => {
    const user_id = req.params.user_id
    try {
        const blogs = await Blog.find({user_id: user_id});
        res.status(200).json({data: blogs});
    } catch(error) {
        res.status(400).json({error: error.message});
    }  
}

const getMostLikedBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({}).sort({likes:-1}).limit(5);
        res.status(200).json({data: blogs});
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

const getTrendingBlogs = async (req, res) => {
    try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const blogs = await Blog.find({"createdAt": {$gt: oneWeekAgo}}).sort({likes:-1});
        res.status(200).json({data: blogs});
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

const createBlog = async (req, res) => {
    const {title, body} = req.body;
    const user_id = req.user_id;
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    if (trimmedTitle.length == 0) {
        return res.status(400).json({error: "title cannot be empty"});
    }
    if (trimmedBody.length == 0) {
        return res.status(400).json({error: "blog cannot be empty"});
    }
    try {
        const user = await User.findById(user_id);
        const user_name = user.username;
        const blog = await Blog.create({title: trimmedTitle, body: trimmedBody, author: user_name, user_id, comments: [], likes: []});
        console.log("entry created!");
        res.status(201).json({data: blog});
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

const updateBlog = async (req, res) => {
    const blog_id = req.params.id;
    const user_id = req.user_id;
    const {title, body} = req.body;
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    if (trimmedTitle.length == 0) {
        return res.status(400).json({error: "title cannot be empty"});
    }
    if (trimmedBody.length == 0) {
        return res.status(400).json({error: "blog cannot be empty"});
    }
    try {
        const blog = await Blog.findById(blog_id);
        if (user_id == blog.user_id) {
            update(res, blog_id, {title: trimmedTitle, body: trimmedBody})
        }
        else {
            res.status(403).json({error: "user not authorized to update this blog"})
        }
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

const deleteBlog = async (req, res) => {
    const blog_id = req.params.id;
    const { user_id, isAdmin } = req;
    try {
        const blog = await Blog.findById(blog_id);
        if (user_id == blog.user_id || isAdmin) {
            const blog = await Blog.findOneAndDelete({_id: blog_id});
            console.log("entry deleted!");
            res.status(200).json({data: blog})
        } else {
            res.status(403).json({error: "user not authorized to delete this blog"}) 
        }
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}


// Likes

const addLike = async (req, res) => {
    const user_id = req.user_id;
    const blog_id = req.params.blog_id;
    try {
        const blog = await Blog.findOne({_id: blog_id});
        const blogLikes = blog.likes;
        if (blogLikes.includes(user_id)) {
            return res.status(400).json({error: "user has already liked this blog"});
        }
        blogLikes.push(user_id);
        update(res, blog_id, {likes: blogLikes});
    }
    catch(error) {
        res.status(400).json({error: error.message});
    }
}

const removeLike = async (req, res) => {
    const user_id = req.user_id;
    const blog_id = req.params.blog_id;
    try {
        const blog = await Blog.findOne({_id: blog_id});
        let blogLikes = blog.likes;
        if (!blogLikes.includes(user_id)) {
            return res.status(400).json({error: "user has not liked this blog"});
        }
        blogLikes = blogLikes.filter(user => user.toString() !== user_id);
        console.log(blogLikes)
        update(res, blog_id, {likes: blogLikes});
    }
    catch(error) {
        res.status(400).json({error: error.message});
    }
}


// Comments

const createComment = async (req, res) => {
    const user_id = req.user_id;
    const blog_id = req.params.id;
    const {body} = req.body; 
    if (body.trim().length == 0) {
        return res.status(400).json({error: "comment cannot be empty"});
    }
    try {
        const user = await User.findById(user_id);
        const user_name = user.username;
        const blog = await Blog.findOne({_id: blog_id});
        console.log(blog)
        const oldcomments = blog.comments;
        oldcomments.push({body, author: user_name});
        update(res, blog_id, {comments: oldcomments});
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

const updateComment = async (req, res) => {
    const user_id = req.user_id;
    const {blog_id, comment_id}  = req.params;
    const {body} = req.body;
    if (body.trim().length == 0) {
        return res.status(400).json({error: "comment cannot be empty"});
    }
    try {
        const user = await User.findById(user_id);
        const user_name = user.username;
        const blog = await Blog.findById(blog_id);
        const comment = blog.comments.id(comment_id);
        if (user_name == comment.author) {
            comment["body"] = body;  
            await blog.save(); 
            console.log("comment updated!");
            res.status(200).json({data: comment});
        }
        else {
            res.status(403).json({error: "user not authorized to update this comment"});
        }
    } catch(error) {
        res.status(400).json({error: error.message}); 
    }
}

const deleteComment = async (req, res) => {
    const {blog_id, comment_id}  = req.params;
    const {user_id, isAdmin} = req;
    try {
        const user = await User.findById(user_id);
        const blog = await Blog.findById(blog_id);
        const comment = blog.comments.id(comment_id);
        if (user.username == comment.author || user.username == blog.author || isAdmin) {
            comment.deleteOne();
            await blog.save(); 
            console.log("comment deleted!");
            res.status(200).json({data: comment});
        } else {
            res.status(403).json({error: "user not authorized to delete this comment"});
        }
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}


module.exports = {
    getBlogs, getBlogById, createBlog, updateBlog, 
    deleteBlog, createComment, updateComment, deleteComment, getBlogsByUserId, 
    addLike, removeLike, getMostLikedBlogs, getTrendingBlogs};