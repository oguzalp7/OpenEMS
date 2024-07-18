"use server"
import { sessionOptions, SessionData, defaultSession } from "./lib"
import { getIronSession } from "iron-session";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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
    //"use server";


}


export const logout = async () => {
    //"use server";
    const session = await getSession();
    session.destroy();
    redirect("/login");
}