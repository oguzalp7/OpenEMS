"use client";

import React from 'react';
import { FormControl, FormLabel, Select, FormErrorMessage, HStack, Text } from '@chakra-ui/react';
import { useEffect } from 'react';

const SelectInput = ({ name, label, options, register, error }) => {
  const labelMapping = {
    'Department Id': 'DEPARTMAN',
    'Auth Id': 'YETKİ',
    'Branch Id': 'ŞUBE',
    'Employment Type Id': 'ÇALIŞMA TİPİ',
    'Employee Id': 'PERSONEL',
    'Optional Makeup Id': 'MAKEUP2',
    'Hair Stylist Id': 'SAÇ',
    'Plus': 'GELİN+',
    'Payment Type Id': 'ÖDEME TİPİ',
    'Process Id': 'İŞLEM'
  };
  const label_ = labelMapping[label] || label;
  
  
  return (
    <FormControl isInvalid={error}>
      <HStack>
        {/* <FormLabel htmlFor={name}>
          <Text noOfLines={1} as={'b'}>{label.toUpperCase()}:</Text>
        </FormLabel> */}
        <Select id={name} {...register(name)}>
          <option value={""}><Text>{label_ ? label_.toUpperCase() : 'LABEL NOT FOUND'}</Text></option>
          {options.map((option) => (
            <option key={option.id} value={option.id || option.ID}>{option["AD-SOYAD"] || option.ADI || option.name}</option>
          ))}
        </Select>
      </HStack>
      {error && <FormErrorMessage>{error.message}</FormErrorMessage>}
    </FormControl>
  );
};

export default SelectInput;
