"use client";

import React from 'react';
import { FormControl, FormLabel, Select, FormErrorMessage, Text } from '@chakra-ui/react';
import { useController } from 'react-hook-form';

const SelectInputV2 = ({ name, label, options, control }) => {
  const {
    field: { onChange, value, ref },
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue: '', // default value to ensure the initial render is correct
  });

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
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={name}></FormLabel>
      <Select id={name} ref={ref} value={value} onChange={onChange}>
        {!value && <option value={""}><Text>{label_ ? label_.toUpperCase() : 'LABEL NOT FOUND'}</Text></option>}
        {options.map((option) => (
          <option key={option.id} value={option.id || option.ID}>
            {option["AD-SOYAD"] || option.ADI || option.name}
          </option>
        ))}
      </Select>
      {error && <FormErrorMessage>{error.message}</FormErrorMessage>}
    </FormControl>
  );
};

export default SelectInputV2;
