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
  Button,
  VStack, Text
} from '@chakra-ui/react'

import ChakraDropdown from "@/components/dropdown.component";

import ChakraModal from "@/components/modal.component";
import DynamicForm from "@/components/dynamic-form.component";

import * as yup from 'yup';
import Branch from "@/components/forms/branch-form.component";
import Department from "@/components/forms/department-form.component";
import PaymentType from "@/components/forms/payment-type-form.component";
import EmploymentType from "@/components/forms/employment-type-form.component";
import Process from "@/components/forms/process-form.component";
import EventForm from "@/components/forms/event.form.component";

import { Box, Switch, useColorMode } from '@chakra-ui/react';



const useToggleSwitch = (initialState = false) => {
  const [isOn, setIsOn] = useState(initialState);

  const toggleSwitch = () => setIsOn(!isOn);

  return [isOn, toggleSwitch];
};

const NeonToggleSwitch = ({ isOn, toggleSwitch }) => {
  return (
    <Box position="relative" display="inline-block" width="4em" height="2em" onClick={toggleSwitch}>
      <Box
        position="absolute"
        top="0.5em"
        left="0.5em"
        width={["4em", "5em"]}//"4em"
        height={["2em", "2.2em"]} //"2em"
        overflow="hidden"
        borderRadius="1em"
        bg={isOn ? 'gray.900' : 'gray.900'}
        boxShadow={isOn ? '0 0 10px rgba(0, 255, 0, 0.5)' : '0 0 10px rgba(255, 0, 0, 0.5)'}
        cursor="pointer"
        transition="all 0.3s"
      >
        
        <Box
          position="absolute"
          top="50%"
          left={isOn ? 'calc(100% - 2em)' : '0.5em'}
          transform="translateY(-50%)"
          width={["1.5em", "1.8em"]} //"1.5em"
          height={["1.5em", "1.8em"]}//"1.5em"
          borderRadius="50%"
          bg={isOn ? 'rgba(0, 255, 0, 0.5)': 'rgba(255, 0, 0, 0.7)'}
          boxShadow={isOn ? '0 0 5px rgba(0, 255, 0, 0.7)' : '0 0 5px rgba(255, 0, 0, 0.7)'}
          transition="all 0.3s"
        />
      </Box>
    </Box>
  );
};


const  Home = () =>  {
  const router = useRouter()
  const [session, setSession] = useState({})

  
  
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


  
  //const [isOn, toggleSwitch] = useToggleSwitch();
  

  return (
    <>
    {/* <ChakraModal buttons={buttons}>
        <CustomInput/>
    </ChakraModal> */}
    
      <EventForm/>
      
        {/* <NeonToggleSwitch isOn={isOn} toggleSwitch={toggleSwitch} /> */}
      
    
    </>
  );
}


export default Home;