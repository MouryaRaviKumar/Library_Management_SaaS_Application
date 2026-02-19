const mongoose = require("mongoose");

const librarySchema = new mongoose.Schema({
    adminId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Admin",
        required : true
    },
    name : {
        type : String,
        required : true
    },
    slug : {
        type : String,
        required : true,
        unique : true
    }, 
    address : {
        type : String,
        required : true
    },
    contactNumber : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true
    },
    isActive : {
        type : Boolean,
        enum : [true , false],
        default : true
    },
    fine : {
        type : Number,
        default : 50
    },
    lostFine : {
        type : Number,
        default : 500
    },
    createdAt : {
        type : Date,
        default : Date.now
    },
    updatedAt : {
        type : Date,
        default : Date.now
    }
});

module.exports = mongoose.model("Library",librarySchema);