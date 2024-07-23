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

export const validateAndCombineContact = (data, phoneNumberKey, countryCodeKey) => {
    return data.map(item => {
        let newItem = { ...item };
        
        // Validate phone number and country code
        const phoneNumber = newItem[phoneNumberKey];
        const countryCode = newItem[countryCodeKey];

        if (phoneNumber && phoneNumber.length === 10 && countryCode && countryCode.length >= 2) {
        const formattedPhoneNumber = `(${countryCode}) ${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 6)} ${phoneNumber.slice(6, 8)} ${phoneNumber.slice(8, 10)}`;
        newItem.telefon = formattedPhoneNumber;
        } else {
        newItem.telefon = null;
        }
        
        // Remove the original phone number and country code columns
        delete newItem[phoneNumberKey];
        delete newItem[countryCodeKey];

        return newItem;
    });
};

export const renameColumn = (data, oldKey, newKey) => {
    return data.map(item => {
      let newItem = { ...item };
  
      // Check if the old key exists
      if (oldKey in newItem) {
        newItem[newKey] = newItem[oldKey];
        delete newItem[oldKey];
      }
  
      return newItem;
    });
  };

export const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
};


export const removeKeysFromObject = (obj: Record<string, any>, keysToRemove: string[]) => {
    const newObj = { ...obj };
    keysToRemove.forEach((key) => {
      delete newObj[key];
    });
    return newObj;
};
  
export const removeKeysFromArrayOfObjects = (array: Record<string, any>[], keysToRemove: string[]) => {
    return array.map((obj) => removeKeysFromObject(obj, keysToRemove));
};


export const hideKeysInObject = (obj: Record<string, any>, keysToHide: string[]) => {
    const newObj = { ...obj };
    keysToHide.forEach((key) => {
      if (newObj.hasOwnProperty(key)) {
        newObj[key] = null;
      }
    });
    return newObj;
};
  
export const hideKeysInArrayOfObjects = (array: Record<string, any>[], keysToHide: string[]) => {
    return array.map((obj) => hideKeysInObject(obj, keysToHide));
};