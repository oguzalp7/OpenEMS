"use client"
import React, {useState, useEffect} from 'react'
import { apiClient } from '@/apiClient.client'
import { getPlainSession } from '@/actions'
import { HStack, VStack, Box } from '@chakra-ui/react'
import useToggleSwitch from '@/hooks/useToggleSwitch'
import NeonToggleSwitch from '@/components/neon-switch.component'
import ChakraDropdown from '@/components/dropdown.component'
import BaseHOC from './base'
import UserEmployee from '@/components/forms/user-employee-form.component'
import UserEmployeeUpdateForm from '@/components/forms/user-employee-update-form.component'


const Employees = () => {
  
  // session state
  const [session, setSession] = useState({});

  // requestOptions hook for authenticated api calls
  const [requestOptions, setRequestOptions] = useState({});
  const limit = 50;
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');

  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const slug = '/user-employee'
  const [fetchUrl, setFetchURL] = useState(`${slug}?skip=0&limit=${limit}`)


  const [isOn, toggleSwitch] = useToggleSwitch();

  

  

  useEffect(() => {
    const getSessionInfo = async () => {
      const ses_ = await getPlainSession()
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
        const response = await apiClient.get('/branch/?skip=0&limit=50', requestOptions);
        setBranches(response.data);
    } catch (error) {
        console.error('Error fetching branches:', error);
        setBranches([]);
    }
    };
    
    fetchBranches();
    
  }, [session, session.token, requestOptions]);

  const handleSelectBranch = (selectedId) => {
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
    const newQueryParams = new URLSearchParams({
      skip: '0',
      limit: limit.toString(),
      ...(selectedBranch && { b: selectedBranch }),
      ...(selectedDepartment && { dep: selectedDepartment }),
      active: isOn ? 'true' : 'false',
    });
    setFetchURL(`${slug}?${newQueryParams.toString()}`);
  }, [selectedBranch, selectedDepartment, isOn, limit]);

  
  
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
            <Box>
              <NeonToggleSwitch isOn={isOn} toggleSwitch={toggleSwitch} />
            </Box>
        </HStack>
        {fetchUrl &&(
          <BaseHOC slug={slug} tableTitle={'ÇALIŞANLAR'} fetchUrl={fetchUrl} updateForm={<UserEmployeeUpdateForm/>}/>
        )}
      </VStack>
    </Box>
  )
}

export default Employees