
import './Auth.css'

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';
import logo from '../../assets/logo.png';



const Auth = () => {

  const theme = useSelector((state) => state.themeInfo.theme);
  const user = useSelector((state) => state.userInfo.user);

  const navigate = useNavigate();

  useEffect(()=>{
    if(user)
    {
      navigate("/dashboard")
    }
  },[user])

  const handleLoginSuccess = async (credentials)=>{

    try
    {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/users/login`,{
        method: 'POST',
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${credentials.access_token}`
        }
      });

      if(!response.ok)
      {
        const error = await response.json();
        throw new Error(error.message);
      }

      const {accessToken} = await response.json();

      if(!accessToken)
      {
        throw new Error("Something went wrong !!");
      }

      localStorage.setItem("accessTokenFTP",accessToken);

      navigate("/dashboard" , {replace:true});
      
    }
    catch(error)
    {
      toast.error(error.message);
    }

  };

  const handleLogin = useGoogleLogin({
    onSuccess: handleLoginSuccess,
    onError: ()=>{ toast.error("Invalid Approach !!") }
  });

  

  
    


  return (
    <div className={`auth-background ${theme}`} >
      <div className={`auth-container ${theme}`}>
        <div className={`auth-head ${theme}`}>
          <h2>Faculty Task Portal</h2>
        </div>
        <div className={`auth-img ${theme}`}>
          <img src={logo} alt="Logo" />
        </div>
        <div className={`auth-greet ${theme}`}>
          <h3>Welcome back !!</h3>
        </div>
        <div className={`auth-button ${theme}`}>
          <button onClick={handleLogin}>Google Sign In</button>
        </div>
        <div className={`auth-info ${theme}`}>
          <p>Continue with your BITSathy account.</p>
        </div>
      </div>

      <Toaster />
    </div>
  );
};

export default Auth;
