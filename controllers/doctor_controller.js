const {User, Doctor} = require("../models/User.model")

const doctorController = {
    removeDoctor: async (req, res) => {
        try{
            const doctor = await Doctor.findByIdAndDelete(req.user._id);
            doctor ? res.json(doctor) : res.status(404).json({error: "Couldn't find the doctor"});
        }
        catch(err){
            res.status(500).json({error: err.message});
        }

    }
};

module.exports = doctorController;