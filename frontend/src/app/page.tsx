
import { getSession } from "@/actions";
import Footer from "@/components/footer.component";
import Navbar from "@/components/navbar.component";
import checkLoggedIn from "@/utils";
import { Box, HStack, VStack } from "@chakra-ui/react";


const  Home = async ({
    children,
  }: {
    children: React.ReactNode;
  }) =>  {
  const session = await getSession();

  // await checkLoggedIn();
  
  

  return (
    <VStack>
      <Navbar/>
      <Box 
          w={['full', 'full']} 
          p={[8, 10]}
          mt={[20, '10vh']}
          mx='auto'
          border={['none', 'none']}
          borderColor={['', 'gray.300']}
          borderRadius={10}
      >
        <VStack>
          <HStack>
            {children}
          </HStack>
        </VStack>
        
          
      </Box>
      <Footer/>
    </VStack>
  );
}


export default Home;