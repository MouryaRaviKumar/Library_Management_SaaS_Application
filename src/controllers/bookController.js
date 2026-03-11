const Book = require("../models/BookModel");
const Library = require("../models/LibraryModel");
const asyncHandler = require("express-async-handler");

// Description      To View all books available in the library
// Method           GET
// API Endpoint     /api/books
const allBooks = asyncHandler(async (req, res) => {

    const books = await Book
        .find({ libraryId: req.user.libraryId })
        .select("title author genre publicationDate isAvailable")
        .lean();

    res.status(200).json(books);
});

// Description      To view details of a specific book by its ID
// Method           GET
// API Endpoint     /api/books/:id
const getBookById = asyncHandler(async (req, res) => {
    const book = await Book.findOne({
        _id: req.params.id,
        libraryId: req.user.libraryId
    })
    .select("title author genre publicationDate isAvailable")
    .lean();

    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json(book);
});

// Description      To search for books by title
// Method           GET
// API Endpoint     /api/books/search?query=bookName
const searchBook = asyncHandler(async (req, res) => {
    const query = req.query.query?.trim();

    if (!query) {
        return res.status(400).json({ message: "Search query is required" });
    }

    const books = await Book.find({
        libraryId: req.user.libraryId,
        title: { $regex: query, $options: "i" }
    })
    .select("title author genre publicationDate isAvailable")
    .lean();

    res.status(200).json(books);
});

// Description      To view all available books in the library
// Method           GET
// API Endpoint     /api/books/available
const availableBooks = asyncHandler(async (req, res) => {
    
    const books = await Book.find({
        libraryId: req.user.libraryId,
        isAvailable: true
    })
    .select("title author genre publicationDate")
    .lean();

    res.status(200).json(books);
});

module.exports = {
    allBooks,
    getBookById,
    searchBook,
    availableBooks
};