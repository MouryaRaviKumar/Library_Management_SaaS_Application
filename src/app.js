const express = require('express');
const app = express();
const start = require('./config/start');
const authRoutes = require("./routes/authRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");
const protected = require("./middleware/authMiddleware.js");

app.use(express.json());
app.use(express.urlencoded({extended : true}));

app.use("/api/auth",authRoutes);
app.use("/api/admin",protected,adminRoutes);

app.use((req,res)=>{
    res.status(404).json({ message : "Route not found "});
});

start(app);