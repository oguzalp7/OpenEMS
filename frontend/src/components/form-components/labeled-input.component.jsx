"use client"

import React from 'react';
import { FormControl, FormLabel, Input, FormErrorMessage, HStack, VStack, Text } from '@chakra-ui/react';

const LabeledInput = ({ name, type, label, register, error }) => {
  return (
    <FormControl isInvalid={error}>
      <HStack align="start">
        <VStack align="start">
          <FormLabel htmlFor={name}>
            <Text  as="b">{label.toUpperCase()}:</Text>
          </FormLabel>
        </VStack>
        <VStack w={['full']}  align="start">
          <Input  id={name} type={type} {...register(name)} />
          {error && <FormErrorMessage>{error.message}</FormErrorMessage>}
        </VStack>
      </HStack>
    </FormControl>
  );
};

export default LabeledInput;
