import Link from "next/link";
import LogoutForm from "./logout-form.component";
import { getSession } from "@/actions";
const Navbar = async () => {

    const session = await getSession();
    console.log(session)

    return(
        <nav>
            <Link href={'/'}>Home</Link>
            <Link href={'/login'}>Login</Link>
            <Link href={'/events'}>Events</Link>
            <LogoutForm/>
        </nav>
    );
}

export default Navbar