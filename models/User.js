const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { isEmail} = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: [true, "Please enter email"],
        unique: true,
        lowercase: true,
        validate: [isEmail, "Please enter a valid email"]
    },
    password: {
        type: String,
        required: [true, "Please enter password"],
        minLength: [6, "Minimum length is 6 characters"]
        
    },
    birthYear: {
        type: Number,
        required: [true, "Please enter birth year"]
    },
    role: {
        type: String,
        required: [true, "please enter user role"]
    }
}, { timestamps: true })

userSchema.post("save", (doc, next) => {
    console.log("new user was created and saved", doc);
    next();
})

userSchema.pre("save", async function (next) {
    const salt = await bcrypt.genSalt();
    console.log(this);
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

userSchema.statics.login = async function(email, password) {
    const user = await this.findOne({email});
    if (user) {
        const auth = await bcrypt.compare(password, user.password)
        if (auth) {
            return user;
        }
        throw Error("incorrect email or password");
    }
    throw Error("incorrect email or password")
}

module.exports = mongoose.model("User", userSchema)