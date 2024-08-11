
"use client"

import React from 'react';
import { FormControl, FormLabel, Checkbox, FormErrorMessage, HStack, Text } from '@chakra-ui/react';

const CheckboxInput = ({ name, label, register, error }) => {
  return (
    <FormControl isInvalid={error}>
      <HStack>
        <FormLabel htmlFor={name}><Text as={'b'} noOfLines={1}>{label.toUpperCase()}: </Text></FormLabel>
        <Checkbox id={name} {...register(name)} />
      </HStack>
      {error && <FormErrorMessage>{error.message}</FormErrorMessage>}
    </FormControl>
  );
};

export default CheckboxInput;
