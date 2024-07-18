import Link from "next/link";
import LogoutForm from "./logout-form.component";
import { getSession } from "@/actions";
const Navbar = async () => {

    const session = await getSession();
    

    return(
        <nav>
            {session.isLoggedIn && <Link href={'/'}>Home</Link>}
            {/* {!session.isLoggedIn && <Link href={'/login'}>Login</Link>} */}
            {session.isLoggedIn && <Link href={'/events'}>Events</Link>}
            {session.isLoggedIn && <LogoutForm/>}
        </nav>
    );
}

export default Navbar