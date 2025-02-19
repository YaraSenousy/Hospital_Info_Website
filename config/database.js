const mongoose = require('mongoose');

const DBConnect = async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGO_URI_TESTING}`);
        console.log('MongoDB Connected');
    }
    catch (err){
        console.error('MongoDB Connection Error: ',err);
        process.exit(1);
    }
}

module.exports = DBConnect;