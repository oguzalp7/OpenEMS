
import type { Metadata, Viewport } from "next";

import { Providers } from "./providers";
import Navbar from "@/components/navbar.component";
import Footer from "@/components/footer.component";

import { VStack, HStack, Box } from "@chakra-ui/react";

export const metadata: Metadata = {
  title: "MS Management System",
  description: "Employee Management System",
};

export const viewport: Viewport = {
  themeColor: "#3580f6",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  return (
    <html lang="en">
      <body>
      <Providers>
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
      </Providers>
      </body>
    </html>
  );
}
