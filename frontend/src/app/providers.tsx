// app/providers.tsx
'use client'

import { ChakraProvider } from '@chakra-ui/react'
import {theme} from '../theme'
import { useState, useEffect } from "react";
import { getSession } from '@/actions';
import { VStack, HStack, Box } from "@chakra-ui/react";
import Navbar from "@/components/navbar.component";
import Footer from "@/components/footer.component";



export function Providers({ children }: { children: React.ReactNode }) {

  const [session, setSession] = useState({})
  
  useEffect(() => {
    const getSessionInfo = async () => {
      const ses_ = await getSession()
      //console.log(ses_)
      setSession(ses_)
    }
    getSessionInfo();
  }, []);
  
  return (
    <ChakraProvider theme={theme}>

      <VStack>
         {session && session.isLoggedIn &&  <Navbar/>}
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
    </ChakraProvider>
  );
  
}