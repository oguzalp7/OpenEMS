"use client"

import { getPlainSession } from "@/actions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loading from "./loading.component";


const ProtectedRoute = ({ children }) => {
    const [session, setSession] = useState(null); // Start with null to indicate loading state
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchSession = async () => {
            const session_ = await getPlainSession();
            setSession(session_);
            setLoading(false); // Set loading to false after fetching session
        };
        fetchSession();
    }, []);

    useEffect(() => {
        if (!loading && session && !session.isLoggedIn) {
            router.push('/login');
        }
    }, [loading, session, router]);

    if (loading) {
        // Optionally, render a loading spinner or placeholder while fetching session
        return <Loading/>;
    }

    // Only render children if session is valid
    return session && session.isLoggedIn ? (
        <>
            
            {children}
        </>
     ) : null;
};

export default ProtectedRoute;
