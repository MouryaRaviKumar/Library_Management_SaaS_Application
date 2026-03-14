const express = require("express");
const router = express.Router();
const {
    
    borrowBook,
    activeBorrows,
    returnBook,
    finePaid,
    bookLost,
    lostBooks,
    addBook,
    updateBook,
    deleteBook

} = require("../controllers/librarianBookController");

//Description       Issue a book to a student
//Method            POST
//Endpoint          /api/librarian/borrow
router.post("/borrow", borrowBook );

//Description       Get active borrows
//Method            GET
//Endpoint          /api/librarian/borrows
router.get("/borrows", activeBorrows );

//Description       Return a Book
//Method            PUT
//Endpoint          /api/librarian/return/:id
router.put("/return/:id", returnBook );

//Description       Mark fine as paid
//Method            PUT
//Endpoint          /api/librarian/paid/:id
router.put("/paid/:id", finePaid );

//Description       Mark book as lost
//Method            PUT
//Endpoint          /api/librarian/lost/:id
router.put("/lost/:id" , bookLost );

//Description       Get all lost Books
//Method            GET
//Endpoint          /api/librarian/lost-books
router.get("/lost-books " , lostBooks );

// Description       Add new book
// Method            POST
// Endpoint          /api/librarian/books
router.post("/books " , addBook );


// Description       Update book
// Method            PUT
// Endpoint          /api/librarian/books/:id
router.put("/books/id " , updateBook );

// Description       Delete book
// Method            DELETE
// Endpoint          /api/librarian/books/:id
router.delete("/books/:id", deleteBook );

module.exports = router;