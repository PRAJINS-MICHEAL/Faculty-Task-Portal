import React , {useState , useEffect} from 'react';
import './SideBar.css'
import { NavLink } from "react-router-dom";

import  { useSelector } from 'react-redux';

import { BiSolidDashboard } from "react-icons/bi";
import { GrTasks } from "react-icons/gr";
import { FaFileCirclePlus } from "react-icons/fa6";
import { FaFileCircleCheck } from "react-icons/fa6";
import { BsPersonFillGear } from "react-icons/bs";

const SideBar = () => {

    const theme = useSelector((state)=>state.themeInfo.theme);
    const user = useSelector((state) => state.userInfo.user);

    const [date, setDate] = useState("");
    const [time, setTime] = useState("");

    useEffect(() => {
        const updateTime = () => {
        setDate(formatDate(new Date()));
        setTime(formatTime(new Date()));
        };
        
        updateTime(); 

        const interval = setInterval(updateTime, 1000); 

        return () => clearInterval(interval); 
    }, []);

    const formatDate = (date) => {
      const day = date.getDate();
      const month = date.toLocaleString("en-US", { month: "short" }); // Feb
      const year = date.getFullYear();
      const weekday = date.toLocaleString("en-US", { weekday: "long" });

      return `${weekday}, ${day} ${month} ${year}`;
    };

    const formatTime =(date) =>{
      const time = date.toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      return `${time}`
    }

  return (
    <>
    <div className={`sidebar ${theme}`}>
        <div className="options">


            <NavLink to={'/dashboard'} className={({ isActive }) => `option ${theme} ${isActive ? "active" : ""}`}>
              <BiSolidDashboard />
              <h4>Dashboard</h4>
            </NavLink>


            <NavLink to='/tasks' className={({ isActive }) => `option ${theme} ${isActive ? "active" : ""}`}>
              <GrTasks />
              <h4>Tasks</h4>
            </NavLink>


            { 
              (user.role==="vertical head" || user.role==="admin")
              && 
              <>
                <NavLink to='/check-availability' className={({ isActive }) => `option ${theme} ${isActive ? "active" : ""}`}>
                <BsPersonFillGear />
                <h4>Availability</h4>
                </NavLink>

                <NavLink to='/work-allocation' className={({ isActive }) => `option ${theme} ${isActive ? "active" : ""}`}>
                  <FaFileCirclePlus />
                  <h4>Work Allocation</h4>
                </NavLink>
              </>
            }
            
            {
              (user.role==="admin")
              &&
              <NavLink to='/approvals' className={({ isActive }) => `option ${theme} ${isActive ? "active" : ""}`}>
                <FaFileCircleCheck />
                <h4>Approvals</h4>
              </NavLink>
            }
            
        </div>
        <div className={`date-time ${theme}`}>
            <h1>{time}</h1>
            <h4>{date}</h4>
        </div>
    </div>
    </>
  )
}

export default SideBar