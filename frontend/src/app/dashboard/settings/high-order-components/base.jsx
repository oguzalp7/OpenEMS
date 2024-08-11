"use client"
import React, {useState, useEffect} from 'react'
import InsertModal from '@/components/insert-modal.component'
import ChakraDataTable from '@/components/data-table.component'
import { apiClient } from '@/apiClient.client'
import { getPlainSession } from '@/actions'
import UpdateModal from '@/components/update-modal.component'
import DynamicUpdateForm from '@/components/dynamic-update-form.component'
import { Box, useToast, HStack, VStack } from '@chakra-ui/react'


const BaseHOC = ({form, slug, tableTitle, fetchUrl, updateForm }) => {
    // toast hook
    const toast = useToast();
    // session state
    const [session, setSession] = useState({});

    // requestOptions hook for authenticated api calls
    const [requestOptions, setRequestOptions] = useState({});

    const [data, setData] = useState([]);
    const [recordId, setRecordId] = useState('');

    // modal related hooks
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState(null);

    
    

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
        const fetchData = async () => {
        try {
            
            const response = await apiClient.get( fetchUrl, requestOptions);
            setData(response.data);
        } catch (error) {
            console.error('Error fetching branches:', error);
            setData([]);
        }
        };
        
        fetchData();
        
    }, [session, session.token, requestOptions, isModalOpen, fetchUrl]);

    // define button callbacks
    const handleUpdate = (rowData) => {
        
        setRecordId(rowData.id || rowData.ID)
        console.log(`${slug}/${recordId}`)
        setIsModalOpen(true);
    };
    
    useEffect(() => {
        const fetchRecordById = async () => {
          try{
            if(recordId){
              const response = await apiClient.get(`${slug}/${recordId}`, requestOptions);
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
        alert('Silme işlemi aktif değildir.');
        
    }

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setModalContent(null);
    };


    // define buttons
    const customButtons = [
        {
            label: 'Güncelle',
            color: 'gray',
            onClick: handleUpdate,
            isDisabled: false
        },
        {
            label: 'Sil',
            color: 'red',
            onClick: handleDelete,
            isDisabled: false
        },
    ];

    

    const handleSubmit = async (formData) => {
        //console.log('Submitted data: ', formData)
        
        const response = await apiClient.put(`${slug}/${recordId}`, formData, requestOptions);
        if(response && (response.status === 200 || response.status === 201)){
          handleCloseModal();
          toast({
              title: 'İşlem Başarılı',
              //description: `Kalan bakiye: ${response.data.details.remaining_payment}`,
              status: 'success',
              //duration: 9000,
              isClosable: true,
          })
        }
    }

    

    const actionButtons = [
        {
          label: "VAZGEÇ",
          colorScheme: "red",
          onClick: handleCloseModal,
        },
    ];
    return(
        <Box
        w={['sm', 'md', 'lg', 'full']}
        >
            {form && (
                <VStack>
                    <HStack>
                        <InsertModal buttonTitle={tableTitle}>
                            {form}
                        </InsertModal>
                    </HStack>
                </VStack>
            )}
            
            <br/>
            {data ? (
                <ChakraDataTable  obj={data} title={tableTitle} showButtons={true} customButtons={customButtons}/>
            ):(
                <Loading/>
            )}
            

            {isModalOpen && modalContent && (
                <UpdateModal
                isClosed={!isModalOpen}
                contentButtons={[]}
                actionButtons={actionButtons}
                onClose={handleCloseModal}
                >
                    {updateForm ? (
                        <div>{React.cloneElement(updateForm, {initialValues: modalContent, recordId: recordId, submitHandler: handleSubmit})}</div>
                    ):(
                        <DynamicUpdateForm onSubmit={handleSubmit} defaultValues={modalContent} recordId={recordId} schemaUrl={`${slug}/schema/`}/>
                    )}
                </UpdateModal>
            )}
        </Box>
    );
}

export default BaseHOC;