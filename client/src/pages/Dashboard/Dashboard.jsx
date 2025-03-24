import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

import { IoIosArrowForward } from "react-icons/io";
import { MdAssignmentInd } from "react-icons/md";
import { IoSchool } from "react-icons/io5";
import { MdAccessTimeFilled } from "react-icons/md";
import { FaTasks } from "react-icons/fa";
import { FaExpandArrowsAlt } from "react-icons/fa";
import { MdLiveHelp } from "react-icons/md";

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Modal from '@mui/material/Modal';

import { apiGet } from '../../helper/apiHelper'
import NoDataFound from '../../components/NoDataFound/NoDataFound';

const Dashboard = () => {
  
  const user = useSelector((state) => state.userInfo.user);
  const theme = useSelector((state) => state.themeInfo.theme);

  const navigate = useNavigate();

  const [tasks , setTasks] = useState(null);
  const [workHour , setWorkHour] = useState(0);

  // Getting Date  
  const date = new Date();
  const day = date.getDate();
  const monthInteger = date.getMonth() + 1; // JavaScript months are 0-based
  const monthString = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  
  useEffect(()=>{

    const fetchWorkHour = async() =>{

      const response = await apiGet(`/api/tasks/getWorkHourByMonthAndYear?month=${monthInteger}&year=${year}`);

      if(response)
      {
        setWorkHour(response.workHour);
      }

    };

    fetchWorkHour();

  },[])

  useEffect(()=>{

    const fetchTasks = async()=>{

      const response = await apiGet(`/api/tasks/getAllTaskByDates?startTime=${year}-${monthInteger}-${day} 00:00:00&endTime=${year}-${monthInteger}-${day} 23:59:59`);

      if(response)
      {
        console.log(response);
        
        setTasks(response.tasks);
      }

    };

    fetchTasks();

  },[])


  const getFromTimeForClient = (dateString)=>{
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).toUpperCase();
  }

  const getTotalHoursForClient = (startTime,endTime)=>{
    const start = new Date(startTime);
    const end = new Date(endTime);

    const diffInMs = end - start; 
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60)); 
    const diffInMinutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));

    if(diffInMinutes === 0)
      return `${diffInHours} hrs`

    return `${diffInHours} hrs ${diffInMinutes} min`;
  }

  const getCurrentStatus = (startTime,endTime)=>{

    const start = new Date(startTime);
    const end = new Date(endTime);
    const current = new Date();

    if(end < current) return <Chip label="Completed" color="success" variant="outlined" size="small"/>
    else if(start > current) return <Chip label="Upcoming" variant="outlined" size="small"/>
    else return <Chip label="Ongoing" color="primary" variant="outlined" size="small"/>

  }

  const [selectedTask , setSelectedTask] = useState(null);
  const [open, setOpen] = useState(false);

  const handleOpen = (task) => {
    setSelectedTask(task);
    setOpen(true)
  };
  const handleClose = () => {
    setSelectedTask(null);
    setOpen(false)
  };

  const handleHelp = () =>{

  }

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width:"50%",
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    borderRadius:"5px",
    boxShadow: 24,
    p: 4,
  };
  

  return (
    <>
      <div className={`dashboard ${theme}`}>
        <div className={`bread-crumbs ${theme}`}>
          <p>Faculty Task Portal</p>
          <IoIosArrowForward />
          <p>Dashboard</p>
        </div>
        <br />
        <br />
        <div className="container">
          <div className={`profile ${theme}`}>
            <div className="container-info">
              <MdAssignmentInd />
              <h4>Profile</h4>
            </div>
            <h2>{user?.name?.toUpperCase()}</h2>
            <p>{user?.email}</p>
          </div>

          <div className={`designation ${theme}`}>
            <div className="container-info">
              <IoSchool />
              <h4>Designation</h4>
            </div>
            <h2>{user?.role?.toUpperCase()}</h2>
            <p>{user?.department}</p>
            <p>Bannari Amman Institute of Technology</p>
          </div>

          <div className={`work-hour ${theme}`}>
            <div className="container-info">
              <MdAccessTimeFilled />
              <h4>Work Hour</h4>
            </div>
            <h1>{workHour}</h1>
            <h2>{`${monthString} ${year}`}</h2>
          </div>
        </div>
      </div>
      <div className="today-task">
        <div className="task-head">
          <FaTasks />
          <h3>Today's Task</h3>
        </div>
        <div className="task-data">
          {
            tasks !== null

            ?

            <>
            {
              tasks.length === 0

              ?

              <>
                <NoDataFound/>
              </>

              :

              <>
              {
                tasks.map((task , index) => (
                  <div className="task-details" key={index}>
                    <h3 className='taskname'>{task.task}</h3>
                    <p className="venue">{task.venue}</p>
                    <p className="fromTime">{getFromTimeForClient(task.fromTime)}</p>
                    <p className="totalHours">{getTotalHoursForClient(task.fromTime , task.toTime)}</p>
                    <p className="status">{getCurrentStatus(task.fromTime , task.toTime)}</p>
                    <div className='icon'>
                      <Tooltip title="Expand">
                        <span onClick={()=>handleOpen(task)}>
                          <FaExpandArrowsAlt /> 
                        </span>
                      </Tooltip>
                      <Tooltip title="Help" > 
                        <span onClick={handleHelp}>
                          <MdLiveHelp /> 
                        </span>
                      </Tooltip>
                    </div>
                  </div>
                ))
              }
              </>
            }
            </>

            :

            <>
              <Box sx={{ width: "100%"}}>
                <Skeleton sx={{ height: "70px" , bgcolor:theme==="dark" ? "#9999991A":"#64748B30" }} />
                <Skeleton sx={{ height: "70px" , bgcolor:theme==="dark" ? "#9999991A":"#64748B30" }} />
                <Skeleton sx={{ height: "70px" , bgcolor:theme==="dark" ? "#9999991A":"#64748B30" }} />
                <Skeleton sx={{ height: "70px" , bgcolor:theme==="dark" ? "#9999991A":"#64748B30" }} />
                <Skeleton sx={{ height: "70px" , bgcolor:theme==="dark" ? "#9999991A":"#64748B30" }} />
              </Box>
            </>

          }
        </div>
      </div>

      {
        open && selectedTask &&

        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          className='task-modal'
        >
           <Box sx={style} className='box'>
            <h2>Task Details</h2>
            <br />
            <br />
            
            <h4><pre>{`Task         :   ${selectedTask.task}`}</pre></h4><br />
            <h4><pre>{`Description  :   ${selectedTask.description}`}</pre></h4><br />
            <h4><pre>{`Venue        :   ${selectedTask.venue}`}</pre></h4><br />
            <h4><pre>{`Date         :   ${day} ${monthString} ${year}`}</pre></h4><br />
            <h4><pre>{`From         :   ${getFromTimeForClient(selectedTask.fromTime)}`}</pre></h4><br />
            <h4><pre>{`To           :   ${getFromTimeForClient(selectedTask.toTime)}`}</pre></h4><br />
            <h4><pre>{`Work Hour    :   ${getTotalHoursForClient(selectedTask.fromTime , selectedTask.toTime)}`}</pre></h4><br />
            <h4><pre>{`Assigned By  :   ${selectedTask.assignedBy}`}</pre></h4><br /><br />
            <h4><pre>{`Status       :   `}{getCurrentStatus(selectedTask.fromTime , selectedTask.toTime)}</pre></h4><br />
           </Box>
        </Modal>

      }

    </>
  );
};

export default Dashboard;
