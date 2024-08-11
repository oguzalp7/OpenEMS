import { SessionOptions } from "iron-session";

export const defaultSession = {
    isLoggedIn: false
}

export const sessionOptions = {
    password: process.env.SECRET_KEY,
    cookieName: "lv-session",
    cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "development"
    }
}
