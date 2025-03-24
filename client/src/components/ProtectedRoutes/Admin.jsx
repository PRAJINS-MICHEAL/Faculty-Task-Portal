import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux';

const Admin = () => {

    const user = useSelector((state) => state.userInfo.user);

    if(!user)
    {      
        return   <Navigate to="/Auth" />
    }
    else if(user.role!=="admin")
    {
        return   <Navigate to="error" />
    }
    
    return (
      <Outlet />
    )
}

export default Admin