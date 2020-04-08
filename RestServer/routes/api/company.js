const express = require("express");
const router = express.Router();

const user = require("../../methods/company");

//@route    POST api/company/registerCompany
//@desc     To generate Company credentials
//@access   PUBLIC
router.post("/registerCompany", async (req, res) => {
  console.log(req.body.orgName);
  const secretCompanyName = req.body.secretCompanyName;
  const companyOrg = req.body.orgName;
  const json = {};
  user
    .registerCompany(secretCompanyName, companyOrg)
    .then(() => {
      json.code = 200;
      json.Message = "Company enrolled successfully";
      res.status(200).send(json);
    })
    .catch((error) => {
      console.log(error);
      json.code = 500;
      json.Message = "Some error has occured";
      res.status(500).send(json);
    });
});

//@route    POST api/company/signup
//@desc     To signup Company and initialize in Blockchain
//@access   PUBLIC
router.post("/signup", (req, res) => {
  console.log(req.body.secretCompanyName);
  const secretCompanyName = req.body.secretCompanyName;
  const companyName = req.body.companyName;
  const companyAddress = req.body.companyAddress;
  const companyMobile = req.body.companyMobile;
  const companySecret = req.body.companySecret;
  const companyAmount = req.body.companyAmount;
  const json = {};
  user
    .initCompany(
      secretCompanyName,
      companyName,
      companyAddress,
      companyMobile,
      companySecret,
      companyAmount
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

//@route    POST api/company/login
//@desc     To login Company from Blockchain
//@access   PUBLIC
router.post("/login", (req, res) => {
  console.log(req.body.secretUserName);
  const secretCompanyName = req.body.secretCompanyName;
  const companyName = req.body.companyName;
  const companyPassword = req.body.companySecret;
  const json = {};
  user
    .readCompanyByOwnerAndPassword(
      secretCompanyName,
      companyName,
      companyPassword
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

//@route    POST api/company/readCompany
//@desc     To read company with name in hyperledger
//@access   PUBLIC
router.post("/readCompany", (req, res) => {
  console.log(req.body.secretUserName);
  const secretCompanyName = req.body.secretCompanyName;
  const companyName = req.body.companyName;
  const json = {};
  user
    .readCompany(secretCompanyName, companyName)
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

//@route    POST api/company/readCompanyHistory
//@desc     Read the history of the company with transaction history
//@access   PUBLIC
router.post("/readCompanyHistory", (req, res) => {
  console.log(req.body.secretUserName);
  const secretCompanyName = req.body.secretCompanyName;
  const companyName = req.body.companyName;
  const json = {};
  user
    .readCompanyHistory(secretCompanyName, companyName)
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

//@route    POST api/company/payCompansation
//@desc     To Pay the compansation to the user with respect to percent
//@access   PUBLIC
router.post("/payCompansation", (req, res) => {
  console.log(req.body.secretUsername);
  const secretUserName = req.body.secretCompanyName;
  const companyName = req.body.companyName;
  const userName = req.body.userName;
  const compansationPercent = req.body.compansationPercent;
  const json = {};
  user
    .payCompansation(secretUserName, companyName, userName, compansationPercent)
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

module.exports = router;
