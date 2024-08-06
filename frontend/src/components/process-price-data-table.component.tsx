"use client"

import React, { useEffect, useState } from 'react'
import { Box, Table, Thead, Tbody, Tr, Th, Td, Spinner, HStack, TableContainer } from '@chakra-ui/react';
import { apiClient } from '@/apiClient';
import { getSession } from '@/actions';

const ProcessPriceDataTable = ({url}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [session, setSession] = useState({})
  const [requestOptions, setRequestOptions] = useState({})
  
  useEffect(() => {
    const getSessionInfo = async () => {
      const ses_ = await getSession()
      //console.log(ses_)
      setSession(ses_)
    }
    getSessionInfo();
  }, []);

  useEffect(()=>{
    setRequestOptions(
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
      }
    ) 
  }, [session, session.token]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get(url, requestOptions);
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [session, requestOptions, url]);

  if (loading) {
    return <Spinner size="xl" />;
  }
  console.log(data)
  const processNames = [...new Set(data.flatMap(employee => employee.data.map(process => Object.keys(process)).flat()))];
  
  return (
    <TableContainer 
        w={['md', 'lg', 'xl', 'full']}
        //w={['sm']} //daraltma
        maxWidth={'100%'}
        h={['sm', 'md',  'auto']}
        p={[0, 8, 0, 0]}
        //marginLeft={[-90, -50, -100]}
        overflowX={'auto'}
        overflowY={'auto'}
    >
      <Table variant="striped"  >
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
          {data.map((employee) => (
            <Tr key={employee.id}>
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