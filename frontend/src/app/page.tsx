"use client"
import { getSession } from "@/actions";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  InputGroup,
  Stack,
  InputLeftAddon,
  Input,
  InputRightAddon,
  Button
} from '@chakra-ui/react'

import ChakraDropdown from "@/components/dropdown.component";

import ChakraModal from "@/components/modal.component";
import DynamicForm from "@/components/dynamic-form.component";

import * as yup from 'yup';

const CustomInput = () => {

  const options = [
    {
      id: 1,
      name: "NAKİT"
    },
    {
      id: 2,
      name: "VISA"
    }
  ]

  return (
    <Stack spacing={4}>
      <InputGroup>
        <InputLeftAddon><Input variant='unstyled' type='text' placeholder='Country Code' value={'+90'}/></InputLeftAddon>
        <Input type='tel' placeholder='phone number' />
      </InputGroup>

      {/* If you add the size prop to `InputGroup`, it'll pass it to all its children. */}
      <InputGroup size='sm'>
        {/* <InputLeftAddon>https://</InputLeftAddon> */}
        <Input type="number" placeholder='Miktar' />
        <InputRightAddon><ChakraDropdown options={options} label={'Ödeme Tipi'} initialValue={''} value={""} /></InputRightAddon>
      </InputGroup>
    </Stack>
  );
}


const  Home = () =>  {
  const router = useRouter()
  const [session, setSession] = useState({})

  const [formConfig, setFormConfig] = useState([]);

  const schema = yup.object().shape({
    name: yup.string().required('Name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  });

  useEffect(() => {
    setFormConfig([
      { type: 'text', name: 'name', label: 'Name' },
      { type: 'email', name: 'email', label: 'Email' },
      { type: 'date', name: 'date', label: 'Date' },
      { type: 'select', name: 'department', label: 'Department', options: [{ id: 1, name: 'HR' }, { id: 2, name: 'Engineering' }] },
      // Add more fields based on rowData if needed
    ]);
  },[])
  
  useEffect(() => {
    const getSessionInfo = async () => {
      const ses_ = await getSession()
      //console.log(ses_)
      setSession(ses_)
    }
    getSessionInfo();
  }, []);
  
  
  useEffect(() => {
    //router.push('/events')
  }, [session])


  // temporary add
  const handleSave = () => {
    console.log("Save clicked");
  };

  const handleAnotherAction = () => {
    console.log("Another action clicked");
  };

  const buttons = [
    { colorScheme: "blue", onClick: handleSave, text: "KAYDET" },
    { colorScheme: "green", onClick: handleAnotherAction, text: "ANOTHER ACTION" },
  ];

  const handleFormSubmit = (formData) => {
    console.log(formData);
    // Perform your API call here
  };


  return (
    <>
    {/* <ChakraModal buttons={buttons}>
        <CustomInput/>
    </ChakraModal> */}
    <DynamicForm schema={schema} formConfig={formConfig} onSubmit={handleFormSubmit} />
    </>
  );
}


export default Home;