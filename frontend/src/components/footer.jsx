"use client"

import React from 'react'
import { Text, useColorMode, VStack, Image } from '@chakra-ui/react'

const Footer = () => {
  const { colorMode, toggleColorMode } = useColorMode()
  return (
    <VStack>
        <Text fontSize="sm" color={colorMode === 'light' ? 'black' : 'white'}>
          &copy; {new Date().getFullYear()} <a href='https://lavittoria.ai'>La Vittoria AI</a>. All rights reserved.
        </Text>
        {/* <Image alt='La Vittoria Logo' src='https://lavittoria.ai/img/LV.png' boxSize='100px'/> */}
    </VStack>
    

  )
}

export default Footer