import React from 'react'
import { useState , useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './WorkAllocation.css'
import  { useSelector } from 'react-redux';
import NoDataFound from '../../components/NoDataFound/NoDataFound';

import toast, { Toaster } from 'react-hot-toast';

import { IoIosArrowForward } from "react-icons/io";
import { FaFileCirclePlus } from "react-icons/fa6";
import { FaExpandArrowsAlt } from "react-icons/fa";

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Chip from '@mui/material/Chip';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Pagination from '@mui/material/Pagination';

import { apiGet  } from '../../helper/apiHelper';

const WorkAllocation = () => {

  const user = useSelector((state) => state.userInfo.user);
  const theme = useSelector((state) => state.themeInfo.theme);

  const navigate = useNavigate();

  const [allocations , setAllocations] = useState(null);
  const [selectedAllocation , setSelectedAllocation] = useState(null);
  const [page, setPage] = React.useState(1);
  const [totalPages , setTotalPages] = useState(0);

  const handlePageChange = (event, value) => {
    setPage(value);
  };
  
  const fetchAllocations = async()=>{

    const department = encodeURIComponent(user.department)

    const response = await apiGet(`/api/allocations/getAllocationByDepartment/${department}?page=${page}`);

    if(response)
    {      
      setAllocations(response.data);

      setTotalPages(response.pagination.totalPages)
      
    }
    

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

  const getStatusForClient = (approvalStatus)=>{

    if(approvalStatus==='pending') return <Chip label="Pending" color="primary" variant="outlined" size="small"/>
    else if(approvalStatus==='rejected') return <Chip label="Rejected" color="error" variant="outlined" size="small"/>
    else return <Chip label="Approved" color="success" variant="outlined" size="small"/>

  }

  useEffect(()=>{
    fetchAllocations();
  },[page]);

  

  const [open, setOpen] = React.useState(false);
  
  const handleModalOpen = (allocation) =>{
    setSelectedAllocation(allocation)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false);
    setSelectedAllocation(null);
  }

  return (
    <>
      <div className='work-allocation'>
        <div className={`bread-crumbs`}>
          <p>Faculty Task Portal</p>
          <IoIosArrowForward />
          <p>Work Allocation</p>
        </div>
        <br />
        <br />
        <br />
        <div className="allocations">
          <div className="head">
            <h2>Work Allocations</h2>
            <button onClick={()=>navigate("/work-allocation/create")}><FaFileCirclePlus /> Allocate</button>
          </div>
          <br />
          <br />
          <div className="allocation-table">

            <div className="tr head">
              <h3 className="id">ID</h3>
              <h3 className="task">Task</h3>
              <h3 className="facultyCount">Count</h3>
              <h3 className="date">Date</h3>
              <h3 className="from">From</h3>
              <h3 className="to">To</h3>
              <h3 className="icon">Status</h3>
              <h3 className="assigned-by">Actions</h3>
              
            </div>
            {
              allocations !== null
              ?
              <>
              {
                allocations.length === 0
                ?
                <>
                  <NoDataFound/>
                </>
                :
                <>
                {
                  allocations.map((allocation , index)=>(
                
                    <div className="tr">
                      <h3 className="id">{allocation.id}</h3>
                      <p className="task">{allocation.task}</p>
                      <p className="facultyCount">{allocation.numberOfFaculty}</p>
                      <p className="date">{getDateForClient(allocation.fromTime)}</p>
                      <p className="from">{getTimeForClient(allocation.fromTime)}</p>
                      <p className="to">{getTimeForClient(allocation.toTime)}</p>
                      <p className="icon">{getStatusForClient(allocation.approvalStatus)}</p>
                      <p className="assigned-by" onClick={()=>{handleModalOpen(allocation)}}><FaExpandArrowsAlt /></p>
                    </div>
                  ))
                
                }
                <div className="pagination">
                  <Pagination count={totalPages} shape="rounded" page={page} onChange={handlePageChange}/>
                </div>
                </>
              }
              </>
              :
              <>
              <Box sx={{ width: "100%"}}>
                <Skeleton sx={{ height: "70px" , bgcolor:theme==="dark" ? "#9999991A":"#64748B30" }} />
                <Skeleton sx={{ height: "70px" , bgcolor:theme==="dark" ? "#9999991A":"#64748B30" }} />
                <Skeleton sx={{ height: "70px" , bgcolor:theme==="dark" ? "#9999991A":"#64748B30" }} />
                <Skeleton sx={{ height: "70px" , bgcolor:theme==="dark" ? "#9999991A":"#64748B30" }} />
                <Skeleton sx={{ height: "70px" , bgcolor:theme==="dark" ? "#9999991A":"#64748B30" }} />
              </Box>
              </>

            }
          </div>
          

        </div>
      </div>
      {
      open && selectedAllocation &&

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >

        <div className="modal">

          <h2>Allocation Details</h2>

          <div className="same-line-info">

            <TextField
              id="outlined-read-only-input"
              label="Task"
              defaultValue={selectedAllocation.task}
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
              sx={{width:"65%"}}
            />

            <TextField
              id="outlined-read-only-input"
              label="Faculty Count"
              defaultValue={selectedAllocation.numberOfFaculty}
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
              sx={{width:"30%"}}
            />

          </div>

          

          <TextField
            id="outlined-read-only-input"
            label="Description"
            defaultValue={selectedAllocation.description}
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
            sx={{width:"80%"}}
          />

          <div className="same-line-info">
            <TextField
              id="outlined-read-only-input"
              label="Date"
              defaultValue={getDateForClient(selectedAllocation.fromTime)}
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
              sx={{width:"35%"}}
            />
            <TextField
              id="outlined-read-only-input"
              label="From"
              defaultValue={getTimeForClient(selectedAllocation.fromTime)}
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
              sx={{width:"25%"}}
            />
            <TextField
              id="outlined-read-only-input"
              label="To"
              defaultValue={getTimeForClient(selectedAllocation.toTime)}
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
              sx={{width:"25%"}}
            />
          </div>
          

          <TextField
            id="outlined-read-only-input"
            label="Assigned By"
            defaultValue={selectedAllocation.assignedBy}
            sx={{width:"80%"}}
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />

          <div className='modal-div-array'>
     
              <div>
                  
                  {JSON.parse(selectedAllocation.departmentSpecific)!==null ? 
                  (
                  JSON.parse(selectedAllocation.departmentSpecific).map((item, index) => (
                      <Chip
                      key={index}
                      label={item}
                      size="small" 
                      />
                  ))
                  ) 
                  : 
                  (
                  <p>No Specific Department</p>
                  )}
              </div>
          </div>

          <div className='modal-div-array'>
     
              <div>
                  
                  {JSON.parse(selectedAllocation.skillSpecific) !== null ? 
                  (
                  JSON.parse(selectedAllocation.skillSpecific).map((item, index) => (
                      <Chip
                      key={index}
                      label={item}
                      size="small" 
                      />
                  ))
                  ) 
                  : 
                  (
                  <p>No Specific Skill</p>
                  )}
              </div>
          </div>

          <div className='modal-div-array'>
     
              <div>
                  
                  {JSON.parse(selectedAllocation.venue) !== null ? 
                  (
                  JSON.parse(selectedAllocation.venue).map((item, index) => (
                      <Chip
                      key={index}
                      label={item}
                      size="small" 
                      />
                  ))
                  ) 
                  : 
                  (
                    <Chip
                    label={`${selectedAllocation.commonVenue} (Common Venue)`}
                    size="small" 
                    />
                  )}
              </div>
          </div>

          <TextField
            id="outlined-read-only-input"
            label="Approval Status"
            defaultValue={`${selectedAllocation.approvalStatus.toUpperCase()} ${selectedAllocation.reason ==="pending" ? "" : `- ${selectedAllocation.reason}`}`} 
            sx={{width:"80%"}}
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />

      


        </div>

      </Modal>

      }
      <Toaster/>
    </>
  )
}

export default WorkAllocation