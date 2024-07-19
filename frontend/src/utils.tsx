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

 // Convert date string to timestamp string
 export const convertDateToTimestamp = (dateString) => {
  const dateObj = new Date(dateString);
  return Math.floor(dateObj.getTime() / 1000).toString();
};

export const reorderColumns = (data, order) => {
    return data.map(item => {
      let orderedItem = {};
      order.forEach(key => {
        // Check if the key exists in the item and is not null, undefined, or an empty string
        if (item[key] !== null && item[key] !== undefined && item[key] !== '') {
          orderedItem[key] = item[key];
        }
      });
      return orderedItem;
    });
  };