"use client"
import { useState, useEffect } from 'react';
import ChakraDropdown from '@/components/dropdown.component';
import { apiClient } from '@/apiClient.client';
import { getPlainSession } from '@/actions';
import DatePicker from '@/components/date-picker.component';
import { convertDateToTimestamp, reorderColumns, validateAndCombineContact, renameColumn, formatTime, hideKeysInArrayOfObjects, removeKeysFromArrayOfObjects, normalizeData } from '@/utils';
import Loading from '@/components/loading.component';
import { Box, Button, HStack, Stack, VStack, useToast, Icon, IconButton } from '@chakra-ui/react';
import UpdateModal from '@/components/update-modal.component';
import ChakraDataTable from '@/components/data-table.component';
import UpdateEventForm from '@/components/forms/event-update-form.component';
import PaymentForm from '@/components/forms/payment-form.component';
import BridesMaidForm from '@/components/forms/bridesmaid-form.component';
import { GrPowerReset } from "react-icons/gr";

import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react'

const Events = () => {

    const [sess, setSession] = useState({});

    useEffect(() => {
        const fetchSessionInfo = async () => {
            const session = await getPlainSession();
            setSession(session);
        }
        fetchSessionInfo();
    }, [])
    const toast = useToast();

    // dropdown configuration
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState(sess.departmentId || "");
    // dropdown configuration
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(sess.branchId || '')

    // datepicker state management
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])

    // dropdown configuration
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('')
    const [employeeUrl, setEmployeeUrl] = useState('/employees/?skip=0&limit=100&active=true')
    
    // main data hooks
    const [originalData, setOriginalData] = useState([])
    const [data, setData] = useState([]);
    const [url, setURL] = useState('/event/?skip=0&limit=10');

    const [showBranchDropdown, setShowBranchDropdown] = useState(false);
    const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);

    // modal related hooks
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState(null);

    // modal data fetching purposes
    const [recordId, setRecordId] = useState('');
    const [row, setRow] = useState({})

    // ------------------------------------------------------------------------------------------------------------------------------------------------------------------

    //configure role based view
    useEffect(() => {
        const fetchSessionAndConfigure = async () => {
        const session = await getPlainSession();

        if(session && session.authLevel && session.authLevel === 5){
            // show dropdowns dep and branch
            setShowBranchDropdown(true);
            setShowDepartmentDropdown(true);
        }else if(session && session.authLevel && session.authLevel === 4){
            // show dep dropdown only.
            setShowDepartmentDropdown(true);
        }else if(session && session.authLevel && session.authLevel <= 3){
            // do not show dropdowns.
            if(session.branchId && session.branchId > 0){
                let bid = session.branchId;
                setSelectedBranch(bid)
            }
            if(session.departmentId && session.departmentId > 0){
            let depId = session.departmentId;
            setSelectedDepartment(depId)
            }
        }
        }
        fetchSessionAndConfigure()
    }, []);
    console.log(selectedDepartment)
    // ------------------------------------------------------------------------------------------------------------------------------------------------------------------

    // fetch dropdown data for department
  useEffect(() => {
    const fetchDepartments = async () => {
      const session = await getPlainSession();
      const requestOptions = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
      };

      try {
        const response = await apiClient.get('/departments/?skip=0&limit=3', requestOptions);
        
        setDepartments(response.data);
      } catch (error) {
        console.error('Error fetching departments:', error);
        setDepartments([])
      }
    };

    fetchDepartments();
  }, []);

  const handleDepartmentSelect = (selectedId) => {
    setSelectedDepartment(selectedId);
  };

  // fetch dropdown data for branches
  useEffect(() => {
    const fetchBranches = async () => {
      const session = await getPlainSession();
    
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
        setBranches([])
      }
    };

    fetchBranches();
  }, []);

  const handleBranchSelect = (selectedId) => {
    setSelectedBranch(selectedId);
    
  };

  useEffect(() => {
    const configureEmployeeFetchOptions = () => {
      const params = []
      let url = `/employees/?skip=0&limit=100&active=true`
      if (selectedDepartment) {
        //console.log(selectedDepartment)
        params.push(`dep=${selectedDepartment}`);
      }
  
      if (selectedBranch) {
        params.push(`b=${selectedBranch}`);
      }

      if (params.length > 0) {
        url += `&${params.join('&')}`;
      }

      setEmployeeUrl(url);
    }
    configureEmployeeFetchOptions();
  }, [selectedDepartment, selectedBranch]);

  // fetch dropdown data for department
  useEffect(() => {
    const fetchEmployees = async () => {
      const session = await getPlainSession();
      const requestOptions = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
      };
      
      try {
        const response = await apiClient.get(employeeUrl, requestOptions);
        
        setEmployees(response.data);
      } catch (error) {
        console.error('Error fetching employees:', error);
        setEmployees([])
      }
    };

    fetchEmployees();
  }, [employeeUrl]);

  const handleEmployeeSelect = (selectedId) => {
    setSelectedEmployee(selectedId);
  };

  //console.log(employees)
  // configure fetch options
  useEffect(() => {

    let newUrl = '/event/?skip=0&limit=50&';
    const params = [];
    
    if (selectedDepartment) {
      params.push(`dep=${selectedDepartment}`);
    }

    if (selectedBranch) {
      params.push(`b=${selectedBranch}`);
    }

    if (date) {
      const timestamp = convertDateToTimestamp(date);
      params.push(`t=${timestamp}`);
    }

    if(selectedEmployee){
      params.push(`eid=${selectedEmployee}`)
    }

    if (params.length > 0) {
      newUrl += `${params.join('&')}`;
    }
    
    setURL(newUrl);

  }, [selectedDepartment, selectedBranch, date, selectedEmployee]);
  

  const handleSelectDate = (selectedDate) => {
    setDate(selectedDate);
  }
  
  //console.log(selectedDepartment)

  // fetch table data
  useEffect(() => {
    const fetchData = async () => {
      const session = await getPlainSession();
      
      const requestOptions = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
      };
      try {

        const response = await apiClient.get(url, requestOptions);
        // apply data processing
        let processedData = response.data;

        // format the time attribute
        processedData = processedData.map(item => ({
          ...item,
          SAAT: formatTime(item.SAAT)
        }));

        // Add a new index column
        processedData = processedData.map((item, index) => ({ ...item, "SIRA": index + 1 }));

        setOriginalData(processedData);

        
        if(selectedDepartment === "1" || selectedDepartment === 1){
          // re-format the phone number and country code.
          processedData = validateAndCombineContact(processedData, 'TELEFON', 'ÜLKE KODU');
          
          // re-name necessary columns
          processedData = renameColumn(processedData, 'PERSONEL', 'MAKEUP1');
          processedData = renameColumn(processedData, 'ARTI+', 'GELİN+');
          // define order of the cols
          const order = [
              'SIRA', 'SAAT', 'AD-SOYAD', 'telefon',  'İŞLEM', 'MAKEUP1', 'MAKEUP2', 'SAÇ',
              'GELİN+', 'TST', 'ÜLKE', 'ŞEHİR', 'OTEL', 'KAPORA', 'ÖDEME TİPİ', 'BAKİYE',
                
            ];
          processedData = reorderColumns(processedData, order);
          
          const keysToRemove = ['ÜLKE', 'ŞEHİR', 'OTEL', 'KAPORA', 'ÖDEME TİPİ']

          processedData = removeKeysFromArrayOfObjects(processedData, keysToRemove)

        }else if(selectedDepartment === "2" || selectedDepartment === 2){
          // re-format the phone number and country code.
          processedData = validateAndCombineContact(processedData, 'TELEFON', 'ÜLKE KODU');

          // define order of the cols
          const order = [
             'SIRA', 'SAAT', 'AD-SOYAD', 'telefon',  'İŞLEM', 'PERSONEL', "TST",
             'BAKİYE'
          ];

          // re-order columns
          processedData = reorderColumns(processedData, order);

        }
        else if(selectedDepartment === "3" || selectedDepartment === 3){
          // re-format the phone number and country code.
          processedData = validateAndCombineContact(processedData, 'TELEFON', 'ÜLKE KODU');
          
          // re-name necessary columns
          // processedData = renameColumn(processedData, 'PERSONEL', 'NAILART');
          processedData = renameColumn(processedData, 'num_nail_arts', 'NAILART');
          
          // define order of the cols
          const order = [
             'SIRA', 'SAAT', 'AD-SOYAD', 'telefon',  'İŞLEM', 'NAILART', 'PERSONEL',
             'BAKİYE'
          ];

          // re-order columns
          processedData = reorderColumns(processedData, order);
        }else{
          const order = ['SIRA', 'SAAT', 'PERSONEL', 'İŞLEM'];
          processedData = reorderColumns(processedData, order);
        }
        
        processedData = normalizeData(processedData);
        setData(processedData);
        
      } catch (error) {

        console.error('Error fetching departments:', error);
        setData([]);

      }
    }

    fetchData();
  }, [url, isModalOpen, modalContent])
  
  const resetFilters = () => {
    setSelectedBranch("")
    setSelectedDepartment("")
    setSelectedEmployee("")
    setDate(new Date().toISOString().split('T')[0])
  }

  // ------------------------------------------------------------------------------------------------------------------------------------------------------------------

  // define button callbacks
  const handleUpdate = (rowData) => {
    //console.log(rowData);
    const originalRowData = originalData.find((data) => data.SIRA === rowData.SIRA);
    //console.log(originalRowData);
    setRecordId(originalRowData.id)
    setRow(rowData);
    // setModalContent(rowData);
    setIsModalOpen(true);
  };
  
  useEffect(() => {
    const fetchRecordById = async () => {
      const requestOptions = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sess.token}`,
        },
      };
      
      try{
        if(recordId){
          const response = await apiClient.get(`/event/${recordId}`, requestOptions);
          setModalContent(response.data)
          //setRecordId('')
        }
      }catch(error){
        console.error('Error fetching record:', error);
        setModalContent(null)
        
        setRecordId('')
      }
    }
    fetchRecordById();
  }, [recordId]);

  const handleDelete = async (rowData) => {
    console.log('delete will not be implemented.');
    const requestOptions = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sess.token}`,
      },
    };
    const originalRowData = originalData.find((data) => data.SIRA === rowData.SIRA);
    //const response = await apiClient.delete(`/event/${originalRowData.id}`, requestOptions)
  }
  
  // define buttons
  const customButtons = [
    {
        label: 'Güncelle',
        color: 'gray',
        onClick: handleUpdate,
        isDisabled: showDepartmentDropdown === false
    },
    {
        label: 'Sil',
        color: 'red',
        onClick: handleDelete,
        isDisabled: showBranchDropdown === false
    },
        
  ];
  
  //console.log(showBranchDropdown)

  const contentButtons = [
    {
      label: 'ÖDEME',
      colorScheme: 'green',
      newContent: <PaymentForm remainingPayment={row['BAKİYE']} recordId={recordId}/>,
      disabled: (row['BAKİYE'] ? false : true) || row['İŞLEM'] === 'GELİN+'
    },
    {
      label: 'GELİN+',
      colorScheme: 'purple',
      newContent: <BridesMaidForm recordId={recordId} selectedBranch={selectedBranch} selectedDate={date}/>,
      disabled: selectedDepartment === '' || !(selectedDepartment === '1') || row['İŞLEM'] === 'GELİN+' || !(row['GELİN+'] > 0)
    },
  ];
  

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
    setRow({})
    setRecordId('')
  };

  const handleSubmit = async (formData) => {
    console.log('Form submitted hello world', formData);
    const session = await getPlainSession();

    const requestOptions = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
      }
    }
    try {
      const response = await apiClient.put(`/event/${recordId}`, formData, requestOptions);
      if(response && (response.status === 200 || response.status === 201)){
        handleCloseModal();
        toast({
            title: 'Randevu Başarıyla Güncellendi.',
            //description: `Kalan bakiye: ${response.data.details.remaining_payment}`,
            status: 'success',
            //duration: 9000,
            isClosable: true,
        })
    }
    } catch (error) {
      alert('Randevu güncellenemedi.')
    }
  }

  const actionButtons = [
    
    {
      label: "VAZGEÇ",
      colorScheme: "red",
      onClick: handleCloseModal,
  },
  ];

  

  //console.log(isModalOpen)
  return(
    <VStack>

      <Accordion defaultIndex={[0]} allowToggle>
        <AccordionItem>
          <h2>
            <AccordionButton  _expanded={{ bg: 'lightblue', color: 'gray.900' }}>
              <Box as='span' flex='1' textAlign='left'>
                FİLTRELE
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Box w={['sm', 'md', 'lg', '2xl']}>
                <Stack flexDir={['column', 'row', 'row', 'row']}>

                  {date ? (
                    <DatePicker selectedDate={date} onSelect={handleSelectDate}/>
                  ):(
                    <Loading/>
                  )}

                  {showDepartmentDropdown && ( // static decision
                    <>
                      {departments ? ( // dynamic data loading
                        <ChakraDropdown
                          options={departments}
                          label="TÜMÜ"
                          initialValue={""}
                          value={selectedDepartment}
                          onSelect={handleDepartmentSelect}
                        />
                      ):(
                        <Loading/>
                      )}
                    </>
                  )}

                  {showBranchDropdown && (
                    <>
                      {branches ? (
                        <ChakraDropdown
                          options={branches}
                          label="ŞUBE"
                          value={selectedBranch}
                          initialValue={""}
                          onSelect={handleBranchSelect}
                        />
                      ):(
                        <Loading/>
                      )}
                    </>
                  )}

                  {employees ? (
                        <ChakraDropdown
                          options={employees}
                          label="PERSONEL"
                          value={selectedEmployee}
                          initialValue={""}
                          onSelect={handleEmployeeSelect}
                        />
                      ):(
                        <Loading/>
                      )}
                  {/* <Button colorScheme='blue' onClick={resetFilters}>RESET</Button> */}
                  <IconButton colorScheme='blue' onClick={resetFilters} icon={<GrPowerReset />} />
                </Stack>
            </Box>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>


      
     

      {data ? (
        <ChakraDataTable  obj={data} title={'RANDEVU TAKİP'} showButtons={showBranchDropdown || showDepartmentDropdown} customButtons={customButtons}/>
      ):(
        <Loading/>
      )}
      {isModalOpen && modalContent && recordId && (
        <UpdateModal
          isClosed={!isModalOpen}
          contentButtons={contentButtons}
          actionButtons={actionButtons}
          onClose={handleCloseModal}
        >
          <UpdateEventForm onSubmit={handleSubmit} defaultValues={modalContent} eventId={recordId} />
          </UpdateModal>
        )}
    </VStack>
  );

}

export default Events;

