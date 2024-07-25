"use client"
import React, { useState } from 'react';
import { FormControl, FormLabel, Input, Switch, Box, Button } from '@chakra-ui/react';
import { getSession } from '@/actions';
import { apiClient } from '@/apiClient';

const CreateCustomerForm = () => {
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [blacklisted, setBlacklisted] = useState(false);

  const handleSubmit = async () => {
    const session = await getSession();
    const requestOptions = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`,
      },
    };

    const newCustomer = {
      name: name.toLocaleUpperCase('tr-TR'),
      country_code: countryCode,
      phone_number: phoneNumber,
      blacklisted,
    };

    try {
      const response = await apiClient.post('/customer/', newCustomer, requestOptions);
      console.log('Customer created:', response.data);
      // Handle successful creation (e.g., close modal, reset form, etc.)
      setName('');
      setCountryCode('');
      setPhoneNumber('');
      setBlacklisted(false);
    } catch (error) {
      console.error('Error creating customer:', error);
      // Handle error (e.g., show error message)
    }
  };

  return (
    <Box>
      <FormControl id="name" isRequired>
        <FormLabel>ADI-SOYADI</FormLabel>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="MÜŞTERİ ADI"
        />
      </FormControl>

      <FormControl id="country_code" isRequired mt={4}>
        <FormLabel>ÜLKE KODU</FormLabel>
        <Input
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
          placeholder="ÜLKE KODU"
        />
      </FormControl>

      <FormControl id="phone_number" isRequired mt={4}>
        <FormLabel>TELEFON NUMARASI</FormLabel>
        <Input
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="TELEFON NUMARASI"
        />
      </FormControl>

      <FormControl id="blacklisted" mt={4}>
        <FormLabel>KARA LİSTE</FormLabel>
        <Switch
          isChecked={blacklisted}
          onChange={(e) => setBlacklisted(e.target.checked)}
        />
      </FormControl>
      <Button w={"full"} colorScheme="blue" mt={4} onClick={handleSubmit}>
        KAYDET
      </Button>
    </Box>
  );
};

export default CreateCustomerForm;
