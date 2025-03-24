const asyncHandler = require("express-async-handler")
const User = require("../models/userModel")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const { sequelize } = require("../config/dbConnection")

const register = asyncHandler(async (req , res )=>{

    const {name , email , department , role , skills} = req.body;

    if(!name || !email || !department || !role )
    {
        res.status(400);
        throw new Error("All data are mandatory.")
    }

    const user = await User.findOne({ where: { email:email } });

    if(user)
    {
        res.status(400);
        throw new Error("Email already in use.")
    }

    const newUser = await User.create({
        name,
        email,
        department,
        role,
        skills
    })

    if(newUser){
        res.status(201).json(newUser)
    }
    else{
        res.status(400);
        throw new Error("Invalid Data .")
    }

    console.log("Registeration Successfull")

});

const login = asyncHandler(async(req , res )=>{

    const authHeader = req.headers.authorization || req.headers.Authorization

    if(authHeader && authHeader.startsWith("Bearer"))
    {
        token=authHeader.split(" ")[1];

        if(!token)
        {
            res.status(401);
            throw new Error("Unauthorised or Token not available .")
        }
        
        const response = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`,{
            method: 'GET',
            headers:{
            "Content-Type":"application/json",
            Authorization:`Bearer ${token}`
            }
        });

        if(!response.ok)
        {
            res.status(401);
            throw new Error("Unable to reach server !!");
            
        }
        
        
        const { email } = await response.json();
                

        const user = await User.findOne({ where: { email } });
        

        if(!user)
        {
            res.status(401);
            throw new Error("User Email Not Registered !!");
        }

        const accessToken = jwt.sign(
            {
                user:{
                    id:user.id,
                    name:user.name,
                    email:user.email,
                    department:user.department,
                    role:user.role,
                },
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn:"120m"
            }
        );

        res.status(200).json({accessToken});
            
        
    }
    else
    {
        res.status(401);
        throw new Error("Token Missing!!");
    }

});

const current = asyncHandler(async(req , res )=>{

    res.status(200).json(req.user);
    
});

const getFacultyByName = asyncHandler(async(req , res )=>{

    const { name } = req.query;

    if(!name)
    {
        res.status(400);
        throw new Error("Name is required !!");
    }
    
    const query = `SELECT id , name , email , department
                   FROM faculty_task_portal_db.users
                   WHERE role = "faculty" 
                   AND LOWER(name) LIKE :name1 ;
                  `

    const options = {
                        replacements: { 
                            name1: `${name.toLowerCase()}%`, 
                        },
                        type: sequelize.QueryTypes.SELECT
                    };       
                    

    const users  = await sequelize.query(query , options); 

    console.log(users);
    
    
    res.status(200).json(users);

});

module.exports={register , login , current , getFacultyByName}