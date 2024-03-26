require("dotenv").config();
const express = require("express");
const blogRouter = require("./routers/blogRouter");
const userRouter = require("./routers/userRouter");
const cookieParser = require("cookie-parser");
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
})
app.get("/", (req, res) => {
    res.status(200).send("Hello World");
})

app.use("/blogs", blogRouter);
app.use("/users", userRouter);

module.exports = app
