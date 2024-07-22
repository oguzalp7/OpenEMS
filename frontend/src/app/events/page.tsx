// pages/events.js
"use client";

import { useState, useEffect } from 'react';
import ChakraDropdown from '@/components/dropdown.component';
import { apiClient } from '@/apiClient';
import { getSession } from "@/actions";
import ChakraDataTable from '../../components/data-table.component';
import DatePicker from '@/components/date-picker.component';
import { convertDateToTimestamp, reorderColumns, validateAndCombineContact, renameColumn, formatTime } from '@/utils';
import Loading from '@/components/loading.component';
import { Button, HStack, Stack, VStack } from '@chakra-ui/react';

const Events = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('')

  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [employeeUrl, setEmployeeUrl] = useState('/employees/?skip=0&limit=100&active=true')
  
  const [data, setData] = useState([]);
  const [url, setURL] = useState('/event/');

  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);

  // ------------------------------------------------------------------------------------------------------------------------------------------------------------------
  
  //configure role based view
  useEffect(() => {
    const fetchSessionAndConfigure = async () => {
      const session = await getSession();

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
  // ------------------------------------------------------------------------------------------------------------------------------------------------------------------


  // fetch dropdown data for department
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
      const session = await getSession();
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

    let newUrl = '/event/';
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
      newUrl += `?${params.join('&')}`;
    }

    

    
    setURL(newUrl);

  }, [selectedDepartment, selectedBranch, date, selectedEmployee]);

  const handleSelectDate = (selectedDate) => {
    setDate(selectedDate);
  }
  
  

  // fetch table data
  useEffect(() => {
    const fetchData = async () => {
      const session = await getSession();
      
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

        if(selectedDepartment === "1"){
          // re-format the phone number and country code.
          processedData = validateAndCombineContact(processedData, 'TELEFON', 'ÜLKE KODU');
          
          // re-name necessary columns
          processedData = renameColumn(processedData, 'PERSONEL', 'MAKEUP1');
          
          // define order of the cols
          const order = [
              'id', 'SAAT', 'AD-SOYAD', 'telefon',  'İŞLEM', 'MAKEUP1', 'MAKEUP2', 'SAÇ',
              'ARTI+', 'TST', 'ÜLKE', 'ŞEHİR', 'OTEL', 'KAPORA', 'ÖDEME TİPİ', 'BAKİYE',
                
            ];
          processedData = reorderColumns(processedData, order);
        }else if(selectedDepartment === "2"){
          // re-format the phone number and country code.
          processedData = validateAndCombineContact(processedData, 'TELEFON', 'ÜLKE KODU');

          // define order of the cols
          const order = [
            'id', 'SAAT', 'AD-SOYAD', 'telefon',  'İŞLEM', 'PERSONEL', "IS_TST",
             'BAKİYE'
          ];

          // re-order columns
          processedData = reorderColumns(processedData, order);

        }
        else if(selectedDepartment === "3"){
          // re-format the phone number and country code.
          processedData = validateAndCombineContact(processedData, 'TELEFON', 'ÜLKE KODU');
          
          // re-name necessary columns
          // processedData = renameColumn(processedData, 'PERSONEL', 'NAILART');
          processedData = renameColumn(processedData, 'num_nail_arts', 'NAILART');
          
          // define order of the cols
          const order = [
            'id', 'SAAT', 'AD-SOYAD', 'telefon',  'İŞLEM', 'NAILART', 'PERSONEL',
             'BAKİYE'
          ];

          // re-order columns
          processedData = reorderColumns(processedData, order);
        }
        
        
        setData(processedData);
        
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    }

    fetchData();
  }, [url])

  const resetFilters = () => {
    setSelectedBranch("")
    setSelectedDepartment("")
    setSelectedEmployee("")
    setDate(new Date().toISOString().split('T')[0])
  }



  return (
    <VStack>
      <Stack flexDir={['column', 'column', 'row', 'row']}>

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
      <Button colorScheme='blue' onClick={resetFilters}>RESET</Button>
      </Stack>
      
      {data ? (
        <ChakraDataTable  obj={data} title={'ETKİNLİKLER'} showButtons={false}/>
      ):(
        <Loading/>
      )}
    </VStack>
  );
};

export default Events;
