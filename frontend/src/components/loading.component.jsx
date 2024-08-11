"use client"

import React from 'react'
import { Skeleton, VStack, HStack, Spinner, Stack } from '@chakra-ui/react'

const Loading = () => {
  return (
    <VStack>
        <HStack>
            <Spinner />
        </HStack>
        <Skeleton height='20px' startColor='pink.500' endColor='orange.500' />
        <Skeleton height='20px' startColor='pink.500' endColor='orange.500' />
        <Skeleton height='20px' startColor='pink.500' endColor='orange.500' />
    </VStack>
  )
}

export default Loading