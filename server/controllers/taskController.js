const asyncHandler = require("express-async-handler")
const Task = require("../models/taskModel") 
const moment = require("moment");

const { sequelize } = require("../config/dbConnection")

//verified
const addTask = asyncHandler(async (req , res )=>{

    const {task , description , venue , fromTime , toTime , assignedTo , assignedBy } = req.body;

    if(!task || !description || !venue || !fromTime || !toTime || !assignedTo || !assignedBy)
    {
        res.status(400);
        throw new Error("All data are mandatory.")
    }

    console.log(req.body);
    

    const newTask = await Task.create({
        task , 
        description , 
        venue , 
        fromTime , 
        toTime , 
        assignedTo , 
        assignedBy
    })

    if(newTask){
        res.status(201).json(newTask)
    }
    else{
        res.status(400);
        throw new Error("Invalid Data .")
    }

    console.log("Registeration Successfull")

});

//verified
const getAllTaskByDates = asyncHandler(async (req , res )=>{

    const userId = req.user.id;

    const {startTime , endTime} = req.query;

    if(!userId)
    {
        res.status(400);
        throw new Error("User Id is Mandatory.");
    }

    if(!startTime || !endTime)
    {
        req.status(400);
        throw new Error("StartTime or EndTime or both missing in the URL query.")
    }

    const query = ` SELECT * 
                    FROM faculty_task_portal_db.tasks 
                    WHERE assignedTo = :assignedTo 
                    AND fromTime BETWEEN :startTime AND :endTime
                    ORDER BY fromTime ASC`;

    const options = {
                        replacements: { 
                            assignedTo: userId, 
                            startTime: startTime, 
                            endTime: endTime 
                        },
                        type: sequelize.QueryTypes.SELECT
                    }                

    const tasks  = await sequelize.query(query , options);


    res.status(200).json({tasks});

});

//verified
const getWorkHourByMonthAndYear = asyncHandler(async(req , res)=>{

    const userId = req.user.id;

    const {month , year} = req.query;

    if(!userId)
    {
        res.status(400);
        throw new Error("User Id is Mandatory.");
    }

    if(!month || !year)
    {
        res.status(400);
        throw new Error("Month or Year or both missing in the URL query.")
    }

    const startTime = moment(`${year}-${month}-01 00:00:00`).format("YYYY-MM-DD HH:mm:ss");
    
    let endTime;

    
    if (moment().format("YYYY-MM") == `${year}-${String(month).padStart(2, '0')}`) 
    {
        endTime = moment().format("YYYY-MM-DD HH:mm:ss");
    } 
    else 
    {
        endTime = moment(`${year}-${month}`).endOf("month").format("YYYY-MM-DD 23:59:59");
    }

    const query = `SELECT assignedTo , SUM(TIMESTAMPDIFF( HOUR ,fromTime , toTime)) as workHour
                   FROM faculty_task_portal_db.tasks 
                   WHERE fromTime >= :startTime AND toTime <= :endTime
                   GROUP BY assignedTo
                   HAVING assignedTo = :assignedTo`

    const options = {
                        replacements: { 
                            assignedTo: userId, 
                            startTime: startTime , 
                            endTime: endTime  
                        },
                        type: sequelize.QueryTypes.SELECT
                    };    

    const  [ data ]   = await sequelize.query(query , options);                

    res.status(200).json(data || {workHour:0});

});

//verified
const bulkTaskAllocation = asyncHandler( async(allocation)=>{

    if(!allocation)
    {
        res.status(500);
        throw new Error("No allocation data provided.");
    }

    const {task,
        description,
        fromTime,
        toTime,
        commonVenue,
        numberOfFaculty,
        departmentSpecific,
        skillSpecific,
        venue,
        assignedBy} = allocation;
        
        
        let departmentSpecificQueryFormat;

        try{
            departmentSpecificQueryFormat=departmentSpecific.replace(/[\[\]"]/g, "");
        }
        catch(err){
            departmentSpecificQueryFormat=null;
        }

        
        let skillSpecificQueryFormat = skillSpecific;
        let venueArray = JSON.parse(venue);
        

        const fromTimeMoment = moment(fromTime, 'YYYY-MM-DD HH:mm:ss');

        const monthStarting = fromTimeMoment.startOf('month').format('YYYY-MM-DD HH:mm:ss');
        const monthEnding = fromTimeMoment.endOf('month').format('YYYY-MM-DD HH:mm:ss');


    const query = `
                   SELECT user.id 
                   FROM faculty_task_portal_db.users  user
                   LEFT JOIN (
                                SELECT task.assignedTo as userId , SUM(TIMESTAMPDIFF(HOUR , task.fromTime , task.toTime)) as total_work_hour
                                FROM faculty_task_portal_db.tasks  task
                                WHERE task.toTime < :monthEnding AND task.fromTime > :monthStarting
                                GROUP BY task.assignedTo
                             )  work_hour
                   ON user.id = work_hour.userId 
                   WHERE user.role = "faculty"
                   ${departmentSpecific ? "AND FIND_IN_SET(user.department , :departmentSpecific)" : ""}
                   ${skillSpecific ? "AND JSON_OVERLAPS(CAST(user.skills AS JSON) , CAST(:skillSpecific AS JSON))" : ""}
                   AND NOT EXISTS (
                                SELECT 1
                                FROM faculty_task_portal_db.tasks task
                                WHERE task.assignedTo = user.id
                                AND (task.toTime > :fromTime AND task.fromTime < :toTime) 
                            )      
                    ORDER BY work_hour.total_work_hour ASC
                    LIMIT :numberOfFaculty;                    
                   
        `

        // const options = {
        //     replacements: {
        //         departmentSpecific : departmentSpecificQueryFormat ? departmentSpecificQueryFormat : null,  
        //         skillSpecific      : skillSpecificQueryFormat ? skillSpecificQueryFormat : null,
        //         monthStarting      : new Date(monthStarting + " GMT+0530").toISOString() ,
        //         monthEnding        : new Date(monthEnding + " GMT+0530").toISOString() ,
        //         fromTime           : new Date(fromTime + " GMT+0530").toISOString(),
        //         toTime             : new Date(toTime + " GMT+0530").toISOString(),
        //         numberOfFaculty
        //     },
        //     type: sequelize.QueryTypes.SELECT
        // }

        const options = {
            replacements: {
                departmentSpecific : departmentSpecificQueryFormat ? departmentSpecificQueryFormat : null,  
                skillSpecific      : skillSpecificQueryFormat ? skillSpecificQueryFormat : null,
                monthStarting      : monthStarting,
                monthEnding        : monthEnding,
                fromTime           : fromTime,
                toTime             : toTime,
                numberOfFaculty
            },
            type: sequelize.QueryTypes.SELECT
        }

        

        const  allocatedFaculties  = await sequelize.query(query , options);


        console.log("----------------------------------");
        console.log("----------------------------------");
        console.log("----------------------------------");
        console.log("----------------------------------");
        console.log("----------------------------------");
        console.log(allocatedFaculties);
        console.log("----------------------------------");
        console.log("----------------------------------");
        console.log("----------------------------------");
        console.log("----------------------------------");
        console.log("----------------------------------");
        
        
        if(allocatedFaculties.length != numberOfFaculty)
        {
            return null;
        }

        

        for(index =0 ; index < numberOfFaculty ; index++)
        {
            const newTask = await Task.create({
                task  , 
                description , 
                venue : commonVenue || venueArray[index] , 
                fromTime , 
                toTime , 
                assignedTo : allocatedFaculties[index].id , 
                assignedBy
            });
        }
        
        return allocatedFaculties;

})

const checkAvailability = asyncHandler( async (req, res) => {
    const { userId, fromTime, toTime } = req.query;

    // Check if all required fields are provided
    if (!userId || !fromTime || !toTime) {
        res.status(400);
        throw new Error("Please provide all the required fields");
    }

    // Format the fromTime and toTime to a specific format
    const formatedFromTime = moment(fromTime).format("YYYY-MM-DD HH:mm:ss");
    const formatedToTime = moment(toTime).format("YYYY-MM-DD HH:mm:ss");

    const selectedDate = formatedFromTime.split(" ")[0];

    // Define working hours in IST (Indian Standard Time)
    const workStartIST = moment(selectedDate).set({ hour: 8, minute: 45, second: 0, millisecond: 0 }).toDate();
    const workEndIST = moment(selectedDate).set({ hour: 16, minute: 30, second: 0, millisecond: 0 }).toDate();

    // Query to fetch booked slots for the faculty on the selected date
    const query = `
        SELECT fromTime, toTime
        FROM faculty_task_portal_db.tasks
        WHERE assignedTo = :assignedTo 
        AND DATE(fromTime) = :selectedDate
        ORDER BY fromTime ASC;
    `;

    const options = {
        replacements: { assignedTo: userId, selectedDate },
        type: sequelize.QueryTypes.SELECT
    };

    // Execute the query to get booked slots
    let bookedSlots = await sequelize.query(query, options);

    console.log(bookedSlots);

    // Convert fromTime and toTime to UTC if necessary (assuming the DB stores them in UTC)
    const toTimeUTC = moment(toTime).utc().toDate();
    const fromTimeUTC = moment(fromTime).utc().toDate();

    // Check if requested time slot overlaps with any existing booked slot
    const isAvailable = !bookedSlots.some(({ fromTime, toTime }) => {
        const bookedFromTime = new Date(fromTime);
        const bookedToTime = new Date(toTime);
        return new Date(fromTimeUTC) < bookedToTime && new Date(toTimeUTC) > bookedFromTime;
    });

    // Function to find free time slots within the working hours
    const findFreeTimeSlots = (bookedSlots) => {
        let freeSlots = [];
        let lastEndTime = workStartIST;

        bookedSlots.forEach(({ fromTime, toTime }) => {
            const bookedFrom = new Date(fromTime);
            const bookedTo = new Date(toTime);

            // If there is a gap between the last booked slot and the current one, add the free slot
            if (lastEndTime < bookedFrom) {
                freeSlots.push({ from: lastEndTime, to: bookedFrom });
            }

            // Update last end time to the current booked slot's end time
            lastEndTime = bookedTo;
        });

        // Add the remaining time after the last booked slot up to the work end time
        if (lastEndTime < workEndIST) {
            freeSlots.push({ from: lastEndTime, to: workEndIST });
        }

        // Format the free slots in IST
        return freeSlots.map(({ from, to }) => ({
            from: formatISTDateTime(from),
            to: formatISTDateTime(to)
        }));
    };

    // Helper function to format Date to IST (Indian Standard Time)
    const formatISTDateTime = (date) => {
        return moment(date).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
    };

    // Get all available free time slots
    const freeTimeSlots = findFreeTimeSlots(bookedSlots);

    console.log(freeTimeSlots);
    console.log(isAvailable);
    
    

    // Send the response
    res.status(200).json({
        isAvailable,
        message: isAvailable ? "Faculty is available." : "Faculty is not available.",
        freeTimeSlots
    });
});




module.exports = { addTask  , getAllTaskByDates , getWorkHourByMonthAndYear , bulkTaskAllocation , checkAvailability}

"ch$@48sePM"

"617512"

"7373"