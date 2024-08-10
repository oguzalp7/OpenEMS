"use client";

import { login } from "@/actions";
import { useFormState } from "react-dom";
import { useColorMode, IconButton, Flex  } from "@chakra-ui/react";
import { Box, VStack, Image, Text, FormControl, FormLabel, Input, Button } from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";

const LoginForm = () => {
  const [state, formAction] = useFormState<any, FormData>(login, undefined);
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Box 
            w={['full', 'md']} 
            p={[8, 10]}
            
            mx='auto'
            border={['none', '1px']}
            borderColor={['', 'gray.300']}
            borderRadius={10}
        >
          <VStack spacing={4} align={'flex-start'} w='full'>
          <IconButton
                rounded="full"
                w='full'
                aria-label="Toggle color mode"
                bgColor="transparent"
                onClick={toggleColorMode}
                icon={colorMode === "light" ? <MoonIcon/> : <SunIcon/>}
                border={'1px'}
            />
            <VStack spacing={1} align={[ 'center']} w='full'> 
              <Image
                  src="./logo.png"
                  alt="Logo"
                  borderRadius='full'
                  boxSize={['100px', '150px', '200px', '250px']}
              />
              {/* <Text>Kullanıcı Adı ve Şifrenizi Giriniz.</Text> */}
              
              <form action={formAction}>
              <FormControl>
                      <FormLabel>Kullanıcı Adı:</FormLabel>
                      <Input rounded='none' variant='filled' type="text" name="username" required placeholder="Kullanıcı Adı"/>
              </FormControl>
              <br/>
              <FormControl>
                      <FormLabel>Şifre:</FormLabel>
                      <Input rounded='none' variant='filled' type="password" name="password" required placeholder="Şifre"/>
              </FormControl>
              <br/>
              <Button type="submit" colorScheme="blue" w='full'>Giriş Yap</Button>
              {state?.error && <p>{state.error}</p>}

            </form>

            </VStack>
            
          </VStack>
        </Box>
  );
};

export default LoginForm;


