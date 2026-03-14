const express = require('express');
const router = express.Router();
const {
        getPendingStudents,
        approveStudent,
        rejectStudent,
        blockStudent,
        unblockStudent
    } = require('../controllers/librarianStudentController');

router.get("/pending-students",getPendingStudents);

router.put("/approve/:id",approveStudent);

router.put("/reject/:id",rejectStudent);

router.put("/block/:id",blockStudent);

router.put("/unblock/:id",unblockStudent);

module.exports = router;