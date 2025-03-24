import React from 'react'
import './Layout.css'

import { Outlet } from 'react-router-dom';

import NavBar from '../NavBar/NavBar'
import SideBar from '../SideBar/SideBar'
import Footer from '../Footer/Footer'

const Layout = (props) => {

  return (
    <>
    <div className="layout">
        <div className="layout-1">
            <NavBar user={props.user}/>
        </div>
        <div className="layout-2">
            <div className="layout-2-1">
                <SideBar user={props.user}/>
            </div>
            <div className="layout-2-2">
                <Outlet />
            </div>
        </div>
        <div className="layout-3">
            <Footer />
        </div>
    </div>
    </>
  )
}

export default Layout