const express = require("express");
const bodyParser = require("body-parser");
const app = express();

//call user defined imports
const admin = require("./routes/api/admin");
const user = require("./routes/api/user");
const company = require("./routes/api/company");

// use middlewares
app.use(express.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

// sample test route
app.get("/", (req, res) => {
  console.log("Get Request Successful");
  res.send("Get Route Working");
});

app.use("/api/admin", admin);
app.use("/api/user", user);
app.use("/api/company", company);
//start server.
const PORT = 3000 || process.env.PORT;
app.listen(PORT, (req, res, next) => {
  console.log(`Server started at ${PORT}`);
});
