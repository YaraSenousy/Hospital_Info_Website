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
        enum: ["student","teacher","manager"],
        required:  true
    },
    phoneNumber: {
        type: String,
        required: true
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