"use client"
import React, {useState, useEffect} from 'react'
import ProcessPriceDataTable from '@/components/process-price-data-table.component'
import ChakraDropdown from '@/components/dropdown.component'
import { apiClient } from '@/apiClient.client'
import Loading from '@/components/loading.component'
import { Box, HStack, VStack, useToast } from '@chakra-ui/react'
import { getPlainSession } from '@/actions'

import UpdateModal from '@/components/update-modal.component'
import DynamicPriceForm from '@/components/forms/dynamic-price-form.component'

const ProcessPrice = () => {
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

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // modal related hooks
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const [recordId, setRecordId] = useState('');

    const toast = useToast();

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

    useEffect(() => {
        const fetchData = async () => {
            try {
            const response = await apiClient.get(fetchURL, requestOptions);
            setData(response.data);
            setLoading(false);
            } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
            }
        };

        fetchData();
    }, [session, requestOptions, fetchURL, isModalOpen]);

    // define button callbacks
    const handleUpdate = (rowData) => {
        //console.log(rowData)
        setRecordId(rowData.id || rowData.ID)
        setModalContent(rowData)
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setModalContent(null);
        setRecordId('')
    };

    const handleSubmit = async (formData) => {
        //console.log('Submitted data: ', formData)
        //console.log(`/proces-prices/update-prices/${recordId}`)
        try {
            const response = await apiClient.put(`/proces-prices/update-prices/${recordId}`, formData, requestOptions);
            if(response && (response.status === 200 || response.status === 201)){
            handleCloseModal();
            toast({
                title: 'Fiyatlar başarıyla güncellendi.',
                //description: `Kalan bakiye: ${response.data.details.remaining_payment}`,
                status: 'success',
                duration: 9000,
                isClosable: true,
            })
            }
        } catch (error) {
            toast({
                title: 'Fiyatlar güncellenemedi.',
                //description: `Kalan bakiye: ${response.data.details.remaining_payment}`,
                status: 'error',
                duration: 9000,
                isClosable: true,
            })
        }
        
    }

    // define buttons
    const customButtons = [
        {
            label: 'Güncelle',
            color: 'gray',
            onClick: handleUpdate,
            isDisabled: false
        },
    ];
    const actionButtons = [
        {
          label: "VAZGEÇ",
          colorScheme: "red",
          onClick: handleCloseModal,
        },
    ];
    
  return (
    <Box 
        // w={['full', 'full']} 
        //p={[8, 10]}
        // mx='auto'
        // border={['none', 'none']}
        // borderColor={['', 'gray.300']}
        // borderRadius={10}
        w={['sm', 'md', 'lg', 'full']}
        ml={['-15px', '0px', '0px', '0px']}
    >
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
                {data && !loading ? (
                    <ProcessPriceDataTable data={data} showButtons={true} customButtons={customButtons} />
                ):(
                    <Loading />
                )}

                {isModalOpen && modalContent && recordId && (
                    <UpdateModal
                    isClosed={!isModalOpen}
                    contentButtons={[]}
                    actionButtons={actionButtons}
                    onClose={handleCloseModal}
                    >
                        <DynamicPriceForm data={modalContent} onSubmit={handleSubmit} />
                    </UpdateModal>
                )}
                
            </VStack>
        </Box>
  )
}

export default ProcessPrice