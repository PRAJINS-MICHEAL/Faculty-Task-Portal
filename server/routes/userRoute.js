const validateTokenhandler = require("../middlewares/validateTokenHandler")

const express = require("express");

const router = express.Router();

const { register , login , current , getFacultyByName} = require("../controllers/userController")

router.route("/register").post(register);

router.route("/login").post(login);

router.get("/current" , validateTokenhandler , current);

router.get("/getFacultyByName" , validateTokenhandler , getFacultyByName);

module.exports = router;



