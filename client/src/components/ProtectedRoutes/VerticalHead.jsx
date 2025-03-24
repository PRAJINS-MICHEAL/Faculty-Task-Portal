import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux';

const VerticalHead = () => {

   const user = useSelector((state) => state.userInfo.user);

  if(!user)
  {
      return   <Navigate to="/Auth" />
  }
  if(user.role==="Faculty")
  {
      return   <Navigate to="error/401" />
  }

  return (
    <Outlet />
  )
}

export default VerticalHead