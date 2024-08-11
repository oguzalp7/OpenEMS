"use client"

import React, {useState, useEffect} from 'react'
import { apiClient } from '@/apiClient.client'
import { getPlainSession } from '@/actions'
import DatePicker from '@/components/date-picker.component'
import ChakraDropdown from '@/components/dropdown.component'
import { Box, VStack, HStack, Stack } from '@chakra-ui/react'
import Loading from '@/components/loading.component'
import { convertDateToTimestamp } from '@/utils'
import BarChart from '@/components/chart-components/bar-chart.component'
import AnalysisTable from '@/components/analysis-table.component'

import {
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
  } from '@chakra-ui/react'

const Analysis = () => {
    // session state
    const [session, setSession] = useState({});

    // requestOptions hook for authenticated api calls
    const [requestOptions, setRequestOptions] = useState({});

    // Calculate the first day of the year
    const currentYear = new Date().toISOString().split('T')[0].split("-")[0]
    const firstDayOfYear = `${currentYear}-01-01`

    const [selectedStartDate, setSelectedStartDate] = useState(firstDayOfYear);
    const [selectedEndDate, setSelectedEndDate] = useState(new Date().toISOString().split('T')[0]);

    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');

    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');

    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');

    const [chartDataFetchURL, setChartDataFetchURL] = useState('');
    const [tableDataFetchURL, setTableDataFetchURL] = useState('');

    const [chartData, setChartData] = useState([])
    const [tableData, setTableData] = useState([])


    useEffect(() => {
        const getSessionInfo = async () => {
          const ses_ = await getPlainSession();
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

    const handleSelectStartDate = (selectedDate) => {
        setSelectedStartDate(selectedDate);
    }

    const handleSelectEndDate = (selectedDate) => {
        setSelectedEndDate(selectedDate);
    }

    useEffect(() => {
        const fetchBranches = async () => {
        try {
            const response = await apiClient.get('/branch/?skip=0&limit=50', requestOptions);
            setBranches(response.data);
        } catch (error) {
            console.error('Error fetching branches:', error);
            setBranches([]);
        }
        };
        
        fetchBranches();
        
    }, [session, session.token, requestOptions]);

    const handleBranchSelect = (selectedId) => {
        setSelectedBranch(selectedId);    
    };

    useEffect(() => {
    const fetchDepartmentsByBranch = async () => {
        try {
            const response = await apiClient.get(`/branch/offline/${selectedBranch}`, requestOptions);
            setDepartments(response.data.departments)
        } catch (error) {
            setDepartments([{id: -1, name: 'fetch error'}])
        }
    }
    
    fetchDepartmentsByBranch();
    
    }, [session, requestOptions, selectedBranch]);

    const handleDepartmentSelect = (selectedId) => {
        setSelectedDepartment(selectedId);
    };

    useEffect(() => {
        const fetchEmployees = async () => {
            let url = `/employees/?active=true&skip=0&limit=100`
            if(selectedBranch){
                url += `&b=${selectedBranch}`
            }
            if(selectedDepartment){
                url += `&dep=${selectedDepartment}`
            }
            try {
                const response = await apiClient.get(url, requestOptions);
                setEmployees(response.data)
            } catch (error) {
                setEmployees([]);
            }
        }
        fetchEmployees();
    }, [session, requestOptions, selectedBranch, selectedDepartment]);

    const handleEmployeeSelect = (selectedId) => {
        setSelectedEmployee(selectedId);
    }

    useEffect(() => {
        if(!selectedBranch){
            setSelectedDepartment('')
            if(!selectedDepartment){
                setSelectedEmployee('')
            }
        }
    });

    useEffect(() => {
        const newQueryParams = new URLSearchParams({
            start: convertDateToTimestamp(selectedStartDate),
            end: convertDateToTimestamp(selectedEndDate),
            ...(selectedBranch && { b: selectedBranch }),
            ...(selectedDepartment && { dep: selectedDepartment }),
            ...(selectedEmployee && {eid: selectedEmployee}),
        });
        setChartDataFetchURL(`/analysis/chart?${newQueryParams.toString()}`);
        setTableDataFetchURL(`/analysis/table?${newQueryParams.toString()}`);
      }, [selectedStartDate, selectedEndDate, selectedBranch, selectedDepartment, selectedEmployee]);

    
    //console.log(tableDataFetchURL);

    useEffect(() => {
        const fetchChartData = async () => {
            try {
                const response = await apiClient.get(chartDataFetchURL, requestOptions);
                setChartData(response.data);
            } catch (error) {
                setChartData([]);
            }
        }
        fetchChartData();
    }, [session, requestOptions, chartDataFetchURL]);

    useEffect(() => {
        const fetchTableData = async () => {
            try {
                const response = await apiClient.get(tableDataFetchURL, requestOptions);
                setTableData(response.data);
            } catch (error) {
                setTableData([]);
            }
        }
        fetchTableData();
    }, [session, requestOptions, tableDataFetchURL]);


    return (
        <Box>
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
                    <Stack flexDir={['column', 'row', 'row', 'row']}>
                        {selectedStartDate ? (
                            <DatePicker selectedDate={selectedStartDate} onSelect={handleSelectStartDate}/>
                        ):(
                            <Loading/>
                        )}
                        {selectedEndDate ? (
                            <DatePicker selectedDate={selectedEndDate} onSelect={handleSelectEndDate}/>
                        ):(
                            <Loading/>
                        )}
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

                        {selectedBranch && (
                            <>
                                {departments ? ( 
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
                        {selectedBranch  && selectedDepartment && (
                            <>
                                {employees  ? (
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
                                </>
                        )}
                        
                    </Stack>
                </AccordionPanel>
                </AccordionItem>
            </Accordion>
                
                {chartData ? (
                    <BarChart chartTitle={''} chartData={chartData}/>
                ): (
                    <Loading/>
                )}

                <HStack spacing={1} overflow={'auto'} w={'lg'} border={'1px'} borderColor={'gray.300'} borderRadius={10}>
                    <AnalysisTable data={chartData} title='TOPLAM'/>
                    <AnalysisTable data={tableData} title='İŞLEMLER'/>
                </HStack>

            </VStack>
        </Box>
    )
}

export default Analysis;