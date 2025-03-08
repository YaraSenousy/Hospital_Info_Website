const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const DBConnect = require("./config/database.js");
require("dotenv").config();
const router = require("./routes/apiRoutes.js");

const app = express();

DBConnect();


app.use(
  cors({
    origin: "http://127.0.0.1:3000",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Set-Cookie"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  })
);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.use(express.json());
app.use(cookieParser());
app.use("/hospital", router);
app.options("*", cors());
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

//exporting app for testing
module.exports = app;
