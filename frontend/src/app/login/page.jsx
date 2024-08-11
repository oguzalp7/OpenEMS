"use client"
import LoginForm from '../../components/forms/login-form.component'
//import { useRouter } from 'next/navigation'

import React, { useEffect, useState } from 'react'
//import { getSession } from '../../actions'


const Login = () => {
  //const [session, setSession] = useState({});
  //const router = useRouter();

  // useEffect(() => {
  //   const fecthSession = async () => {
  //     const _session = await getSession();
  //     setSession(JSON.parse(JSON.stringify(_session)));
  //   }
  //   fecthSession();
  // },[]);
  
  // useEffect(() => {
  //   if(session && session.isLoggedIn){
  //     router.push('/');
  //   }
  // }, [session, session.isLoggedIn]);

  return (
    <LoginForm/>
  )
}

export default Login