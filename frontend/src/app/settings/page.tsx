"use client"
import React, { useEffect, useState } from 'react'

import { Tabs, TabList, TabPanels, Tab, TabPanel, VStack, Box, Heading, Table, Thead, Tr, Th, Tbody, Td, TableContainer } from '@chakra-ui/react'
import { getSession } from '@/actions';
import { apiClient } from '@/apiClient';
import ChakraDataTable from '@/components/data-table.component';
import UserEmployee from '@/components/user-employee.form.component';
import ProcessPrice from '@/components/process-prices-per-employee.component';
import ChangePassword from '@/components/change-password.component';
const Settings = () => {
  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      const session = await getSession();
      const requestOptions = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
      };

      try {
        const response = await apiClient.get('/departments/?skip=0&limit=10', requestOptions);
        setDepartments(response.data);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchBranches = async () => {
      const session = await getSession();
    
      const requestOptions = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
      };

      try {
        const response = await apiClient.get('/branch/?skip=0&limit=20', requestOptions);
        setBranches(response.data);
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };

    fetchBranches();
  }, []);
  
  return (
    <Tabs>
  <TabList>
    <Tab>YÖNETİM</Tab>
    <Tab>FİYATLAR</Tab>
    <Tab>PERSONEL EKLE</Tab>
    <Tab>ŞİFRE DEĞİŞTİR</Tab>
    <Tab>DİĞER</Tab>
  </TabList>

  <TabPanels>
    <TabPanel>
      <p>EMPLOYEES & USERS</p>
    </TabPanel>
    <TabPanel>
      {/* <p>PRICES</p> */ }
      <ProcessPrice/>
    </TabPanel>
    <TabPanel>
      {/* <p>INSERT USER-EMPLOYEE!</p> */}
      <UserEmployee/>
    </TabPanel>
    <TabPanel>
      {/* <p>CHANGE PASSWORD</p> */}
      <ChangePassword/>
    </TabPanel>
    <TabPanel>
      <VStack>
      
      <Box p={1}>
      <Box textAlign="center" mb={4}>ŞUBELER</Box>
      <Table variant="simple"
             borderWidth="1px">
        <Tbody>
          {branches.map((branch) => (
            <Tr key={branch.id}>
              <Td>{branch.name}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      </Box>
     
      <Box p={1}>
      <Box textAlign="center" mb={4}>DEPARTMANLAR</Box>
      <Table variant="simple"
             borderWidth="1px">
        <Tbody>
          {departments.map((department) => (
            <Tr key={department.id}>
              <Td>{department.name}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      </Box>
      
      </VStack>
     
  
    </TabPanel>
  </TabPanels>
</Tabs>
  )
}

export default Settings