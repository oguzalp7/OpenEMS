import { getSession } from "@/actions"
import LoginForm from "@/components/login-form.component"
import { redirect } from "next/navigation"

const LoginPage = async () => {  
  const session = await getSession()
    console.log(session)
  if(session.isLoggedIn){
    redirect("/")
  }
  return (
    <div className="login">
      <h1>Welcome to the LoginPage</h1>
      <LoginForm/>
    </div>
  )
}

export default LoginPage