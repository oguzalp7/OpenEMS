"use client"

import React from 'react'
import { Text } from '@chakra-ui/react'

const Footer = () => {
  return (
    <Text fontSize="sm" color="white">
          &copy; {new Date().getFullYear()} <a href='https://lavittoria.ai'>La Vittoria AI</a>. All rights reserved.
        </Text>

  )
}

export default Footer