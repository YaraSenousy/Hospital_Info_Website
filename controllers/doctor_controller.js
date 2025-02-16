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

    },

    getDoctors: async (req, res) => {
        try {
            const allowedFilters = ['name', 'PhoneNumber', 'expertiseLevel','birthDate', 'email']; // List of allowed query parameters
            const filter = {};
            
            for (const key of allowedFilters) {
              if (req.query[key]) {
                filter[key] = req.query[key];
              }
            }
    
            // allow data to be paginated
            const page = parseInt(req.query.page);
            const limit = parseInt(req.query.limit);
            let doctors;
            if (page && limit){
                doctors = await Doctor.find(filter)
                .skip((page - 1) * limit)
                .limit(limit);
            }
            else{
                doctors = await Doctor.find(filter)
            }
            res.json(doctors);
          } catch (err) {
            res.status(500).json({ error: err.message });
          }
    }
};

module.exports = doctorController;