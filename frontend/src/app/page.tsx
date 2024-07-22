"use client"
import { getSession } from "@/actions";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  VStack,
  HStack,
  InputGroup,
  Stack,
  InputLeftAddon,
  Input,
  InputRightAddon
} from '@chakra-ui/react'

import ChakraDropdown from "@/components/dropdown.component";

const ChakraModal = (
  {
  children,
  }: {
  children: React.ReactNode;
  }
  ) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    onOpen();
  }, []);

  return (
    <>
      {/* <Button onClick={onOpen}>Open Modal</Button> */}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          {/* <ModalHeader>Modal Title</ModalHeader> */}
          <ModalCloseButton />
          <ModalBody>
            {children}
          </ModalBody>

          <ModalFooter>
 
              <Button colorScheme='blue' onClick={onClose}>
                KAYDET
              </Button>
                
              <Button colorScheme='red' onClick={onClose}>
                VAZGEÇ
              </Button>
     
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )

}

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


const  Home = ({
    children,
  }: {
    children: React.ReactNode;
  }) =>  {
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

  return (
    <>
    <ChakraModal>
        <CustomInput/>
    </ChakraModal>
    </>
  );
}


export default Home;