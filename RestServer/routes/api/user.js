const express = require('express');
const router = express.Router();

const user = require('../../methods/registerUser');

router.post("/registerUser", async(req ,res)=>{
    console.log("OK");
    const userName = req.body.username;
    const userOrg = req.body.orgName;
    json = {}
    user.registerUser(userName, userOrg)
        .then(()=>{
            json.code = 200;
            json.Message = "User enrolled successfully";
            res.status(200).send(json);
        })
        .catch((error)=>{
            console.log(error);
            json.code = 500;
            json.Message = "Some error has occured";
            res.status(500).send(json);
        }); 
});

module.exports = router;
