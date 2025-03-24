import React from 'react'
import './NoDataFound.css'

import { IoIosWarning } from "react-icons/io";

const NoDataFound = (props) => {
  return (
    <div className="no-data-found">

        <h3 className='info'>
        <IoIosWarning />
        {
          props.message?props.message :"No Data Found"
        }
        </h3>

    </div>
  )
}

export default NoDataFound