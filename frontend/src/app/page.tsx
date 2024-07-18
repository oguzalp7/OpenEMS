
import { getSession } from "@/actions";
import checkLoggedIn from "@/utils";

const  Home = async () =>  {
  const session = await getSession();

  await checkLoggedIn();
  
  return (
    <>
    Homepage
    </>
  );
}


export default Home;