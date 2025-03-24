import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route , useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setTheme } from "./slices/themeSlice";
import { setUser , deleteUser } from "./slices/userSlice";

import Dashboard from "./pages/Dashboard/Dashboard";
import Auth from "./pages/Auth/Auth";
import Tasks from "./pages/Tasks/Tasks";
import WorkAllocation from "./pages/WorkAllocation/WorkAllocation";
import Approvals from "./pages/Approvals/Approvals";
import Error from "./pages/Error/Error";

import Layout from "./components/Layout/Layout";

import Faculty from "./components/ProtectedRoutes/Faculty";
import Admin from "./components/ProtectedRoutes/Admin";
import VerticalHead from "./components/ProtectedRoutes/VerticalHead";
import WorkAllocationCreate from "./pages/WorkAllocationCreate/WorkAllocationCreate";
import Availability from "./pages/Availability/Availability";

const SCREEN_TIMEOUT = 30 * 60 * 1000; // 30 min
const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hrs

const App = () => {
  const dispatch = useDispatch();

  const navigate = useNavigate(); 

// const user = null 


  // const [lastActivityTime, setLastActivityTime] = useState(Date.now());

  // const resetScreenTimer = () => setLastActivityTime(Date.now());

  // const getUserData = () => 
  // {
  //   const userData = useSelector((state)=>state.userInfo.user);
  //   return userData ? JSON.parse(userData) : null;
  // };

  //  const user = getUserData();


  // useEffect(() => {
  //   window.addEventListener("mousemove", resetScreenTimer);
  //   window.addEventListener("keypress", resetScreenTimer);
  //   window.addEventListener("scroll", resetScreenTimer);
  //   window.addEventListener("click", resetScreenTimer);

  //   const interval = setInterval(() => {
  //     const currentTime = Date.now();

  //     // Check for session timeout (absolute timeout)
  //     if (user && user.loginTime) {
  //       const loginTime = new Date(user.loginTime).getTime();
  //       if (currentTime - loginTime > SESSION_TIMEOUT) {
  //         alert("Session expired! Redirecting to login...");
  //         dispatch(logout()) // Clear session data
  //         navigate("/auth");
  //         return;
  //       }
  //     }

  //     // Check for screen timeout (inactivity)
  //     if (currentTime - lastActivityTime > SCREEN_TIMEOUT) {
  //       alert("You were inactive for 30 minutes! Redirecting to login...");
  //       dispatch(logout()) // Clear session data
  //       navigate("/auth");
  //     }
  //   }, 1000); // Check every second

  //   return () => {
  //     window.removeEventListener("mousemove", resetScreenTimer);
  //     window.removeEventListener("keypress", resetScreenTimer);
  //     window.removeEventListener("scroll", resetScreenTimer);
  //     window.removeEventListener("click", resetScreenTimer);
  //     clearInterval(interval);
  //   };
  // }, [navigate, lastActivityTime, user]);


  useEffect(() => {
    // Function to check system theme and update Redux store
    const updateTheme = () => {
      const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
      dispatch(setTheme(isDarkMode ? "dark" : "light"));
    };

    // Initial theme check
    updateTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", updateTheme);

    // Cleanup listener on unmount
    return () => {
      mediaQuery.removeEventListener("change", updateTheme);
    };
  }, [dispatch]);

// useEffect(()=>{

//   const checkToken =async ()=>{

//     const token = localStorage.getItem("accessTokenFTP") || null ;

//     if(!token)
//     {
//       navigate("/Auth");
//       return;
//     }

//     const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/users/current`,{
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${token}`,
//         },
//       cache: "no-store"
//     })

//     if(!response.ok)
//     {
//       dispatch(deleteUser())
//       localStorage.removeItem("accessTokenFTP");
//       navigate("/Auth");
//       return;
//     }

//     const user = await response.json();

//     console.log(user);

//     dispatch(setUser(user))

//   }

//   checkToken();

// },[navigate , dispatch])

useEffect(() => {
  const checkToken = async () => {
    const token = localStorage.getItem("accessTokenFTP") || null;

    if (!token) {
      dispatch(deleteUser());
      navigate("/Auth");
      return;
    }

    try 
    {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/users/current`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("Invalid Token");
      }

      const user = await response.json();
      

      dispatch(setUser(user)); // Update Redux state
    } 
    catch (error) 
    {
      console.error("Error fetching user:", error);
      dispatch(deleteUser());
      localStorage.removeItem("accessTokenFTP");
      navigate("/Auth");
    }
  };

  checkToken();
}, [navigate]); // ✅ Add dispatch here




  return (
    
    
      <Routes>
        <Route path="auth" element={<Auth />} />
        <Route path="error" element={<Error />} />
        <Route element={<Faculty />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} /> 
            <Route path="dashboard" element={<Dashboard />} /> 
            <Route path="tasks" element={<Tasks />} />
            <Route element={<VerticalHead />}>
              <Route path="work-allocation" element={<WorkAllocation />} />
              <Route path="work-allocation/create" element={<WorkAllocationCreate />} />
              <Route path="check-availability" element={<Availability/>} />
            </Route>  
            <Route element={<Admin />}>
              <Route path="approvals" element={<Approvals />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Error />} />
      </Routes>
    
    
  );
};

export default App;
