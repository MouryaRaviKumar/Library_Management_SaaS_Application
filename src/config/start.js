const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const port = process.env.PORT || 5000;

const start = async(app) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        app.listen(port,() =>{
            console.log(`Server is running on port ${port}`);
        })
    }catch(err){
        console.error('Failed to connect to MongoDB', err);
    }
}

module.exports = start;