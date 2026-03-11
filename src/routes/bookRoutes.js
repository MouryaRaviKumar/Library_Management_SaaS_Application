const express = require('express');
const router = express.Router();
const { allBooks , getBookById , searchBook , availableBooks } = require("../controllers/bookController");  

// Description      To search for books by title
// Method           GET
// API Endpoint     /api/books/search?query=bookName
router.get("/search" , searchBook );

// Description      To view all available books in the library
// Method           GET
// API Endpoint     /api/books/available
router.get("/available" , availableBooks );

// Description      To View all books available in the library
// Method           GET
// API Endpoint     /api/books
router.get("/", allBooks);

// Description      To view details of a specific book by its ID
// Method           GET
// API Endpoint     /api/books/:id
router.get("/:id", getBookById);

module.exports = router;