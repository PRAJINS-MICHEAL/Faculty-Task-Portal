import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Faculty = () => {
  
  const user = useSelector((state) => state.userInfo.user);

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return <Outlet />;
};

export default Faculty;
