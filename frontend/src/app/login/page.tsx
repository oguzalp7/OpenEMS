"use server"
import { getSession } from "@/actions"
import LoginForm from "@/components/login-form.component"
import { redirect } from "next/navigation"


const LoginPage = async () => {  
  const session = await getSession()
    
  if(session.isLoggedIn){
    redirect("/")
  }

  return (
      <LoginForm/>
  )
}

export default LoginPage