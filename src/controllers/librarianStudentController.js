const asyncHandler = require("express-async-handler");
const mongoose = require('mongoose');
const User = require('../models/UserModel');


//Description       Get approval pending students
//Method            GET
//Endpoint          /api/librarian/pending-students
const getPendingStudents = asyncHandler(async(req,res)=>{

    const pendingStudents = await User.find({
        role : "student",
        status : "pending" , 
        libraryId : req.user.libraryId
    }).select("-password");

    res.status(200).json({
        count: pendingStudents.length,
        students: pendingStudents
    });
});

//Description       Approve student by id
//Method            PUT
//Endpoint          /api/librarian/approve/:id
const approveStudent = asyncHandler(async(req,res)=>{
    const studentId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        res.status(400);
        throw new Error("Invalid student ID");
    }

    const student = await User.findOne({
        _id : studentId,
        role : "student",
        libraryId : req.user.libraryId
    });

    if(!student){
        res.status(404);
        throw new Error("Student not found");
    }

    if(student.status !== "pending"){
        res.status(400);
        throw new Error("Student is not in pending status");
    }

    student.status = "approved";

    await student.save();

    res.status(200).json({
        message : "Student approved successfully"
    });
});

//Description       Reject a student
//Method            PUT
//Endpoint          /api/librarian/reject/:id
const rejectStudent = asyncHandler(async(req,res)=>{
    const studentId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        res.status(400);
        throw new Error("Invalid student ID");
    }

    const student = await User.findOne({
        _id : studentId,
        role : "student",
        libraryId : req.user.libraryId
    });

    if(!student){
        res.status(404);
        throw new Error("Student not found");
    }

    if(student.status !== "pending"){
        res.status(400);
        throw new Error("Only pending students can be rejected");
    }

    student.status = "rejected";

    await student.save();

    res.status(200).json({
        message : "Student rejected successfully"
    });

});

//Description       block a student
//Method            PUT
//Endpoint          /api/librarian/block/:id
const blockStudent = asyncHandler(async(req,res)=>{
    
    const studentId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        res.status(400);
        throw new Error("Invalid student ID");
    }

    const student = await User.findOne({
        _id : studentId,
        role : "student",
        libraryId : req.user.libraryId
    });

    if(!student){
        res.status(404);
        throw new Error("Student not found");
    }

    if(student.status !== "approved"){
        res.status(400);
        throw new Error("Only approved students can be blocked");
    }

    student.status = "blocked";

    await student.save();

    res.status(200).json({
        message : "Blocked student successfully"
    });

});

//Description       Unblock a student
//Method            PUT
//Endpoint          /api/librarian/unblock/:id

const unblockStudent = asyncHandler(async (req, res) => {

    const studentId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        res.status(400);
        throw new Error("Invalid student ID");
    }

    const student = await User.findOne({
        _id: studentId,
        role: "student",
        libraryId: req.user.libraryId
    });

    if (!student) {
        res.status(404);
        throw new Error("Student not found");
    }

    if (student.status !== "blocked") {
        res.status(400);
        throw new Error("Only blocked students can be unblocked");
    }

    student.status = "approved";

    await student.save();

    res.status(200).json({
        message: "Student unblocked successfully"
    });

});


module.exports = {

    getPendingStudents,
    approveStudent,
    rejectStudent,
    blockStudent,
    unblockStudent

}