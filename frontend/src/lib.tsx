import { SessionOptions } from "iron-session";

export interface SessionData {
    token?: string;
    departmentId?: number;
    branchId?: number;
    authLevel?: number;
    isLoggedIn: boolean;
}

export const defaultSession: SessionData = {
    isLoggedIn: false
}

export const sessionOptions: SessionOptions = {
    password: process.env.SECRET_KEY!,
    cookieName: "lv-session",
    cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "development"
    }
}