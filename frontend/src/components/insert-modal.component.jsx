import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    useDisclosure
} from '@chakra-ui/react'

const InsertModal = ({children, buttonTitle=''}) => {
    const { isOpen, onOpen, onClose } = useDisclosure()

    return (
        <>
          <Button colorScheme={'green'} onClick={onOpen}>{`${buttonTitle}+` || 'YENİ+'}</Button>
    
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              
              <ModalCloseButton />
              <ModalBody>
                {children}
              </ModalBody>
    
              <ModalFooter>
                <Button colorScheme='red' w={'full'} onClick={onClose}>
                  VAZGEÇ
                </Button>
               
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      )
}

export default InsertModal;