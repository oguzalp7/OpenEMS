"use client"
import { getSession } from "@/actions";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";


const  Home = () =>  {
  const router = useRouter()
  const [session, setSession] = useState({})

  useEffect(() => {
    const getSessionInfo = async () => {
      const ses_ = await getSession()
      //console.log(ses_)
      setSession(ses_)
    }
    getSessionInfo();
  }, []);
  
  
  useEffect(() => {
    if(session && session.isLoggedIn){
      router.push('/events')
    }else{
      router.push('/login')
    }
    //
  }, [session, session.isLoggedIn])


  

  return (
    <>
    </>
  );
}


export default Home;