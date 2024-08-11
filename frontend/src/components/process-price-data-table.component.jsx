"use client"

import React, { useEffect, useState } from 'react'
import { Box, Table, Thead, Tbody, Tr, Th, Td, Spinner, HStack, TableContainer } from '@chakra-ui/react';
import { apiClient } from '@/apiClient.client';
import { getPlainSession } from '@/actions';


const ProcessPriceDataTable = ({data, showButtons, customButtons = []}) => {
    
    

    
    
    
    
    
    
    console.log(data)

    const processNames = [...new Set(data.flatMap(employee => employee.data.map(process => Object.keys(process)).flat()))];
    
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

    return(
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
      <Table variant="striped" colorScheme='blue' size={['md', 'lg']}  w={['full']}  >
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>PERSONEL</Th>
            {processNames.map((processName, index) => (
              <Th key={index}>{processName}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {data.map((employee, index) => (
            <Tr cursor={'pointer'} key={index} onClick={(event) => handleRowClick(employee, event)}>
              <Td>{employee.id}</Td>
              <Td>{employee.name}</Td>
              {processNames.map((processName, index) => {
                const process = employee.data.find(p => Object.keys(p).includes(processName));
                const price = process ? process[processName] : '-';
                return (
                  <Td key={index}>
                    {price}
                  </Td>
                );
              })}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
    
    );
};

export default ProcessPriceDataTable;