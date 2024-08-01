"use client"

import React from 'react'
import { Text, useColorMode } from '@chakra-ui/react'

const Footer = () => {
  const { colorMode, toggleColorMode } = useColorMode()
  return (
    <Text fontSize="sm" color={colorMode === 'light' ? 'black' : 'white'}>
          &copy; {new Date().getFullYear()} <a href='https://lavittoria.ai'>La Vittoria AI</a>. All rights reserved.
    </Text>

  )
}

export default Footer