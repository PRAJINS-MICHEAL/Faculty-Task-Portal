const asyncHandler = require("express-async-handler");
const Allocation = require("../models/allocationModel");
const User = require("../models/userModel");
const moment = require("moment");
const { sequelize } = require("../config/dbConnection");
const { bulkTaskAllocation } = require("./taskController")

const saveAllocation = asyncHandler(async (req, res) => {
  
    const {
      task,
      description,
      fromTime,
      toTime,
      commonVenue,
      numberOfFaculty,
      departmentSpecific,
      skillSpecific,
      venue,
      assignedBy,
    } = req.body;

    const userId = req.user.id;

    if(!userId)
    {
        res.status(401);
        throw new Error("Unauthorized user !!");
    }

    const user = await User.findOne({ where: { id: userId } });
        

    if( !user || user.role === "faculty" || user.department !== assignedBy )
    {
        res.status(403);
        throw new Error("User Not Registered or have no access to this feature");
    }

    
    if (!task || !description || !fromTime || !toTime || !numberOfFaculty || !assignedBy) 
    {
        res.status(400);
        throw new Error("Please fill all required fields");
    }

    if (!commonVenue && (!venue || venue.length !== numberOfFaculty)) 
    {
        res.status(400);
        throw new Error("Venue Shortage in provided data");
    }
      

    
    
    const formattedFromTime = moment(fromTime).format("YYYY-MM-DD HH:mm:ss");
    const formattedToTime = moment(toTime).format("YYYY-MM-DD HH:mm:ss");

    
    
    const newAllocation = await Allocation.create({
      task,
      description,
      fromTime: formattedFromTime,
      toTime: formattedToTime,
      commonVenue,
      numberOfFaculty,
      departmentSpecific,
      skillSpecific,
      venue,
      assignedBy,
    });

    console.log(newAllocation);
    

    res.status(201).json({
      message: "Work allocation saved successfully",
      data: newAllocation,
    });
  
});

const getAllocation = asyncHandler(async (req, res) => {

    const userId = req.user.id;
    const approvalStatus = req.query.approvalStatus;

    if (!userId) {
        res.status(401);
        throw new Error("Unauthorized user!!");
    }

    if (!approvalStatus) {
        res.status(400);
        throw new Error("Query Missing in the URL.");
    }

    const user = await User.findOne({ where: { id: userId } });

    if (!user || user.role !== "admin") {
        res.status(403);
        throw new Error("User Not Registered or has no access to this feature");
    }

    const limit = parseInt(req.query.limit) || 5;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    // Query to get the total number of allocations for the given approvalStatus
    const totalQuery = `
        SELECT COUNT(*) as totalRecords
        FROM faculty_task_portal_db.allocations
        WHERE approvalStatus = :approvalStatus
    `;
    const totalOptions = {
        replacements: { approvalStatus },
        type: sequelize.QueryTypes.SELECT
    };

    const totalResult = await sequelize.query(totalQuery, totalOptions);
    const totalRecords = totalResult[0].totalRecords;

    // Query to get paginated allocations
    const query = `
        SELECT *
        FROM faculty_task_portal_db.allocations
        WHERE approvalStatus = :approvalStatus
        ORDER BY createdAt DESC
        LIMIT :limit
        OFFSET :offset
    `;
    const options = {
        replacements: { 
            approvalStatus,
            limit: Number(limit),
            offset: Number(offset)
        },
        type: sequelize.QueryTypes.SELECT
    };

    const allocations = await sequelize.query(query, options);

    // Calculate total pages
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        message: "Allocations retrieved successfully",
        data: allocations,
        pagination: {
            currentPage: page,
            perPage: limit,
            totalRecords: totalRecords,
            totalPages: totalPages,
        },
    });

});


const getAllocationByDepartment = asyncHandler( async(req, res) => {

    const userId = req.user.id;
    const department = decodeURIComponent(req.params.department);

    console.log(department);

    if (!userId) {
        res.status(401);
        throw new Error("Unauthorized user!!");
    }

    if (!department) {
        res.status(400);
        throw new Error("Department Missing in the URL.");
    }

    const user = await User.findOne({ where: { id: userId } });

    if (!user || user.role === "faculty") {
        res.status(403);
        throw new Error("User Not Registered or has no access to this feature");
    }

    const limit = parseInt(req.query.limit) || 5;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    // Query to get total records
    const totalQuery = `
        SELECT COUNT(*) as totalRecords
        FROM faculty_task_portal_db.allocations
        WHERE assignedBy = :department
    `;
    const totalOptions = {
        replacements: { department },
        type: sequelize.QueryTypes.SELECT
    };

    const totalResult = await sequelize.query(totalQuery, totalOptions);
    const totalRecords = totalResult[0].totalRecords;

    // Query to get paginated allocations
    const query = `
        SELECT *
        FROM faculty_task_portal_db.allocations
        WHERE assignedBy = :department
        ORDER BY createdAt DESC
        LIMIT :limit
        OFFSET :offset
    `;
    const options = {
        replacements: { 
            department,
            limit: Number(limit), 
            offset: Number(offset)
        },
        type: sequelize.QueryTypes.SELECT
    };

    const allocations = await sequelize.query(query, options);

    console.log(allocations);

    // Calculate total pages
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        message: "Allocations retrieved successfully",
        data: allocations,
        pagination: {
            currentPage: page,
            perPage: limit,
            totalRecords: totalRecords,
            totalPages: totalPages,
        },
    });

});


const approveAllocation = asyncHandler(async (req, res ) => {

    const userId = req.user?.id; 

    const { allocationId } = req.params; 

    const {approvalStatus , reason } = req.body;

    if (!userId) 
    {
        res.status(401);
        throw new Error("Unauthorized: User not logged in");
    }

    if(!approvalStatus || !reason)
    {
        res.status(400);
        throw new Error("Please provide all required fields.");
    }

    const user = await User.findOne({ where: { id: userId } });

    if (!user || user.role !== "admin") 
    {
        res.status(403);
        throw new Error("Access denied: Only admins can approve allocations");
    }

    const [allocation] = await sequelize.query(
        "SELECT * FROM allocations WHERE id = ?",
        {
            replacements: [allocationId], 
            type: sequelize.QueryTypes.SELECT 
        }
    );

    if (!allocation) 
    {
        res.status(404);
        throw new Error("Allocation not found");
    }

    var allocatedFaculties = null;

    if(approvalStatus === "approved")
    {
       allocatedFaculties = await bulkTaskAllocation(allocation);

       if(!allocatedFaculties)
        {
            res.status(404);
            throw new Error("Insufficiency of faculties to allocate");
        }

        allocation.assignedTo = allocatedFaculties.map(faculty => faculty.id);
    }
    
    allocation.approvalStatus = approvalStatus;
    allocation.reason = reason;

    await await sequelize.query(
        "UPDATE allocations SET approvalStatus = ?, reason = ? WHERE id = ?",
        {
            replacements: [approvalStatus, reason, allocationId],
            type: sequelize.QueryTypes.UPDATE,
        }
    );

    res.status(200).json({ 
        message: `Allocation ${approvalStatus.toLowerCase()} successfully`, 
        data: allocation 
    });

});


module.exports = { saveAllocation , getAllocationByDepartment , approveAllocation , getAllocation};
