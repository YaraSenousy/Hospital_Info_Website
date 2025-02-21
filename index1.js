const express = require('express');
const cookieParser = require('cookie-parser');
const DBConnect = require('./config/database.js')
require('dotenv').config();
const router = require('./routes/apiRoutes.js');



const app = express();

DBConnect();

app.use(express.json());
app.use(cookieParser());
app.use('/hospital', router);

const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log(`Server running on port ${port}`);
});

//exporting app for testing
module.exports = app;