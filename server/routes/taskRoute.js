const validateTokenhandler = require("../middlewares/validateTokenHandler")

const express = require("express");

const router = express.Router();

const { addTask , getAllTaskByDates , getWorkHourByMonthAndYear , checkAvailability } = require("../controllers/taskController")

router.post("/addTask" , validateTokenhandler , addTask);

router.get("/getAllTaskByDates", validateTokenhandler , getAllTaskByDates);

router.get("/getWorkHourByMonthAndYear", validateTokenhandler , getWorkHourByMonthAndYear);

router.get("/checkAvailability", validateTokenhandler , checkAvailability);


module.exports = router;