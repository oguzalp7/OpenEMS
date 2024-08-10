"use client"

import { getSession } from "@/actions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


const ProtectedRoute = ({children}) => {

    const [session, setSession] = useState({});
    const router = useRouter();

    useEffect(() => {
        const fetchSession = async () => {
            const session_ = await getSession();
            setSession(session_)
        }
    }, []);

    useEffect(() => {
        if(!session){
            router.push('/login');
        }
    }, [session, router]);

    return session ? children : null;
}

export default ProtectedRoute