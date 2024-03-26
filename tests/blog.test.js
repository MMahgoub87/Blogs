require("dotenv").config();
const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");
const User = require("../models/User");
const Blog = require("../models/Blog");

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_TEST_URI);
    await User.deleteMany({});
    await Blog.deleteMany({});
});

afterAll(async () => {
    await User.deleteMany({});
    await Blog.deleteMany({});
    await mongoose.connection.close();
});

describe("GET /blogs", () => {
    it("should return all blogs", async () => {
        const res = await request(app).get("/blogs");
        expect(res.statusCode).toBe(200);
        expect(res.body.data.length).toEqual(0);
    });
});

describe("Auth routes", () => {
    let token = "";
    beforeAll(async () => {
        const res = await request(app)
            .post("/users/signup")
            .send({
                username: "MahmoudTest",
                email: "mahmoud@test.com",
                password: "123456",
                birthYear: 2002
            });
        token = res.headers["set-cookie"];
    })

    describe("Create blog", () => {
        it("should create a new blog", async () => {
            const res = await request(app)
                .post("/blogs")
                .set("Cookie", token)
                .send({
                    title: "Jest Blog",
                    body: "This mock blog was created from the test framework"
                })
            expect(res.statusCode).toBe(201);
            expect(res.body.data.title).toBe("Jest Blog");
            expect(res.body.data.body).toBe("This mock blog was created from the test framework");
        })
    })

    describe("Update blog", () => {
        let blogId;
        beforeAll(async () => {
            const blog = await Blog.find({});
            blogId = blog[0]._id;
        })
        
        it("should update an existing blog", async () => {
            const res = await request(app)
                .patch(`/blogs/${blogId}`)
                .set("Cookie", token)
                .send({
                    title: "Jest Blog_updated",
                    body: "This mock blog was created from the test framework_updated"
                })
            expect(res.statusCode).toBe(200);
            expect(res.body.data.title).toBe("Jest Blog_updated");
            expect(res.body.data.body).toBe("This mock blog was created from the test framework_updated");
        })
    })

    describe("Delete blog", () => {
        let blogId;
        beforeAll(async () => {
            const blog = await Blog.find({});
            blogId = blog[0]._id;
        })

        it("should delete an existing blog", async () => {
            const res = await request(app)
                .delete(`/blogs/${blogId}`)
                .set("Cookie", token);
            expect(res.statusCode).toBe(200);
            expect(res.body.data.title).toBe("Jest Blog_updated");
            expect(res.body.data.body).toBe("This mock blog was created from the test framework_updated");
        })
    })
})

