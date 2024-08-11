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
  Stack,
  IconButton
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';

const UpdateModal = ({ children, isClosed, contentButtons, actionButtons, onClose }) => {
    const { isOpen, onOpen, onClose: closeModal } = useDisclosure();
    const [modalContent, setModalContent] = useState(children);
    const [previousContents, setPreviousContents] = useState([]);
    const [showContentButtons, setShowContentButtons] = useState(true);

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
        setShowContentButtons(true);
    }
    };

    useEffect(() => {
        if (isClosed) {
            closeModal();
        } else {
            onOpen();
        }
    }, [isClosed, closeModal, onOpen]);

    useEffect(() => {
        if (previousContents.length > 0) {
            setShowContentButtons(false);
        }
    }, [previousContents]);

    return (
    
        <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
            <ModalCloseButton />
            <br/>
            <br/>
            <ModalBody>
            {previousContents.length > 0 && (
                <Box w={'sm'}>
                <Stack w={'sm'} mb={2}>
                    <IconButton aria-label="BAŞA DÖN" onClick={handleBack} icon={<ArrowLeftIcon />} />
                </Stack>
                </Box>
            )}
            {modalContent}
            </ModalBody>
            <ModalFooter>
            <Box width="100%">
                <Stack justifyContent="space-between">
                
                <Stack flexDir={'row'}  mt={-5}>
                    {actionButtons && actionButtons.map((button, index) => (
                    <Button w={'full'} key={index} colorScheme={button.colorScheme} onClick={button.onClick}>
                        {button.label}
                    </Button>
                    ))}
                </Stack>
                <Stack flexDir={'row'}>
                    {showContentButtons && contentButtons && contentButtons.map((button, index) => (
                    <Button w={'full'} key={index} colorScheme={button.colorScheme} isDisabled={button.disabled} onClick={() => handleChangeContent(button.newContent, button.label)}>
                        {button.label}
                    </Button>
                    ))}
                </Stack>
                </Stack>
            </Box>
            </ModalFooter>
        </ModalContent>
        </Modal>
    
    );
}

export default UpdateModal;