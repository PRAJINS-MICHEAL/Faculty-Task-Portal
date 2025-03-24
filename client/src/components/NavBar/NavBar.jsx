import React , { useState , useEffect } from 'react'
import './NavBar.css'

import { useSelector } from 'react-redux';
import { googleLogout } from '@react-oauth/google';
import { useDispatch } from "react-redux";
import { setUser , deleteUser } from "../../slices/userSlice";

import { FaBars } from "react-icons/fa6";
import { RiLogoutBoxLine } from "react-icons/ri";

import Popover from '@mui/material/Popover';



const NavBar = () => {
    const dispatch = useDispatch();

    const theme = useSelector((state)=>state.themeInfo.theme);
    const user = useSelector((state) => state.userInfo.user);


    const handleLogout = () => {
        googleLogout();
        localStorage.removeItem("accessTokenFTP");
        dispatch(deleteUser());
        // navigate("/Auth", { replace: true });
        setTimeout(() => window.location.reload(), 100); // ✅ Force Redux reset
      };



    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
    setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

      
      

  return (
    <>
    <div className={`navbar ${theme}`}>
        <div className="bars">
            <FaBars />
        </div>
        <div className="logo">
            <h2>Faculty Task Portal</h2>
        </div>
        <div className="others">
            <div className="icons">
                
            </div>
            <div className="profile" onClick={handleClick}>
                <h2>{user.name[0].toUpperCase()}</h2>
            </div>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
                }}
            >
                <button 
                onClick={handleLogout} 
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "8px", // Optional: Adds spacing between icon and text
                    padding: "8px 12px",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: "16px"
                }}
                >
                <RiLogoutBoxLine /> Log Out
                </button>
            </Popover>
        </div>
    </div>
    </>
  )
}

export default NavBar