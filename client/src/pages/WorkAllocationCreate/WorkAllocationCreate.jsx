import * as React from 'react'
import './WorkAllocationCreate.css'
import  { useSelector } from 'react-redux';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { IoIosArrowForward } from "react-icons/io";

import TextField from '@mui/material/TextField';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import Checkbox from '@mui/material/Checkbox';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';

import { department , skills } from '../../store/constants';

import { apiPost } from '../../helper/apiHelper'


const WorkAllocationCreate = () => {

    const user = useSelector((state) => state.userInfo.user);

    const navigate = useNavigate();

    const [venueCheck, setVenueCheck] = React.useState(false); // Common Venue Checkbox
    const [venue, setVenue] = React.useState([]); // Multiple Venues
    const [venueInput, setVenueInput] = React.useState(""); // Input for multiple venue

    const taskRef = React.useRef("");
    const descriptionRef = React.useRef("");
    const fromTimeRef = React.useRef(null);
    const toTimeRef = React.useRef(null);
    const departmentSpecificRef = React.useRef([]);
    const skillSpecificRef = React.useRef([]);
    const commonVenueRef = React.useRef("");

    const [facultyCount, setFacultyCount] = React.useState(1);

    // Handle Venue Input for Multiple Venues
    const handleVenueKeyDown = (event) => {
        if (event.key === "Enter" && venueInput.trim() !== "") {
            setVenue((prev) => [...prev, venueInput.trim()]);
            setVenueInput("");
            event.preventDefault();
        }
    };

    const formatDateTime = (date) => {
        if (!date) return null;
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are 0-based
        const day = String(d.getDate()).padStart(2, "0");
        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");
        const seconds = String(d.getSeconds()).padStart(2, "0");
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const validateForm = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Remove time part
        const minFromTime = new Date(today);
        minFromTime.setDate(today.getDate() + 3); // From time must be at least 3 days ahead

        if (!fromTimeRef.current) {
            toast.error("From time is required.");
            return false;
        }

        if (new Date(fromTimeRef.current) < minFromTime) {
            toast.error(`From time must be at least ${minFromTime.toDateString()}`);
            return false;
        }

        if (!toTimeRef.current) {
            toast.error("To time is required.");
            return false;
        }

        if (new Date(toTimeRef.current) <= new Date(fromTimeRef.current)) {
            toast.error("To time must be greater than From time.");
            return false;
        }

        if (!taskRef.current.trim()) {
            toast.error("Task field cannot be empty.");
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        const selectedDepartments = departmentSpecificRef.current;
        const selectedSkills = skillSpecificRef.current;
        const commonVenue = venueCheck ? commonVenueRef.current : null;
        const multipleVenues = venueCheck ? null : venue;

        if(!taskRef.current || !descriptionRef.current || !fromTimeRef.current || !toTimeRef.current)
        {
            toast.error("Task details are required.");
            return;
        }

        if (!validateForm()) return;

        if(facultyCount <= 0)
        {
            toast.error("Number of faculty cannot be less than 1.");
            return;
        }

        
        if (!venueCheck && multipleVenues.length !== facultyCount) {
            toast.error("Number of faculty must be equal to the number of venues.");
            return;
        }

        const formData = {
            assignedBy: user.department,
            task: taskRef.current,
            description: descriptionRef.current,
            fromTime: formatDateTime(fromTimeRef.current),
            toTime: formatDateTime(toTimeRef.current),
            numberOfFaculty: facultyCount,
            departmentSpecific: selectedDepartments.length ?selectedDepartments:null,
            skillSpecific: selectedSkills.length?selectedSkills:null,
            commonVenue: commonVenue,
            venue: multipleVenues
        };

        // console.log("Form Data:", formData);

        const response = await apiPost('/api/allocations/saveAllocation', formData);

        if(response)
        {
            toast.success("Allocation created Successfully.");
            navigate("/work-allocation");
        }
        
    };


    


  return (
    <>
    <div className="allocation-create">
        <div className={`bread-crumbs`}>
            <p>Faculty Task Portal</p>
            <IoIosArrowForward />
            <p>Work Allocation</p>
            <IoIosArrowForward />
            <p>Create</p>
        </div>
        <br />
        <br />
        <h2>Your Details</h2>
        <br />
        <br />
        <div className="input-sec">
            <TextField
            id="vertical-head"
            label="Vertical Head"
            defaultValue={`${user.name.toUpperCase()}(${user.email})`}
            slotProps={{
                input: {
                readOnly: true,
                },
            }}
            sx={{width:"35%"}}
            />

            <TextField
            id="department"
            label="Department"
            defaultValue={user.department}
            slotProps={{
                input: {
                readOnly: true,
                },
            }}
            sx={{width:"35%"}}
            />
        </div>
        <br />
        <br />
        <h2>Task Details</h2>
        <br />
        <br />
        <div className="input-sec">

            <TextField 
            id="task" 
            label="Task" 
            helperText="Eg. Invigilation"
            variant="outlined" 
            sx={{width:"35%"}}
            onChange={(e) => (taskRef.current = e.target.value)}
            />

            <TextField 
            id="description" 
            label="Description" 
            helperText="Eg. Flying Squad for Exam Halls"
            variant="outlined" 
            sx={{width:"35%"}}
            onChange={(e) => (descriptionRef.current = e.target.value)}
            />
            
        </div>
        <br />
        <div className="input-sec">

            <LocalizationProvider dateAdapter={AdapterDayjs} >
            <DemoContainer components={['DateTimePicker']} >
                <DateTimePicker 
                label="From" 
                sx={{width:"403px"}} 
                onChange={(value) => (fromTimeRef.current = value)}
                />
            </DemoContainer>
            </LocalizationProvider>

            <LocalizationProvider dateAdapter={AdapterDayjs} >
            <DemoContainer components={['DateTimePicker']} >
                <DateTimePicker 
                label="To" 
                sx={{width:"403px"}} 
                onChange={(value) => (toTimeRef.current = value)}
                />
            </DemoContainer>
            </LocalizationProvider>

        </div>
        <br />
        <br />
        <div className="input-sec">

            {
                venueCheck &&
                <TextField 
                    id="common-venue" 
                    label="Venue" 
                    helperText="Eg. SF Block CSE lab 2"
                    variant="outlined" 
                    sx={{width:"35%"}}
                    onChange={(e) => (commonVenueRef.current = e.target.value)}
                />
            }

            <div className="check-box">
                <p>Have common Venue ?</p>
                <Checkbox 
                    slotProps={{ 'aria-label': 'Checkbox demo' }} 
                    checked={venueCheck}
                    onChange={()=>{setVenueCheck(prev=>!prev)}}
                />
            </div>

        </div>
        <br />
        <br />
        <h2>Faculty Details</h2>
        <br />
        <br />
        <div className="input-sec">
            <TextField
            id="no-of-faculty"
            label="Number of Faculty"
            type="number"
            helperText="Must be one and above"
            sx={{width:"35%"}}
            onChange={(e) => setFacultyCount(parseInt(e.target.value))}
            defaultValue={facultyCount||0}
            />

            <Autocomplete
                multiple
                id="department-specific"
                options={department}
                getOptionLabel={(option) => option}
                filterSelectedOptions
                sx={{width:"50%"}}
                onChange={(_, value) => (departmentSpecificRef.current = value)}
                renderInput={(params) => (
                <TextField
                    {...params}
                    label="Department Specific"
                    helperText="Optional"
                />
                )}
            />
        </div>
        <br />
        <br />
        <div className="input-sec">

            <TextField
                
                id="allocation-type"
                label="Allocation Type"
                defaultValue="Faculty with Low Work Hour"
                slotProps={{
                    input: {
                    readOnly: true,
                    },
                }}
                sx={{width:"35%"}}
            />

            <Autocomplete
                multiple
                id="skill-specific"
                options={skills}
                getOptionLabel={(option) => option}
                filterSelectedOptions
                sx={{width:"50%"}}
                onChange={(_, value) => (skillSpecificRef.current = value)}
                renderInput={(params) => (
                <TextField
                    {...params}
                    label="Skill Specific"
                    helperText="Optional"
                />
                )}
            />

        </div>
        <br />
        <br />
        {
            !venueCheck 
            && 
            (
            <>
                <h2>Venue Details</h2>
                <br />
                <br />
                <div className="input-sec">
                    <TextField
                        id="venue"
                        label="Venue"
                        helperText="Type your venue and press ENTER"
                        variant="outlined"
                        value={venueInput}
                        onChange={(e) => setVenueInput(e.target.value)}
                        onKeyDown={handleVenueKeyDown}
                        sx={{ width: "35%" }}
                    />

                    
                    <div className='custom-div'>
                        
                        <div>
                            {venue.length > 0 ? (
                            venue.map((item, index) => (
                                <Chip
                                key={index}
                                label={item}
                                onDelete={() => setVenue(venue.filter((_,i) => i !== index))}
                                // color="primary"
                                // variant="outlined"
                                size="small" // Adjusted chip size for better fit
                                />
                            ))
                            ) : (
                            <p>No Venue Selected</p>
                            )}
                        </div>

                        {/* Helper Text */}
                        <p>
                            No. of Venue should be equal to No. of Faculty {`(${venue.length}/${facultyCount})`}
                        </p>
                    </div>

                </div>
            </>
            )
        }
        <br />
        <br />
        <br />
        <br />
        <div className="input-sec">

            <button className='button-cancel' onClick={()=>{navigate("/work-allocation")}}>Cancel</button>
            <button className='button-done' onClick={handleSubmit}>Submit </button>

        </div>

    </div>
    <Toaster />
    </>
  )
}

export default WorkAllocationCreate