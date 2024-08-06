"use client"
import { getSession } from "@/actions";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";



// --------------------------------------


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
    //router.push('/events')
  }, [session])


  
  //const [isOn, toggleSwitch] = useToggleSwitch();
  

  return (
    <>
      
    </>
  );
}


export default Home;