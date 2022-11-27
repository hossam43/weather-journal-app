// Setup empty JS object to act as endpoint for all routes
let projectData = {};
// Require Express to run server and routes
const express = require("express");
const app = express();

// Start up an instance of app

/* Middleware*/
const bodyParser = require("body-parser");
//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.json());
// Cors for cross origin allowance
const cors = require("cors");
app.use(cors());
// Initialize the main project folder
app.use(express.static("website"));
// Setup Server
const port = 5000;
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
//req res not res req
app.post("/addweather", function (req, res) {
  //add your data in the project using object notation
  projectData = req.body;
  console.log(req.body);
  res.send(projectData);
  res.end();
});

app.get("/getweather", (req, res) => {
  // console.log(projectData);
  res.send(projectData);
});
