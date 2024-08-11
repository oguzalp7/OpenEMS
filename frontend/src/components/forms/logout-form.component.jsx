
import React from 'react'
import { logout } from '@/actions'
import { Text, Button, VStack, HStack } from '@chakra-ui/react'


const LogoutForm = () => {
  
  return (
    <VStack>
      <Text>Çıkmak istediğinize emin misiniz?</Text>
      <HStack>
        <form action={logout}>
          <Button type='submit' color={'white'} colorScheme='red'>Evet</Button>
        </form>
       
        {/* <Button colorScheme='green' color={'white'} onClick={() => {window.location.href = '/'}}>Hayır</Button> */}
      </HStack>
    </VStack>
    
  )
}

export default LogoutForm