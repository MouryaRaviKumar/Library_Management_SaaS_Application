const express = require("express");
const router = express.Router();
const { 
        createLibrary , 
        getLibraryDetails , 
        updateLibrary,
        deactivateLibrary,
        createLibrarian,
        getAllLibrarians,
        blockUserOrLibrarian,
        unblockUserOrLibrarian,
        getAllUsers,
        getUserDetails,
        deleteUser
    } = require("../controllers/adminController");

//Description       Create a library
//Method            POST
//Endpoint          /api/admin/library
router.post("/library", createLibrary );

//Description       Get my library details
//Method            GET
//Endpoint          /api/admin/library
router.get("/api/admin/library", getLibraryDetails );

//Description       Update Library details
//Method            PUT
//Endpoint          /api/admin/library
router.put("/library", updateLibrary );

//Description       Deactivate Library
//Method            PUT
//Endpoint          /api/admin/deactivate
router.put("/deactivate", deactivateLibrary);

//Description       Create a Librarian
//Method            POST
//Endpoint          /api/admin/librarian
router.post("/librarian", createLibrarian);

//Description       Get details of all Librarians
//Method            GET
//Endpoint          /api/admin/librarians
router.get("/librarians", getAllLibrarians);

//Description       Block a user/librarian 
//Method            PUT
//Endpoint          /api/admin/:id/block
router.put("/:id/block", blockUserOrLibrarian);

//Description       Unblock a user/librarian 
//Method            PUT
//Endpoint          /api/admin/:id/unblock
router.put("/:id/unblock", unblockUserOrLibrarian);

//Description       Get all users of the library
//Method            GET
//Endpoint          /api/admin/users
router.get("/users", getAllUsers);

//Description       Get particular user details
//Method            GET
//Endpoint          /api/admin/users/:id
router.get("/users/:id", getUserDetails);

//Description       Delete a user
//Method            DELETE
//Endpoint          /api/admin/users/:id
router.delete("/users/:id", deleteUser);

module.exports = router;