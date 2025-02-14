const mongoose = require('mongoose');

const DBConnect = async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGO_URI}`);
        console.log('MongoDB Connected');
    }
    catch (err){
        console.error('MongoDB Connection Error: ',error);
        process.exit(1);
    }
}

module.exports = DBConnect;