"use server"

import { sessionOptions, defaultSession } from "./lib"
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import apiClient from "./apiClient.server";

export const getSession = async () => {
    const session = await getIronSession(cookies(), sessionOptions)
    if (!session.isLoggedIn) {
        session.isLoggedIn = defaultSession.isLoggedIn;
    }
    return session;
}

export const getPlainSession = async () => {
    const session = await getIronSession(cookies(), sessionOptions)
    if (!session.isLoggedIn) {
        session.isLoggedIn = defaultSession.isLoggedIn;
    }
    return JSON.parse(JSON.stringify(session));
}

export const login = async (prevState, formData) => {
    const session = await getSession();
    
    const formUsername = formData.get("username");
    const formPassword = formData.get("password");

    const data = new URLSearchParams();
    data.append("grant_type", "");
    data.append("username", formUsername);
    data.append("password", formPassword);
    data.append("scope", "");
    data.append("client_id", "");
    data.append("client_secret", "");
   
    const response = await apiClient.post('/auth/token', data, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });
    
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
    apiClient.defaults.headers.common['Content-Type'] = "application/json";
    
    session.token = response.data.access_token
    session.uid = response.data.uid
    session.authLevel = response.data.auth_level

    if (response.data.department) {
        session.departmentId = response.data.department
    }

    if (response.data.branch_id) {
        session.branchId = response.data.branch_id
    }

    session.isLoggedIn = true;
    
    await session.save();
    redirect("/");
}

export const logout = async () => {
    const session = await getSession();
    session.destroy();
    redirect("/login");
}

export const createUserEmployee = async (data) => {
    const session = await getSession();

    const requestOptions = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
    };
    const response = await apiClient.post('/user-employee/', data, requestOptions);
    
    return response.status
}

export const createBranch = async (data) => {
    const session = await getSession();

    const requestOptions = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
    };
    const response = await apiClient.post('/branch/', data, requestOptions);
    
    return response.status
}

export const createDepartment = async (data) => {
    const session = await getSession();

    const requestOptions = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
    };
    const response = await apiClient.post('/departments/', data, requestOptions);
    
    return response.status
}

export const createEmploymentType = async (data) => {
    const session = await getSession();

    const requestOptions = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
    };
    const response = await apiClient.post('/employment-types/', data, requestOptions);
    
    return response.status
}

export const createPaymentType = async (data) => {
    const session = await getSession();

    const requestOptions = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
    };
    const response = await apiClient.post('/payment-types/', data, requestOptions);
    
    return response.status
}

export const createCustomer = async (data) => {
    const session = await getSession();

    const requestOptions = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
    };
    data.name = data.name.toLocaleUpperCase('tr-TR');
    data.phone_number = data.phone_number.replace(" ", "");
    const response = await apiClient.post('/customer/', data, requestOptions);
    
    return response.status
}

export const createProcess = async (data) => {
    const session = await getSession();

    const requestOptions = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
    };
    const response = await apiClient.post('/processes/', data, requestOptions);
    
    return response.status
}