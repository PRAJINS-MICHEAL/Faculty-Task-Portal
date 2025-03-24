import React, { useState, useEffect, useCallback } from 'react';
import './Availability.css';

import { IoIosArrowForward } from "react-icons/io";
import { TbFilterSearch } from "react-icons/tb";
import { TbReport } from "react-icons/tb";

import toast, { Toaster } from 'react-hot-toast';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import { apiGet } from '../../helper/apiHelper';
import { formatDateTime } from '../../helper/dateHelper';
import NoDataFound from '../../components/NoDataFound/NoDataFound'

const Availability = () => {
    const [facultyFilter, setFacultyFilter] = useState('');
    const [filteredFaculty, setFilteredFaculties] = useState([]);

    const [selectedFaculty , setSelectedFaculty] = useState({});

    const [availabilityResponse , setAvailabilityResponse] = useState();

    const fromTimeRef = React.useRef(null);
    const toTimeRef = React.useRef(null);
    

    const debounce = (func, delay) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => func(...args), delay);
        };
    };


    const getFilteredFaculty = useCallback(debounce(async (searchTerm) => {

        try 
        {
            const response = await apiGet(`/api/users/getFacultyByName?name=${searchTerm}`);
            if (response) 
            {
                setFilteredFaculties(response);

                console.log(filteredFaculty);
                
            }
        } 
        catch (error) 
        {
            console.error("Error fetching faculty:", error);
        }
    }, 1000), []);

    
    useEffect(() => {
        if (facultyFilter.trim() === '') {
            getFilteredFaculty("%");
            return;
        }

        getFilteredFaculty(facultyFilter);

    }, [facultyFilter, getFilteredFaculty]);

    const validateForm = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
    
        const minFromTime = new Date(today);
        minFromTime.setDate(today.getDate() + 3); 
    
        if (!fromTimeRef.current) {
            toast.error("From time is required.");
            return false;
        }
    
        const fromTime = new Date(fromTimeRef.current);
        const toTime = new Date(toTimeRef.current);
    
    
        if (!toTimeRef.current) {
            toast.error("To time is required.");
            return false;
        }
    
        if (toTime <= fromTime) {
            toast.error("To time must be greater than From time.");
            return false;
        }
    
        if (fromTime.toDateString() !== toTime.toDateString()) {
            toast.error("Task can't be scheduled across multiple days.");
            return false;
        }
    
        return true;
    };
    

    const handleSubmit = async ()=>{

        setAvailabilityResponse();

        if(!selectedFaculty)
        {
            toast.error("No faculty selected.");
            return;
        }

        if(!validateForm())
        {
            return;
        }

        const formData = {
            userId : selectedFaculty.id,
            fromTime : encodeURIComponent(formatDateTime(fromTimeRef.current)),
            toTime : encodeURIComponent(formatDateTime(toTimeRef.current)),
        }

        const response = await apiGet(`/api/tasks/checkAvailability?userId=${formData.userId}&fromTime=${formData.fromTime}&toTime=${formData.toTime}`);
        
        if(response)
        {
            setAvailabilityResponse(response);
        }

        console.log(availabilityResponse);
        

    }

    const getDateForClient = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
      };
    
      const getTimeForClient = (dateString)=>{
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-IN', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).toUpperCase();
      }


    return (
        <div className="availability">
            
            <div className="bread-crumbs">
                <p>Faculty Task Portal</p>
                <IoIosArrowForward />
                <p>Check Availability</p>
            </div>
            
            <br />
            <br />
            <br />

            <div className="header">
                <h2>Availability</h2>
            </div>

            <br />

            <div className="filter-option">

                <div className="input-sec">

                    <Autocomplete
                        id="filtered-faculty"
                        options={filteredFaculty}
                        getOptionLabel={(option) => `${option.name.toUpperCase()} (${option.email})`}
                        onChange={(event, newValue) => {
                            setSelectedFaculty(newValue);
                            setFacultyFilter(""); 
                        }}
                        filterSelectedOptions
                        sx={{ width: "40%" }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Faculty Name"
                                onChange={(e) => setFacultyFilter(e.target.value)} 
                            />
                        )}
                    />


                    <TextField
                        id="department"
                        label="Department"
                        value={selectedFaculty?.department || "No Department Selected"}
                        slotProps={{ readOnly: true }}  
                        sx={{ width: "40%" }}
                    />

                </div>

                <br />

                <div className="input-sec">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DemoContainer components={['DateTimePicker']}>
                            <DateTimePicker 
                                label="From" 
                                sx={{ width: "463px" }} 
                                onChange={(value) => (fromTimeRef.current = value)}
                            />
                        </DemoContainer>
                    </LocalizationProvider>

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DemoContainer components={['DateTimePicker']}>
                            <DateTimePicker 
                                label="To" 
                                sx={{ width: "463px" }} 
                                onChange={(value) => (toTimeRef.current = value)}
                            />
                        </DemoContainer>
                    </LocalizationProvider>

                    <button className='subimtBtn' onClick={handleSubmit}>Check</button>
                </div>

                <br />
                <br />

                

            </div>


            {
                availabilityResponse

                ?

                <div className="report">
                    <h2><TbReport /> Report</h2>
                    <br />
                    <br />
                    <div className="data">
                        <div className="left">
                            <div className="parent">
                                <h3 className='div1'>Date</h3>
                                <h2 className='div2'>{getDateForClient(fromTimeRef.current)}</h2>
                            </div>
                            <div className="parent">
                                <h3 className='div1'>Time</h3>
                                <h2 className='div2'>{getTimeForClient(fromTimeRef.current)} - {getTimeForClient(toTimeRef.current)}</h2>
                            </div>
                            <div className="parent">
                                <h3 className='div1'>Status</h3>
                                <h2 className='div2'>{availabilityResponse.isAvailable?"Available":"Not Available"}</h2>
                            </div>
                        </div>
                        <div className="right">
                            <div className="parent">
                                <h3 className='div3'>Other Available Times</h3>
                            </div>
                            {
                                availabilityResponse.freeTimeSlots.map((time, index) => (
                                <>
                                <div className="parent">

                                    <h3 className='div4'>{getTimeForClient(time.from)} - {getTimeForClient(time.to)}</h3>
                                    
                                </div>
                                </>
                                ))
                            }
                        </div>
                    </div>
                </div>

                :

                <>
                    <NoDataFound message="No Report Generated"/>
                </>
            }

            <Toaster />
        </div>
    );
};

export default Availability;


