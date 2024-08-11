// app/providers.tsx
'use client';

import { theme } from '@/theme';
import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider } from '@chakra-ui/react';
import { VStack, HStack, Box } from "@chakra-ui/react";
import Footer from '@/components/footer';

export function Providers({ children }) {
  return (
    <CacheProvider>
        <ChakraProvider theme={theme}>
            <VStack>
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
    </CacheProvider>
  );
}