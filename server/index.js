const express = require("express");
const dotenv = require("dotenv").config();
const cors = require('cors');
const errorHandler = require("./middlewares/errorHandler")
const {dbConnect} = require('./config/dbConnection');

dbConnect();

const app=express();

app.use(cors());
app.use(express.json());



app.use("/api/users", require("./routes/userRoute"));
app.use("/api/tasks", require("./routes/taskRoute"));
app.use("/api/allocations",require("./routes/allocationRoute"))


app.use(errorHandler);// error handlers must be at the end of the middleware chain


const port = process.env.PORT;
app.listen(port ,() => {
   console.log(`Server running on port ${port}`);
});