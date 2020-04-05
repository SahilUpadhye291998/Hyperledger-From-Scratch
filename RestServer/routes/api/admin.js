const express = require('express');
const router = express.Router();

router.get("/admin",(req,res)=>{
    res.send("This is an admin route");
    console.info("Admin route called");
})

module.exports = router
