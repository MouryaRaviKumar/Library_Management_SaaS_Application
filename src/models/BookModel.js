const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
    libraryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Library",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    publicationDate: {
        type: Date,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    isLost : {
        type : Boolean,
        default : false,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Book", bookSchema);