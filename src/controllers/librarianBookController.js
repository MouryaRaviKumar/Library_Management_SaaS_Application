const asyncHandler = require("express-async-handler");
const User = require("../models/UserModel")
const Borrow = require("../models/BorrowModel");
const Book = require("../models/BookModel");
const Fine = require("../models/fineModel");

//Description       Issue a book to a student
//Method            POST
//Endpoint          /api/librarian/borrow
const borrowBook = asyncHandler(async (req, res) => {

    const { studentId, bookId } = req.body;

    if (!studentId || !bookId) {
        return res.status(400).json({
            message: "Student ID and Book ID are required"
        });
    }

    const student = await User.findById(studentId);
    if (!student) {
        return res.status(404).json({ message: "Student not found" });
    }

    const book = await Book.findById(bookId);
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (book.libraryId.toString() !== req.user.libraryId.toString()) {
        return res.status(403).json({
            message: "You cannot borrow books from another library"
        });
    }

    if (!book.isAvailable) {
        return res.status(400).json({ message: "Book is not available" });
    }

    if (book.isLost) {
        return res.status(400).json({
            message: "This book is marked as lost"
        });
    }

    const borrow = await Borrow.create({
        libraryId : req.user.libraryId,
        user: studentId,
        book: bookId
    });

    book.isAvailable = false;
    await book.save();

    res.status(201).json({
        success: true,
        message: "Book issued successfully",
        borrow
    });

});

// Description       Get active borrows
// Method            GET
// Endpoint          /api/librarian/borrows
const activeBorrows = asyncHandler(async (req, res) => {

    const borrows = await Borrow.find({
        libraryId : req.user.libraryId,
        isReturned: false
    })
    .populate("user", "name email")
    .populate("book", "title author")
    .sort({ borrowDate: -1 });

    res.status(200).json({
        count: borrows.length,
        borrows
    });

});

// Description       Return a Book
// Method            PUT
// Endpoint          /api/librarian/return/:id
const returnBook = asyncHandler(async (req, res) => {

    const borrowId = req.params.id;

    if (!borrowId) {
        return res.status(400).json({
            message: "Borrow ID is required"
        });
    }

    const borrow = await Borrow.findOne({
            _id: borrowId,
            libraryId: req.user.libraryId
        })
        .populate("user")
        .populate("book");

    if (!borrow) {
        return res.status(404).json({
            message: "Borrow record not found"
        });
    }

    if (borrow.isReturned) {
        return res.status(400).json({
            message: "Book already returned"
        });
    }

    borrow.isReturned = true;

    const book = borrow.book;

    if (book) {
        book.isAvailable = true;
        await book.save();
    }

    // check late return
    if (new Date() > borrow.returnDate) {

        const daysLate = Math.ceil(
            (Date.now() - borrow.returnDate) / (1000 * 60 * 60 * 24)
        );

        const fineAmount = daysLate * 50;

        await Fine.create({
            user: borrow.user,
            amount: fineAmount,
            reason: "Late return",
            paid: false
        });
    }

    await borrow.save();

    res.status(200).json({
        message: "Book returned successfully"
    });

});

//Description       Mark fine as paid
//Method            PUT
//Endpoint          /api/librarian/paid/:id
const finePaid = asyncHandler(async(req,res)=>{
    const fineId = req.params.id;
    const fine = await Fine.findOne({
        _id: fineId,
        libraryId: req.user.libraryId
    });

    if (!fine) {
        return res.status(404).json({
            message: "Fine not found"
        });
    }

    if (fine.paid) {
        return res.status(400).json({
            message: "Fine already paid"
        });
    }

    fine.paid = true;
    await fine.save();

    res.status(200).json({
        message: "Fine paid successfully"
    });

});

// Description   Mark book as lost
// Method        PUT
// Endpoint      /api/librarian/lost/:id
const bookLost = asyncHandler(async (req, res) => {
    const borrowId = req.params.id;
    const borrow = await Borrow.findOne({
        _id: borrowId,
        libraryId: req.user.libraryId
    });

    if (!borrow) {
        return res.status(404).json({ message: "Borrow record not found" });
    }

    const book = await Book.findById(borrow.book);

    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (borrow.isLost) {
        return res.status(400).json({
            message: "Book already marked as lost"
        });
    }

    // Mark as lost
    borrow.isLost = true;
    borrow.isReturned = true;
    book.isLost = true;
    book.isAvailable = false;

    await borrow.save();
    await book.save();

    const existingFine = await Fine.findOne({
        user: borrow.user,
        reason: "Lost the book",
        paid: false
    });

    if (!existingFine) {
        await Fine.create({
            user: borrow.user,
            amount: 500,
            reason: "Lost the book",
            paid: false
        });
    }

    res.status(200).json({
        message: "Book marked as lost and fine created"
    });

});

//Description       Get all lost Books
//Method            GET
//Endpoint          /api/librarian/lost-books
const  lostBooks = asyncHandler(async(req,res)=>{
    const lostBooksList = await Book.find({
        libraryId: req.user.libraryId,
        isLost : true 
    })
    .populate("libraryId", "name")
    .sort({ updatedAt: -1 });

    res.status(200).json({
        count: lostBooksList.length,
        lostBooks: lostBooksList
    });
});

// Description       Add new book
// Method            POST
// Endpoint          /api/librarian/books
const addBook = asyncHandler(async (req, res) => {

    const { title, author, publicationDate, genre } = req.body;

    if (!title || !author || !publicationDate || !genre) {
        return res.status(400).json({
            message: "Title, author, publication date and genre are required"
        });
    }

    const book = await Book.create({
        libraryId: req.user.libraryId,
        title,
        author,
        publicationDate,
        genre
    });

    res.status(201).json({
        message: "Book added successfully",
        book
    });

});

// Description       Update book
// Method            PUT
// Endpoint          /api/librarian/books/:id
const updateBook = asyncHandler(async (req, res) => {

    const bookId = req.params.id;

    const book = await Book.findOne({
        _id: bookId,
        libraryId: req.user.libraryId
    });

    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    const { title, author, publicationDate, genre } = req.body;

    if (title) book.title = title;
    if (author) book.author = author;
    if (publicationDate) book.publicationDate = publicationDate;
    if (genre) book.genre = genre;

    await book.save();

    res.status(200).json({
        message: "Book updated successfully",
        book
    });

});

// Description       Delete book
// Method            DELETE
// Endpoint          /api/librarian/books/:id
const deleteBook = asyncHandler(async (req, res) => {

    const bookId = req.params.id;

    const book = await Book.findOne({
        _id: bookId,
        libraryId: req.user.libraryId
    });

    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    if (book.isLost) {
        return res.status(400).json({
            message: "Lost books cannot be deleted"
        });
    }

    const activeBorrow = await Borrow.findOne({
        book: bookId,
        isReturned: false
    });

    if (activeBorrow) {
        return res.status(400).json({
            message: "Cannot delete a book that is currently borrowed"
        });
    }

    await book.deleteOne();

    res.status(200).json({
        message: "Book deleted successfully"
    });

});


module.exports = {
    borrowBook,
    activeBorrows,
    returnBook,
    finePaid,
    bookLost,
    lostBooks,
    addBook,
    updateBook,
    deleteBook
};
