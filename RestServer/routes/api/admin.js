const express = require("express");
const router = express.Router();
const enrollAdmin = require("../../methods/enrollAdmin");

router.post("/", async (req, res) => {
  console.info("Admin route called");
  const json = {};
  enrollAdmin()
    .then(() => {
      json.code = 200;
      json.Message = "Admin enrolled successfully";
      res.status(200).send(json);
    })
    .catch((error) => {
      console.log(error);
      json.code = 500;
      json.Message = "Some error has occured";
      res.status(500).send(json);
    });
});

module.exports = router;
