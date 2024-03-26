require("dotenv").config();
const mongoose = require("mongoose");
const PORT = process.env.PORT;
const app = require("./app");

mongoose.connect(process.env.MONGO_PROD_URI)
    .then(()=>{
        app.listen(PORT, err => {
            if (err) console.log(err);
            console.log(`Server has started on PORT ${PORT}...`);
        });
    })
    .catch(error => {
        console.log(error);
    })