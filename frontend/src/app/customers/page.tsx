// pages/customers.js
"use client";

import { getSession } from '@/actions';
import { apiClient } from '@/apiClient';
import ChakraDataTable from '@/components/data-table.component';
import Loading from '@/components/loading.component';
import { validateAndCombineContact } from '@/utils';
import { Button, Checkbox, Input, InputGroup, InputLeftAddon, Select, Stack, VStack } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react'

const Customers = () => {
  const [countryCodes, setCountryCodes] = useState([]);
  const [selectedCountryCode, setSelectedCountryCode] = useState('')

  const [phoneNumber, setPhoneNumber] = useState('');

  const [name, setName] = useState(''); 
  
  const [blacklisted, setBlacklisted] = useState(false);

  const [data, setData] = useState([]);
  const [url, setURL] = useState('/customer/');

   // configure fetch options
   useEffect(() => {

    let newUrl = '/customer/';
    const params = [];
    
    if (selectedCountryCode) {
      params.push(`cc=${selectedCountryCode}`);
    }

    if (phoneNumber) {
      params.push(`p=${phoneNumber}`);
    }

    if (name) {
      params.push(`n=${name}`);
    }

    if (blacklisted) {
      params.push(`bl=${blacklisted}`);
    }

    if (params.length > 0) {
      newUrl += `?${params.join('&')}`;
    }
    setURL(newUrl);

  }, [selectedCountryCode, phoneNumber, name, blacklisted]);

  const handleCountryCodeSelect = (selectedValue) => {
    
    setSelectedCountryCode(selectedValue);
    
  };

  const handleSelectPhoneNumber = (selectedPhoneNumber) => {
    setPhoneNumber(selectedPhoneNumber.target.value);
  }

  const handleSelectName = (selectedName) => {
    setName(selectedName.target.value);
  }

  const handleSelectBlacklisted = (selectedBlacklisted) => {
    setBlacklisted(selectedBlacklisted.target.checked);
  }

  useEffect(() => {
    const fetchCustomers = async () => {
      const session = await getSession();
    
      const requestOptions = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
      };

      try {
        const response = await apiClient.get(url, requestOptions);
        let processedData = response.data;
        processedData = validateAndCombineContact(processedData, 'TELEFON NUMARASI', 'ÜLKE KODU');
        setData(processedData);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    fetchCustomers();
  }, [url]);
  
  useEffect(() => {
    const fetchCountryCodes = async () => {
      const session = await getSession();
    
      const requestOptions = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
      };

      try {
        const response = await apiClient.get('/customer/countryCodes/', requestOptions);
        setCountryCodes(response.data);
        
      } catch (error) {
        console.error('Error fetching country codes:', error);
      }
    };

    fetchCountryCodes();
  }, []);


  const resetFilters = () => {
    setSelectedCountryCode("")
    setName("")
    setPhoneNumber("")
    setBlacklisted(false)
  }
 
  return (
    <VStack>
      <Stack flexDir={['column', 'column', 'row', 'row']}>
      <InputGroup>
      <InputLeftAddon>
        {countryCodes ? (
          <Select borderColor={"transparent"}
          placeholder=" " 
          value={selectedCountryCode} 
          onChange={(e) => handleCountryCodeSelect(e.target.value)}
          >
           {countryCodes.map((code) => (
        <option key={code} value={code}>
          {code}
        </option>
          ))}
        </Select>
          ):( 
          <Loading/>
          )}
      </InputLeftAddon>
      <Input 
          value={phoneNumber}
          type='tel'
          onChange={handleSelectPhoneNumber} 
          placeholder='Telefon Numarası' />
      </InputGroup>
      <Input
          value={name}
          onChange={handleSelectName}
          placeholder='Müşteri Adı'
        />
      <Checkbox isChecked={blacklisted} onChange={handleSelectBlacklisted}>Kara Liste</Checkbox>
      <Button background={'transparent'} onClick={resetFilters}>RESET</Button>
      </Stack>
      {data ? (
        <ChakraDataTable  obj={data} title={'MÜŞTERİLER'} showButtons={false}/>
      ):(
        <Loading/>
      )}
    </VStack>

  );
}

export default Customers