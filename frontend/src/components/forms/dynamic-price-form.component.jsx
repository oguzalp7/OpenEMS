"use client";

import React, { useState } from "react";
import { Box, VStack, Input, FormLabel, Button, Heading, useToast, InputGroup, InputRightElement } from "@chakra-ui/react";

const DynamicPriceForm = ({ data, onSubmit }) => {
  const [formValues, setFormValues] = useState(
    data.data.reduce((acc, item) => {
      Object.entries(item).forEach(([key, value]) => {
        acc[key] = value;
      });
      return acc;
    }, {})
  );

  const toast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formValues);
    // toast({
    //   title: "Prices Updated",
    //   description: "The prices have been updated successfully.",
    //   status: "success",
    //   duration: 3000,
    //   isClosable: true,
    // });
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <Heading as="h3" size="md" mb={4}>
        {data.name}
      </Heading>
      <VStack spacing={4}>
        {Object.entries(formValues).map(([label, value]) => (
          <Box key={label} width="100%">
            <InputGroup>
            <FormLabel htmlFor={label}>{label}</FormLabel>
            <Input
              type="number"
              id={label}
              name={label}
              value={value}
              onChange={handleChange}
            />
            <InputRightElement pointerEvents='none' color='gray.300' fontSize='1.2em'>
                ₺
            </InputRightElement>
            </InputGroup>
            
          </Box>
        ))}
        <Button w={'full'} type="submit" colorScheme="blue">
          KAYDET
        </Button>
      </VStack>
    </Box>
  );
};

export default DynamicPriceForm;
