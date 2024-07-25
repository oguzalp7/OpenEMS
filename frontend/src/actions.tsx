"use server"
import { sessionOptions, SessionData, defaultSession } from "./lib"
import { getIronSession } from "iron-session";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiClient } from "./apiClient";


export const getSession = async () => {
    //"use server";
    const session = await getIronSession<SessionData>(cookies(), sessionOptions)
    if (!session.isLoggedIn) {
        session.isLoggedIn = defaultSession.isLoggedIn;
    }
    return session;
}


export const login = async (
    prevState: { error: undefined | string },
    formData: FormData
) => {
    
    const session = await getSession();

    const formUsername = formData.get("username") as string;
    const formPassword = formData.get("password") as string;

    //implement login
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
    
    session.token = response.data.access_token
    session.uid = response.data.uid
    session.authLevel = response.data.auth_level

    if(response.data.department){
        session.departmentId = response.data.department
    }

    if(response.data.branch_id){
        session.branchId = response.data.branch_id
    }

    session.isLoggedIn = true
    await session.save();
    redirect("/");
}


export const logout = async () => {
    //"use server";
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