import React from 'react'

import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import ChakraDataTable from '@/components/data-table.component'
const Settings = () => {
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
      <p>PRICES</p>
    </TabPanel>
    <TabPanel>
      <p>INSERT USER-EMPLOYEE!</p>
    </TabPanel>
    <TabPanel>
      <p>CHANGE PASSWORD</p>
    </TabPanel>
    <TabPanel>
      <h2>ŞUBE</h2>
      <table>

      </table>
      <p>DEPARTMAN</p>


    </TabPanel>
  </TabPanels>
</Tabs>
  )
}

export default Settings