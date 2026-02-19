const mongoose = require("mongoose");
const User = require("../models/UserModel");
const asyncHandler = require("express-async-handler");
const Library = require("../models/LibraryModel");
const bcrypt = require("bcryptjs");

//Description       Create a library
//Method            POST
//Endpoint          /api/admin/library
const createLibrary = asyncHandler(async(req,res)=>{
    const { name , slug , address , contactNumber , email } = req.body;
    
    if( !name || !slug || !address || !contactNumber || !email){
        return res.status(400).json({
            message: "Please provide all the required fields"
        });
    };

    const loweredEmail = email.toLowerCase();
    const loweredSlug = slug.toLowerCase();

    const emailExists = await Library.findOne({
        email: loweredEmail
    });

    if (emailExists) {
        return res.status(400).json({
        message: "Library with this email already exists"
        });
    }

    const libraryExists = await Library.findOne({ slug : loweredSlug });

    if(libraryExists){
        return res.status(400).json({
            message: "Library with the same slug already exists"
        });
    };

    const library = await Library.create({
        adminId : req.user._id,
        name,
        slug : loweredSlug,
        address,
        contactNumber,
        email : loweredEmail,
    });

    res.status(201).json({
        adminId : library.adminId,
        name : library.name,
        slug : library.slug,
        address : library.address,
        contactNumber : library.contactNumber,
        email : library.email
    });
});

//Description       Get my library details
//Method            GET
//Endpoint          /api/admin/library
const getLibraryDetails = asyncHandler(async(req,res)=>{
    const library = await getAdminLibrary(req.user._id);

    if(!library){
        return res.status(404).json({
            message: " Admin does not have an associated library ",
        });
    }

    res.status(200).json({
        Name : library.name,
        slug : library.slug,
        address : library.address,
        contactNumber : library.contactNumber,
        email : library.email,
        isActive : library.isActive
    })
});

//Description       Update Library details
//Method            PUT
//Endpoint          /api/admin/library
const updateLibrary = asyncHandler(async(req,res)=>{
    const { name , slug , address , contactNumber , email , fine , lostFine } = req.body;
    const library = await getAdminLibrary(req.user._id);

    if (!library) {
        return res.status(404).json({
            message: "Library not found",
        });
    }

    if(name !== undefined && name !== library.name ){
        library.name = name;
    }

    if (slug !== undefined && slug.toLowerCase() !== library.slug) {
        const loweredSlug = slug.toLowerCase();
        const slugExists = await Library.findOne({
            slug: loweredSlug,
            _id: { $ne: library._id },
        });
        if (slugExists) {
            return res.status(400).json({
                message: "Library with the same slug already exists",
            });
        }
        library.slug = loweredSlug;
    }

    if(address !== undefined && address !== library.address){
        library.address = address;
    }

    if(contactNumber !== undefined && contactNumber !== library.contactNumber){
        library.contactNumber = contactNumber;
    }

    if (email !== undefined && email.toLowerCase() !== library.email) {
        const loweredEmail = email.toLowerCase();
        const emailExists = await Library.findOne({
            email: loweredEmail,
            _id: { $ne: library._id },
        });
        if (emailExists) {
            return res.status(400).json({
                message: "Library with the same email already exists",
            });
        }
        library.email = loweredEmail;
    }
    
    if(fine !== undefined && fine !== library.fine){
        library.fine = Number(fine);
    }

    if(lostFine !== undefined && lostFine !== library.lostFine){
        library.lostFine = Number(lostFine);
    }

    await library.save();
    res.status(200).json({
        name: library.name,
        slug: library.slug,
        address: library.address,
        contactNumber: library.contactNumber,
        email: library.email,
        fine: library.fine,
        lostFine: library.lostFine,
    });
});

//Description       Deactivate Library
//Method            PUT
//Endpoint          /api/admin/deactivate
const deactivateLibrary = asyncHandler(async(req,res)=>{
    const library = await getAdminLibrary(req.user._id);

    if(!library){
        return res.status(404).json({
            message: "Library not found",
        });
    }

    if(!library.isActive) {
        return res.status(400).json({
            message: "Library is already deactivated",
        });
    }

    library.isActive = false;
    await library.save();
    res.status(200).json({ message : " Library deactivated "});
});  

//Description       Create a Librarian
//Method            POST
//Endpoint          /api/admin/librarian
const createLibrarian = asyncHandler(async(req,res)=>{
    const { name , email , password , address , mobile} = req.body;

    if( !name || !email || !password || !address || !mobile){
        return res.status(400).json({
            message: "Please provide all required fields",
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
        message: "Password must be at least 6 characters"
        });
    }

    const library = await getAdminLibrary(req.user._id);

    if (!library) {
        return res.status(400).json({
        message: "Create library first"
        });
    }

    const loweredEmail = email.toLowerCase();
    const exists = await User.findOne({
        email: loweredEmail,
        libraryId: library._id
    });
    
    if(exists){
        return res.status(400).json({
            message: "Librarian with the same email already exists",
        });
    }

    const hashedPassword = await bcrypt.hash(password,10);

    const librarian = await User.create({
        libraryId : library._id,
        name,
        email : loweredEmail,
        password : hashedPassword,
        address,
        mobile,
        role : "librarian",
    });

    res.status(201).json({
         _id : librarian._id,
        libraryId : librarian.libraryId,
        name : librarian.name,
        email : librarian.email,
        address : librarian.address,
        mobile : librarian.mobile,
        role : librarian.role,
        isActive : librarian.isActive
    });
});

//Description       Get details of all Librarians
//Method            GET
//Endpoint          /api/admin/librarians
const getAllLibrarians = asyncHandler(async(req,res)=>{
    const library = await getAdminLibrary(req.user._id);

    if (!library) {
        return res.status(400).json({
        message: "Create library first"
        });
    }

    const librarians = await User.find({
        libraryId: library._id,
        role: "librarian"
        })
        .select("-password")
        .lean();

    res.status(200).json(librarians);

});

//Description       Block a user/librarian 
//Method            PUT
//Endpoint          /api/admin/:id/block
const blockUserOrLibrarian = asyncHandler(async(req,res)=>{
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
            message: "Invalid user ID"
        });
    }

    const user = await User.findById(userId);
    const adminLibrary = await getAdminLibrary(req.user._id);

    if (!adminLibrary) {
        return res.status(400).json({
            message: "Admin does not have an associated library"
        });
    }

    if(!user || user.libraryId.toString() !== adminLibrary._id.toString()){
        return res.status(404).json({
            message: "User or librarian not found",
        });
    }

    if(!user.isActive){
        return res.status(400).json({
            message: "User or librarian is already blocked",
        });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
        message:
            user.role === "librarian"
                ? "Librarian blocked successfully"
                : "User blocked successfully"
    });
});

//Description       Unblock a user/librarian 
//Method            PUT
//Endpoint          /api/admin/:id/unblock
const unblockUserOrLibrarian = asyncHandler(async(req,res)=>{
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
            message: "Invalid user ID"
        });
    }

    const user = await User.findById(userId);
    const adminLibrary = await getAdminLibrary(req.user._id);

    if (!adminLibrary) {
        return res.status(400).json({
            message: "Admin does not have an associated library"
        });
    }

    if(!user || user.libraryId.toString() !== adminLibrary._id.toString()){
        return res.status(404).json({
            message: "User or librarian not found",
        });
    }

    if(user.isActive){
        return res.status(409).json({
            message: "User or librarian is already unblocked",
        });
    }

    user.isActive = true;
    await user.save();

    res.status(200).json({
        message:
            user.role === "librarian"
                ? "Librarian unblocked successfully"
                : "User unblocked successfully"
    });
});

//Description       Get all users of the library
//Method            GET
//Endpoint          /api/admin/users
const getAllUsers = asyncHandler(async(req,res)=>{
    const adminLibrary = await getAdminLibrary(req.user._id);
    
    if (!adminLibrary) {
        return res.status(400).json({
            message: "Admin does not have an associated library",
        });
    }

    const users = await User.find({ libraryId : adminLibrary._id , role : "user" })
        .select("-password")
        .lean();
    
    res.status(200).json( users ); 


});

//Description       Get particular user details
//Method            GET
//Endpoint          /api/admin/users/:id
const getUserDetails = asyncHandler(async(req,res)=>{
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
            message: "Invalid user ID",
        });
    }

const adminLibrary = await getAdminLibrary(req.user._id);

    if(!adminLibrary){
        return res.status(400).json({
            message: "Admin does not have an associated library",
        });
    }

    const user = await User.findOne({ _id : userId , libraryId : adminLibrary._id , role : "user" })
        .select("-password")
        .lean();

    if(!user){
        return res.status(404).json({
            message: "User not found",
        });
    }

    res.status(200).json(user);
});

//Description       Delete a user
//Method            DELETE
//Endpoint          /api/admin/users/:id
const deleteUser = asyncHandler(async(req,res)=>{
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
            message: "Invalid user ID"
        });
    }

    const adminLibrary = await getAdminLibrary(req.user._id);

    if(!adminLibrary){
        return res.status(400).json({
            message: "Admin does not have an associated library",
        });
    }

    const user = await User.findOneAndDelete({ _id : userId , libraryId : adminLibrary._id , role : "user" });

    if(!user){
        return res.status(404).json({
            message: "User not found",
        });
    }

    res.status(200).json({
        message: "User deleted successfully"
    });
});

module.exports = { 
            createLibrary, 
            getLibraryDetails, 
            updateLibrary, 
            deactivateLibrary,
            createLibrarian,
            getAllLibrarians,
            blockUserOrLibrarian,
            unblockUserOrLibrarian,
            getAllUsers,
            getUserDetails,
            deleteUser
        };

const getAdminLibrary = async (adminId) => {
  return await Library.findOne({ adminId });
};