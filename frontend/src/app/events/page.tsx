// pages/events.js
"use client";

import { useState, useEffect } from 'react';
import ChakraDropdown from '@/components/dropdown.component';
import { apiClient } from '@/apiClient';
import { getSession } from "@/actions";
import ChakraDataTable from '../../components/data-table.component';
import DatePicker from '@/components/date-picker.component';
import { convertDateToTimestamp, reorderColumns } from '@/utils';
import Loading from '@/components/loading.component';
import { HStack, VStack } from '@chakra-ui/react';

const Events = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('')

  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  
  const [data, setData] = useState([]);
  const [url, setURL] = useState('/event/');

  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);

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
        const response = await apiClient.get('/departments/?skip=0&limit=10', requestOptions);
        
        setDepartments(response.data);
      } catch (error) {
        console.error('Error fetching departments:', error);
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
      }
    };

    fetchBranches();
  }, []);

  const handleBranchSelect = (selectedId) => {
    setSelectedBranch(selectedId);
    
  };


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

    if (params.length > 0) {
      newUrl += `?${params.join('&')}`;
    }

    

    
    setURL(newUrl);

  }, [selectedDepartment, selectedBranch, date]);

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
        
        // TODO add a mapping for departments.

        const order = [
            'id', 'AD-SOYAD', 'SAAT', 'PERSONEL', 'İŞLEM', 'TST',
            'KAPORA', 'ARTI+', 'BAKİYE', 'ÜLKE', 'ŞEHİR', 'OTEL',
             'MAKEUP2', 'SAÇ', 'ÖDEME TİPİ', 'ÜLKE KODU',
              'TELEFON'
          ];
        const reorderedData = reorderColumns(processedData, order);


        // processedData = process(data)
        /*
        1- Reorder (DONE)
        2- Rename (DONE)
        3- Exclude Columns (DONE)
        */

        setData(reorderedData);
        // console.log(reorderedData)
        // console.log(response.data)
        // setData(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    }

    fetchData();
  }, [url])

  return (
    <VStack>
      <HStack>

      {date ? (
        <DatePicker onSelect={handleSelectDate}/>
      ):(
        <Loading/>
      )}

      {showDepartmentDropdown && ( // static decision
        <>
          {departments ? ( // dynamic data loading
            <ChakraDropdown
              options={departments}
              label="TÜMÜ"
              initialValue=""
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
              initialValue=""
              onSelect={handleBranchSelect}
            />
          ):(
            <Loading/>
          )}
        </>
      )}
      
      
      </HStack>
      
      {data ? (
        <ChakraDataTable  obj={data} title={'ETKİNLİKLER'} showButtons={false}/>
      ):(
        <Loading/>
      )}
    </VStack>
  );
};

export default Events;
