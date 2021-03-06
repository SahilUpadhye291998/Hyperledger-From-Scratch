const express = require("express");
const router = express.Router();

const user = require("../../methods/user");

//@route    POST api/user/registerUser
//@desc     To generate User credentials
//@access   PUBLIC
router.post("/registerUser", async (req, res) => {
  console.log("OK");
  const secretUserName = req.body.secretUsername;
  const userOrg = req.body.orgName;
  const json = {};
  user
    .registerUser(secretUserName, userOrg)
    .then(() => {
      json.code = 200;
      json.Message = "User enrolled successfully";
      res.status(200).send(json);
    })
    .catch((error) => {
      console.log(error);
      json.code = 500;
      json.Message = "Some error has occured";
      res.status(500).send(json);
    });
});

//@route    POST api/user/login
//@desc     Login User with credentials from Blockchain
//@access   PUBLIC
router.post("/login", (req, res) => {
  console.log(req.body.secretUsername);
  const secretUserName = req.body.secretUsername;
  const userName = req.body.username;
  const userPassword = req.body.userPassword;
  const json = {};
  user
    .readUserByOwnerAndPassword(secretUserName, userName, userPassword)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((error) => {
      console.log(error);
      json.code = 500;
      json.data = "Some error has occured";
      res.status(500).send(json);
    });
});

//@route    POST api/user/signup
//@desc     Signup User credentials from Blockchain
//@access   PUBLIC
router.post("/signup", (req, res) => {
  console.log(req.body.secretUsername);
  const secretUserName = req.body.secretUsername;
  const userName = req.body.username;
  const userAddress = req.body.userAddress;
  const userMobile = req.body.userMobile;
  const userSecret = req.body.userPassword;
  const userAmount = req.body.userAmount;
  const userPremiumAmount = req.body.userPremiumAmount;
  const json = {};
  user
    .initUser(
      secretUserName,
      userName,
      userAddress,
      userMobile,
      userSecret,
      userAmount,
      userPremiumAmount
    )
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((error) => {
      console.log(error);
      json.code = 500;
      json.data = "Some error has occured";
      res.status(500).send(json);
    });
});

//@route    POST api/user/payPremium
//@desc     Pay the premium to the company
//@access   PUBLIC
router.post("/payPremium", (req, res) => {
  console.log(req.body.secretUsername);
  const secretUserName = req.body.secretUsername;
  const companyName = req.body.companyName;
  const userName = req.body.username;
  const premiumAmount = req.body.premiumAmount;
  const json = {};
  user
    .payPremiumByUserName(secretUserName, companyName, userName, premiumAmount)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((error) => {
      console.log(error);
      json.code = 500;
      json.data = "Some error has occured";
      res.status(500).send(json);
    });
});

//@route    POST api/user/getUser
//@desc     To read the user from the database
//@access   PUBLIC
router.post("/getUser", (req, res) => {
  console.log(req.body.secretUsername);
  const secretUserName = req.body.secretUsername;
  const userName = req.body.username;
  const json = {};
  user
    .readUser(secretUserName, userName)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((error) => {
      console.log(error);
      json.code = 500;
      json.data = "Some error has occured";
      res.status(500).send(json);
    });
});

//@route    POST api/user/getUserHistory
//@desc     Transaction history of the user
//@access   PUBLIC
router.post("/getUserHistory", (req, res) => {
  console.log(req.body.secretUsername);
  const secretUserName = req.body.secretUsername;
  const userName = req.body.username;
  const json = {};
  user
    .readUserHistory(secretUserName, userName)
    .then((result) => {
      json.code = 200;
      json.data = result;
      res.status(200).send(json);
    })
    .catch((error) => {
      console.log(error);
      json.code = 500;
      json.data = "Some error has occured";
      res.status(500).send(json);
    });
});

module.exports = router;
