const mongoose = require('mongoose');

const borrowSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    book: {
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
        default : Date.now + 14*24*60*60*1000
    },
    isReturned: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Borrow', borrowSchema);