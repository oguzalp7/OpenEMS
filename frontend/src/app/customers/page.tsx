// pages/customers.js
"use client";

import { getSession } from '@/actions';
import { apiClient } from '@/apiClient';
import ChakraDataTable from '@/components/data-table.component';
import Loading from '@/components/loading.component';
import { Checkbox, HStack, Input, InputGroup, InputLeftAddon, VStack } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react'

const Customers = () => {
  const [phoneNumber, setPhoneNumber] = useState('');

  const [name, setName] = useState(''); 
  
  const [blacklisted, setBlacklisted] = useState(false);

  const [data, setData] = useState([]);
  const [url, setURL] = useState('/customer/');

   // configure fetch options
   useEffect(() => {

    let newUrl = '/customer/';
    const params = [];
    
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

  }, [phoneNumber, name, blacklisted]);

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
        setData(response.data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    fetchCustomers();
  }, [url]);
  console.log(data)
  console.log(phoneNumber)
  return (
    <VStack>
      <HStack>
      <InputGroup>
      <InputLeftAddon>+90</InputLeftAddon>
      <Input 
          type='tel'
          onChange={handleSelectPhoneNumber} 
          placeholder='Telefon Numarası' />
      </InputGroup>
      <Input
          value={name}
          onChange={handleSelectName}
          placeholder='Müşteri Adı'
        />
      <Checkbox onChange={handleSelectBlacklisted}>Kara Liste</Checkbox>
      </HStack>
      {data ? (
        <ChakraDataTable  obj={data} title={'MÜŞTERİLER'} showButtons={false}/>
      ):(
        <Loading/>
      )}
    </VStack>

  );
}

export default Customers