const {User, Doctor} = require("../models/User.model")

const patientController = {
    removePatient: async (req, res) => {
        try{
            const patient = await User.findByIdAndDelete(req.user._id);
            patient ? res.json(patient) : res.status(404).json({error: "Couldn't find the doctor"});
        }
        catch(err){
            res.status(500).json({error: err.message});
        }

    }
};

module.exports = patientController;