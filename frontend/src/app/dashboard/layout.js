import Navbar from "@/components/navbar.component";


import { VStack, HStack, Box } from "@chakra-ui/react";


export const metadata = {
    title: "MS | Randevu Takip",
    description: "Müberya Sağlam Randevu Takip",
  };
  
  export default function DashboardLayout({ children }) {
    return (
      <html lang="en">
        <body suppressHydrationWarning>
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
               
            </VStack>
        </body>
      </html>
    );
  }