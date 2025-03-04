const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const DBConnect = require("./config/database.js");
require("dotenv").config();
const router = require("./routes/apiRoutes.js");

const app = express();

DBConnect();

const corsOptions = {
  origin: "http://127.0.0.1:3000",
  optionsSuccessStatus: 200,
};
app.use(
  cors({
    origin: "http://127.0.0.1:3000",
    optionsSuccessStatus: 200,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/hospital", router);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

//exporting app for testing
module.exports = app;
