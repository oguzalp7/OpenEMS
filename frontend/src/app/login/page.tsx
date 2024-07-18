import { getSession } from "@/actions"
import LoginForm from "@/components/login-form.component"
import { redirect } from "next/navigation"
import checkLoggedIn from "@/utils"

const LoginPage = async () => {  
  const session = await getSession()
    
  await checkLoggedIn();
  
  return (
    <div className="login">
      <h1>Welcome to the LoginPage</h1>
      <LoginForm/>
    </div>
  )
}

export default LoginPage