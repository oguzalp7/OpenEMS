"use client"

import React from 'react'

import {
    Table,
    Thead,
    Text,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td,
    TableCaption,
    TableContainer,
    Button,
    Box,
    background,
} from '@chakra-ui/react'

import { Checkbox} from '@chakra-ui/react'
import {EditIcon, DeleteIcon} from '@chakra-ui/icons'

const ChakraDataTable = ({title,  obj, showButtons, customButtons = []}) => {
    /*
    title => string,
    obj => list of hashmaps
    showButtons => boolean,

    */
    const hasCustomButtons = customButtons.length > 0;
    const handleRowClick = (obj_, event) => {
        // Convert className to a string to ensure includes method works
        const className = event.target.className.toString();
        
        if (!className.includes('button') && hasCustomButtons) {
            customButtons.forEach((button) => {
                if (button.label === 'Güncelle' && !button.isDisabled) {
                    button.onClick(obj_);
                }
            });
        }
    };
    

  return (
    <TableContainer 
        w={['sm', 'lg', 'xl', 'full']}
        //w={['sm']} //daraltma
        maxWidth={'100%'}
        h={['sm', 'md',  'auto']}
        p={[0, 8, 0, 0]}
        //marginLeft={[-90, -50, -100]}
        overflowX={'auto'}
        overflowY={'auto'}
        
    >
    <Box textAlign="center" mb={4}>
      {title && (
        <Text as='h3' fontSize="medium">
          {title}
        </Text>
      )}
    </Box>
    <Table 
    variant='striped' 
    colorScheme='blue' 
    size={['sm']}  
    w={['full']}
    //overflowX={'auto'}
    //overflowY={'auto'}
    >
    
    <Thead>
    {obj.length > 0 && (
        <Tr bg={'darkblue'} >
        {obj.length > 0 &&
        Object.keys(obj[0]).map((key) => (
            <Th color={'white'} key={key}>{key}</Th>
        ))}
        {hasCustomButtons && showButtons && <Th></Th>}
        </Tr>
    )}
        
    </Thead>
    <Tbody>
    {obj.map((obj_, index) => (
        <Tr cursor={'pointer'} key={index} onClick={(event) => handleRowClick(obj_, event)}>
            {Object.values(obj_).map((value, index) => (
            <Td key={index}>
                {typeof value === "boolean" ? (value ? <Checkbox isDisabled defaultChecked/> : <Checkbox isDisabled />) : value}
            </Td>
            ))}
        {hasCustomButtons &&  showButtons && (
            <Td className='button-td'>
            {/* {customButtons.map((button, btnIndex) => (
                
                <Button key={btnIndex} colorScheme={button.color} isDisabled={button.isDisabled} onClick={() => button.onClick(obj_)}>
                {button.label}
                </Button>
            ))} */}
            {customButtons.map((button, btnIndex) => {
                if(button.label == 'Güncelle'){
                return (
                        <Button key={btnIndex} colorScheme={button.color} isDisabled={button.isDisabled} onClick={() => button.onClick(obj_)}>
                            <EditIcon/>
                        </Button>
                    )
                }else if(button.label == "Sil"){
                    return (
                        <Button key={btnIndex}  colorScheme={button.color} isDisabled={button.isDisabled} onClick={() => button.onClick(obj_)}>
                            <DeleteIcon/>
                        </Button>
                    )
                }
                else{
                return (<Button key={btnIndex} colorScheme={button.color} isDisabled={button.isDisabled} onClick={() => button.onClick(obj_)}>
                {button.label}
                </Button>)
                }
            })}
            </Td>
            )}
        </Tr>
        ))}
        
    </Tbody>

    <Tfoot>
        {obj.length > 0 && (
        <Tr bgColor={'darkblue'}>
        {obj.length > 0 &&
            Object.keys(obj[0]).map((key) => (
            <Th color={'white'} key={key}>{key}</Th>
            ))}
            {hasCustomButtons && showButtons && <Th></Th>}
        </Tr>
        )}
        
    </Tfoot>

    </Table>
    </TableContainer>
    );

}

export default ChakraDataTable;
