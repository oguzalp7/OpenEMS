"use client"

import { getPlainSession } from "@/actions"
import { apiClient } from "@/apiClient.client"
import ChakraDataTable from "@/components/data-table.component"
import Loading from "@/components/loading.component"
import UpdateModal from "@/components/update-modal.component"
import { validateAndCombineContact } from "@/utils"
import { Button, Checkbox, Input, InputGroup, InputLeftAddon, Select, Stack, VStack } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react'


const Customers = () => {
    const [sess, setSession] = useState({});

    useEffect(() => {
        const fetchSessionInfo = async () => {
            const session = await getPlainSession();
            setSession(session);
        }
        fetchSessionInfo();
    }, [])

    const [countryCodes, setCountryCodes] = useState([]);
    const [selectedCountryCode, setSelectedCountryCode] = useState('')

    const [phoneNumber, setPhoneNumber] = useState('');

    const [name, setName] = useState(''); 
    
    const [blacklisted, setBlacklisted] = useState(false);

    const [originalData, setOriginalData] = useState([]);
    const [data, setData] = useState([]);
    const [url, setURL] = useState('/customer/');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState(null);

    const [recordId, setRecordId] = useState('');

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

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
        const session = await getPlainSession();
        
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
            setOriginalData(processedData);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
        };

        fetchCustomers();
    }, [url]);
    
    useEffect(() => {
        const fetchCountryCodes = async () => {
        const session = await getPlainSession();
        
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



    const handleUpdate = (rowData) => {
        //console.log(rowData);
        const originalRowData = originalData.find((data) => data.SIRA === rowData.SIRA);
        if (originalRowData) {
        setRecordId(originalRowData.id);
        } else {
        console.error('No matching data found in originalData for SIRA:', rowData.SIRA);
        }
        //console.log(originalRowData);
        setRecordId(originalRowData.id)
        // setModalContent(rowData);
        setIsModalOpen(true);
    };

    useEffect(() => {
        const fetchRecordById = async () => {
        const requestOptions = {
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sess.token}`,
            },
        };
        
        try{
            if(recordId){
            const response = await apiClient.get(`/customer/${recordId}`, requestOptions);
            setModalContent(response.data)
            setRecordId('')
            }
        }catch(error){
            console.error('Error fetching record:', error);
            setModalContent(null)
            setRecordId('')
        }
        }
        fetchRecordById();
    }, [recordId]);

    const handleDelete = async (rowData) => {
        /* const originalRowData = originalData.find((data) => data.SIRA === rowData.SIRA);
        if (!originalRowData) {
        console.error('No matching data found in originalData for SIRA:', rowData.SIRA);
        return;
        }
        console.log(originalRowData)
        const customerId = originalRowData.id;
        const requestOptions = {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sess.token}`,
        },
        };
    
        try {
        await apiClient.delete(`/customer/${customerId}`, requestOptions);
        setData((prevData) => prevData.filter((customer) => customer.id !== customerId));
        setOriginalData((prevData) => prevData.filter((customer) => customer.id !== customerId));
        } catch (error) {
        console.error('Error deleting customer:', error.response ? error.response.data : error.message);
        } */
    };
    

    // define buttons
    const customButtons = [
        {
            label: 'Güncelle',
            color: 'gray',
            onClick: handleUpdate,
        },
        {
            label: 'Sil',
            color: 'red',
            onClick: handleDelete,
        },
            
    ];


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
            <ChakraDataTable  obj={data} title={'MÜŞTERİLER'} showButtons={true} customButtons={customButtons} />
          ):(
            <Loading/>
          )}
          
        </VStack>
    
      );
}

export default Customers;