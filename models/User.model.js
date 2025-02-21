const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    birthDate: {
        type: Date,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password : {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["doctor","patient","admin"],
        required:  true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    gender:{
        type: String,
        enum:["M","F"],
        required:true
    },
    image: {
        type: String
    }
});


const doctorSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    expertiseLevel: [{type: String, required: true}] 
})

const User = mongoose.model('User', userSchema);
const Doctor = mongoose.model('Doctor', doctorSchema);


module.exports = {
    User,
    Doctor
};