const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    libraryId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Library"
    },
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true,
        trim : true,
        lowercase : true
    },   
    password : {
        type : String,
        required : true,
        minlength : 6
    },
    address : {
        type : String,
        required : true,
        trim : true,
    },
    mobile : {
        type : String,
        required : true,
        trim : true
    },
    role : {
        type : String,
        enum : ["student","librarian","admin"],
        default : "student"
    },
    status : {
        type : String,
        enum : ["pending","approved","rejected","blocked"],
        default : "pending"
    },
    createdAt : {
        type : Date,
        default : Date.now
    }
});

module.exports = mongoose.model("User",userSchema);