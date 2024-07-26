"use client";
import { ArrowLeftIcon } from '@chakra-ui/icons';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  Box,
  Flex,
  Stack,
  IconButton
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';

const ChakraModal = ({ children, isClosed, contentButtons, actionButtons }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalContent, setModalContent] = useState(children);
  const [previousContents, setPreviousContents] = useState([]);
  const [showContentButtons, setShowContentButtons] = useState(true);

  useEffect(()=> {
    if(!isClosed){
      onOpen();
    }
  }, [isClosed])

  useEffect(()=> {
    if(isClosed){
      onClose();
    }
  }, [isClosed])

  const handleChangeContent = (newContent, label) => {
    setPreviousContents([...previousContents, { content: modalContent, buttons: contentButtons }]);
    setModalContent(newContent);
    contentButtons = contentButtons.filter(button => button.label !== label);
  };

  const handleBack = () => {
    if (previousContents.length > 0) {
      const lastContent = previousContents.pop();
      setModalContent(lastContent.content);
      contentButtons = lastContent.buttons;
      setPreviousContents([...previousContents]);
      setShowContentButtons(true)
    }
  };

  const initialContent = () => {
    setModalContent(children);
    setPreviousContents([]);
    setShowContentButtons(true)
  };

  useEffect(() => {
    if(previousContents.length > 0){
        setShowContentButtons(false)
    }
  }, [previousContents]);
  
  console.log(isClosed)
  console.log(isOpen)
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody>
            
            {previousContents.length > 0 && (
                <Box w={'sm'}>
                    <Stack w={'sm'} mb={2}>
                        {/* <Button colorScheme="yellow" onClick={handleBack}>
                            GERİ
                        </Button> */}
                        {/* <Button   onClick={initialContent} w={'sm'}>
                            BAŞA DÖN
                        </Button> */}
                        <IconButton  aria-label='BAŞA DÖN' onClick={handleBack} icon={<ArrowLeftIcon />} />
                    </Stack>
                </Box>
                
            )}

            {/* {previousContents.length > 0 && (
                    <Button colorScheme="blue" onClick={initialContent}>
                      RANDEVU
                    </Button>
                  )} */}
            {modalContent}
          </ModalBody>
          <ModalFooter>
            <Box width="100%">
              <Stack justifyContent="space-between" mb={2}>
                <Stack>
                  
                  
                  {showContentButtons && contentButtons && contentButtons.map((button, index) => (
                    <Button key={index} colorScheme={button.colorScheme} onClick={() => handleChangeContent(button.newContent, button.label)}>
                      {button.label}
                    </Button>
                  ))}
                </Stack>
                <Stack flexDir={'row'}>
                  {actionButtons && actionButtons.map((button, index) => (
                    <Button w={'full'} key={index} colorScheme={button.colorScheme} onClick={button.onClick}>
                      {button.label}
                    </Button>
                  ))}
                  <Button w={'full'} colorScheme="red" onClick={onClose}>
                    VAZGEÇ
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ChakraModal;





