const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

//pbkdf2 hashing algorithm is implementing in this website

const userSchema = Schema({
    email :{
        type : String,
        required : true,
    }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
