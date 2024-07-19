import { redirect } from "next/navigation";
import { getSession } from "./actions";
import { apiClient } from "./apiClient";
import { useState, useEffect } from "react";

const checkLoggedIn = async () => {
    const session = await getSession();
    
    if(!session.isLoggedIn){
        redirect("/login")
    }
}

export default checkLoggedIn;

export const fetchData = async (url: any) => {


    const session = await getSession();
    const requestOptions = {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.token}`,
        },  
    };
      
    const response = await apiClient.get(url, requestOptions);

    return response.data
}

// export const fecthData = async (url: string) => {
//     const [data, setData] = useState([])
//     const [error, setError] = useState('')
//     const [loading, setLoading] = useState(true)

//     const session = await getSession();
//     const requestOptions = {
//         headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${session.token}`,
//         },  
//     };

//     try{
//         const response = await apiClient.get(url, requestOptions)
//         setData(response.data)
//     }catch(err){
//         if(err){
//             console.log(err)
//         }
//     }finally{
//         setLoading(false)
//     }

//     return [data, error, loading];

// }