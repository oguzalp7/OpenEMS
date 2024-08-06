"use client"

import React, { useEffect, useState } from 'react'
import { getSession } from '@/actions'
import ChakraDropdown from '@/components/dropdown.component'
import { apiClient } from '@/apiClient'
import Loading from '@/components/loading.component'
import { Box, HStack, VStack } from '@chakra-ui/react'

import ProcessPriceDataTable from '@/components/process-price-data-table.component'


const PricePage = () => {
    // session state
    const [session, setSession] = useState({});

    // requestOptions hook for authenticated api calls
    const [requestOptions, setRequestOptions] = useState({});

    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');

    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    // const url = '/proces-prices/?b=1&dep=1'
    const [fetchURL, setFetchURL] = useState('/proces-prices/?')

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
        const fetchBranches = async () => {
        try {
            const response = await apiClient.get('/branch/?skip=0&limit=20', requestOptions);
            setBranches(response.data);
        } catch (error) {
            console.error('Error fetching branches:', error);
            setBranches([]);
        }
        };
        
        fetchBranches();
        
    }, [session, session.token, requestOptions]);

    // set branch if necessary
    useEffect(() => {
        if(session && session.branchId && session.authLevel <= 4){
            setSelectedBranch(session.branchId);
        }
    }, [session]);

    const handleSelectBranch = (selectedId) => {
        setSelectedBranch(selectedId);
    };

    useEffect(() => {
        const fetchDepartmentsByBranch = async () => {
            try {
                const response = await apiClient.get(`/branch/${selectedBranch}`, requestOptions);
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
    // set department if necessary
    useEffect(() => {
        if(session && session.departmentId && session.authLevel <= 4){
            if(session.departmentId > 3){
                // if(departments && departments[0]){
                //     setSelectedDepartment(departments[0].id);
                // }
            }else{
                setSelectedDepartment(session.departmentId);
            }
        }
    },[session])


    useEffect(() => {
        if(selectedBranch){
            setFetchURL(`/proces-prices/?b=${selectedBranch}`)
            if(selectedDepartment){
                setFetchURL(`/proces-prices/?b=${selectedBranch}&dep=${selectedDepartment}`)
            }
        }else{
            setFetchURL(`/proces-prices`)
        }
    }, [selectedBranch, selectedDepartment]);

    

    return (
        <Box>
            <VStack>
                <HStack>
                        {session && branches ? (
                            <ChakraDropdown
                            options={branches}
                            label="ŞUBE"
                            initialValue={""}
                            value={selectedBranch}
                            onSelect={handleSelectBranch}
                            />
                        ) : (
                            <Loading />
                        )}

                        {session && selectedBranch && (
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
                                    <Loading />
                                )
                            }
                            </>
                        )}
                        
                </HStack>
                {fetchURL ? (
                    <ProcessPriceDataTable url={fetchURL}/>
                ):(
                    <Loading />
                )}
            </VStack>
        </Box>
    )
}

export default PricePage