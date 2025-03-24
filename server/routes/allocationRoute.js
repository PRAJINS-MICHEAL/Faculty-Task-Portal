const validateTokenhandler = require("../middlewares/validateTokenHandler")

const express = require("express");

const router = express.Router();

const { saveAllocation , getAllocationByDepartment , approveAllocation , getAllocation } = require("../controllers/allocationController");

router.post("/saveAllocation" , validateTokenhandler , saveAllocation);

router.get("/getAllocation" , validateTokenhandler , getAllocation);

router.get("/getAllocationByDepartment/:department" , validateTokenhandler , getAllocationByDepartment);

router.put("/approveAllocation/:allocationId" , validateTokenhandler , approveAllocation);


module.exports = router;