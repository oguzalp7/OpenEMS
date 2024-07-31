"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
    TableContainer, Text, Table, Thead, Tr, Th, Tbody, Td, Box, Checkbox, Button, VStack, Stack, Input 
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import ChakraDataTable from '../data-table.component';
import { getSession } from '@/actions';
import { apiClient } from '@/apiClient';
import ChakraDropdown from '../dropdown.component';
import { removeKeysFromArrayOfObjects } from '@/utils';

const ProcessPrice = () => {
    const [session, setSession] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [processes, setProcesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [prices, setPrices] = useState({});
    const [url, setURL] = useState('/process-prices');

    useEffect(() => {
        const fetchSession = async () => {
            const session_ = await getSession();
            setSession(session_);
        };
        fetchSession();
    }, []);

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
                const response = await apiClient.get('/employees', requestOptions)
                setEmployees(response.data);
            } catch (error) {
                console.error('Error fetching employees:', error);
            }
        };
        fetchEmployees();
    }, []);

    useEffect(() => {
        const fetchProcesses = async () => {
            setLoading(true);
            const session = await getSession();
            const requestOptions = {
                headers: {
                  "Content-Type": "application/json",
                   Authorization: `Bearer ${session.token}`,
                },
            };
            try {
                const response = await apiClient.get(`/processes/?skip=0&limit=20`, requestOptions)
                let processedData = response.data;
                const keysToRemove = ['ÖZELLİKLER', 'SÜRE']
                processedData = removeKeysFromArrayOfObjects(processedData, keysToRemove)
                setProcesses(processedData);
                console.log('Fetched processes:', processedData); 
                /*const processedData = response.data.map(process => ({
                    id: process.id, // Update here
                    name: process.name // If you need the name field as well
                }));
    
                setProcesses(processedData);
                 setPrices(processedData.reduce((acc, process) => {
                    acc[process.id] = 0; // Initialize price to 0 for each process
                    return acc;
                }, {})); */
            } catch (error) {
                console.error('Error fetching processes:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProcesses();
    }, [session]);

    useEffect(() => {
        let newUrl = url;
        const params = [];
        
        params.push(`e=${selectedEmployee}`)
       
    
        if (params.length > 0) {
          newUrl += `${params.join('&')}`;
        }
        
        setURL(newUrl);
    
      }, [selectedEmployee]);

    const handleEmployeeSelect = (event) => {
        setSelectedEmployee(event);
    };

    const handlePriceChange = (processId, event) => {
        setPrices({
            ...prices,
            [processId]: parseFloat(event.target.value)
        });
    };

    const handleSavePrices = async () => {
        setLoading(true);
        const requestOptions = {
            headers: {
              "Content-Type": "application/json",
               Authorization: `Bearer ${session.token}`,
            },
        };
        const processPriceEntries = Object.keys(prices).map(processId => ({
            employee_id: parseInt(selectedEmployee),
            process_id: parseInt(processId),
            price: prices[processId],
        }));

        try {
            await apiClient.post('/process-prices/all-processes/', processPriceEntries, requestOptions);
            console.log('Prices saved successfully');
        } catch (error) {
            console.error('Error saving prices:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Text>Loading...</Text>;
    }
    console.log(selectedEmployee)
    return (
        <VStack spacing={4}>
            <Stack flexDir={['column', 'column', 'row', 'row']}>
            <ChakraDropdown
              options={employees}
              label="PERSONEL"
              value={selectedEmployee}
              initialValue={""}
              onSelect={handleEmployeeSelect}
            />
            </Stack>
            {selectedEmployee ?  (
                <VStack>
                <ChakraDataTable
                title="ÇALIŞAN-İŞLEM ÜCRETİ"
                /*obj={processes.map(process => ({
                    process_id: process.id,
                    process_name: process.name,
                    price: (
                        <Input
                            type="number"
                            value={prices[process.id] || ''}
                            onChange={(event) => handlePriceChange(process.id, event)}
                        />
                    ),
                }))}*/
                    obj={processes}
                    showButtons={false} customButtons={[]} 
            />

            <Button colorScheme="blue" onClick={handleSavePrices} isLoading={loading}>
                KAYDET
            </Button>
            </VStack>
            ):(
                <Text>Lütfen Çalışan Seçiniz. </Text>
              )}
            

            
        </VStack>
    );
};
export default ProcessPrice;