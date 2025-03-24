const backendURL = import.meta.env.VITE_BACKEND_API_URL;

import toast from 'react-hot-toast';

const apiRequest = async (endpoint, method, body = null) => {

    const apiURL = `${backendURL}${endpoint}`;

    let options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const token = localStorage.getItem("accessTokenFTP") || null;

    if (token) 
    {
        options.headers.Authorization = `Bearer ${token}`;
        // options.credentials = "include";
    }

    if (body) 
    {
        options.body = JSON.stringify(body);
    }

    try
    {
        const response = await fetch(apiURL, options);     

        if (response.status===200 || response.status===201) 
        {
            return await response.json();
        } 
    
        else if (response.status === 401 || response.status === 403) 
        {
            const error = await response.json();
            window.location.href = '/Auth';
            throw new Error(error.message);
        } 
        
        else 
        {
            const error = await response.json();
            throw new Error(error.message);
            
        }
    }
    catch(error)
    {
        console.log(error);
        
        toast.error(error.message);
        return null;
    }

    
    
    
};

export const apiGet = (endpoint) => apiRequest(endpoint, "GET");
export const apiPost = (endpoint, body) => apiRequest(endpoint, "POST", body);
export const apiPut = (endpoint, body) => apiRequest(endpoint, "PUT", body);
export const apiDelete = (endpoint) => apiRequest(endpoint, "DELETE");
