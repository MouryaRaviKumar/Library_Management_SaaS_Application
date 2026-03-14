const mongoose = require('mongoose');

const borrowSchema = new mongoose.Schema({
    libraryId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Library",
        required: true
    },
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    book : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    borrowDate: {
        type: Date,
        default: Date.now,
    },
    returnDate: {
        type: Date,
        default: () => Date.now() + 14 * 24 * 60 * 60 * 1000
    },
    isReturned: {
        type: Boolean,
        default: false
    },
    isLost : {
        type : Boolean,
        default : false
    }
});

module.exports = mongoose.model('Borrow', borrowSchema);