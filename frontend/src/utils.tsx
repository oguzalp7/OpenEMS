import { redirect } from "next/navigation";
import { getSession } from "./actions";

const checkLoggedIn = async () => {
    const session = await getSession();
    
    if(!session.isLoggedIn){
        redirect("/login")
      }
}

export default checkLoggedIn;