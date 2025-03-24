import React ,{useState , useEffect, useRef} from 'react';
import './Approvals.css'
import  { useSelector } from 'react-redux';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { IoIosArrowForward } from "react-icons/io";
import { TbFilterSearch } from "react-icons/tb";
import { FaExpandArrowsAlt } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { FaFileCircleCheck } from "react-icons/fa6";

import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Chip from '@mui/material/Chip';
import Pagination from '@mui/material/Pagination';

import NoDataFound from '../../components/NoDataFound/NoDataFound';
import {ThreeDot} from 'react-loading-indicators'

import { apiGet , apiPut } from '../../helper/apiHelper';

const Approvals = () => {

  const user = useSelector((state) => state.userInfo.user);
  const theme = useSelector((state) => state.themeInfo.theme);

  const navigate = useNavigate();

  const [allocations , setAllocations] = useState(null);

  const [page, setPage] = React.useState(1);
  const [totalPages , setTotalPages] = useState(0);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const fetchAllocations = async()=>{

    const response = await apiGet(`/api/allocations/getAllocation?approvalStatus=pending&page=${page}`);

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

  const getTotalHoursForClient = (startTime,endTime)=>{
    const start = new Date(startTime);
    const end = new Date(endTime);

    const diffInMs = end - start; 
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60)); 
    const diffInMinutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));

    if(diffInMinutes === 0)
      return `${diffInHours} hrs`

    return `${diffInHours} hrs ${diffInMinutes} min`;
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
    if(loading) return;
    setOpen(false);
    setSelectedAllocation(null);
  }

  const [selectedAllocation , setSelectedAllocation] = useState(null);

  const remarkRef = useRef("");

  const [loading , setLoading] = useState(false);

  const handleApprovalStatus =async (allocationId , approvalStatus , remark)=>{
    
    const reason = remark.trim();
    

    if(!reason)
    {
      toast.error("Remark is mandatory for approval and rejection.");
      return;
    }

    setLoading(true);

    const response = await apiPut(`/api/allocations/approveAllocation/${allocationId}`,{approvalStatus , reason});

    if(response)
    {
      toast.success(`Allocation ${approvalStatus==="approved" ?"Approved":"Rejected"} successfully.`);
    }

    setLoading(false);

    handleClose();

  }





  return (
    <>
    <div className="approvals">
      <div className={`bread-crumbs`}>
          <p>Faculty Task Portal</p>
          <IoIosArrowForward />
          <p>Approvals</p>
      </div>
      <br />
      <br />
      <br />
      <div className="header">
        <h2>Approvals</h2>
        <div className="icons">
          <h2><TbFilterSearch /></h2>
        </div>
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
          <h3 className="assigned-by">Assigned By</h3>
          <h3 className="icon">Actions</h3>
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
                  <p className="assigned-by">{allocation.assignedBy}</p>
                  <p className="icon" onClick={()=>{handleModalOpen(allocation)}}><FaExpandArrowsAlt /></p>
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
                  
                  {JSON.parse(selectedAllocation.departmentSpecific) !== null ? 
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
            id="remark" 
            label="Remark" 
            variant="outlined" 
            helperText="Remark is mandatory for APPROVAL or REJECTION"
            sx={{width:"80%"}}
            required 
            inputRef={remarkRef}
          />

          

          <div className="btn-grp">
            <button className='button-cancel' disabled={loading} onClick={handleClose}>Cancel</button>
            <button className='button-reject' disabled={loading} onClick={()=>{handleApprovalStatus(selectedAllocation.id , "rejected" , remarkRef.current.value)}}><MdDeleteForever />Reject</button>
            <button className='button-done'   disabled={loading} onClick={()=>{handleApprovalStatus(selectedAllocation.id , "approved" , remarkRef.current.value)}}><FaFileCircleCheck />Approve</button>
          </div>


        </div>

      </Modal>


    }

    {/* {
      loading &&

      <div className="loading">
        <ThreeDot variant="bounce" color="#3B82F6" size="large" text="loading" textColor="" />
      </div>
    }
     */}
    <Toaster/>
    </>
  )
}

export default Approvals