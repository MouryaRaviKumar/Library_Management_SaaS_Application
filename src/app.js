const express = require('express');
const app = express();
const start = require('./config/start');
const authRoutes = require("./routes/authRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");
const bookRoutes = require("./routes/bookRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const librarianStudentRoutes = require("./routes/librarianStdentRoutes.js");
const protected = require("./middleware/authMiddleware.js");
const adminOnly = require("./middleware/adminOnly.js");

app.use(express.json());
app.use(express.urlencoded({extended : true}));

app.use("/api/auth", authRoutes );
app.use("/api/admin", protected ,adminOnly, adminRoutes );
app.use("/api/books", protected , bookRoutes );
app.use("/api/user", protected, userRoutes );

//Librarian Student Management Routes
app.use("/api/librarian", librarianStudentRoutes );

app.use((req,res)=>{
    res.status(404).json({ message : "Route not found "});
});

start(app);