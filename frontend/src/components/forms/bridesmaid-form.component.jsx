"use client"

import React, {useState, useEffect} from 'react'
import { Box, Text, useToast } from '@chakra-ui/react'
import * as yup from 'yup';
import { apiClient } from '@/apiClient.client';
import { getPlainSession } from '@/actions';
import { generateFormConfig, alterFormConfigType, findFieldIndex, renameFormLabels } from '@/utils';
import AdvancedDynamicForm from '../advanced-dynamic-form.component';

const BridesMaidForm = ({recordId, initialBranch, selectedDate}) => {
    // session state
    const [session, setSession] = useState({});
    const [selectedBranch, setSelectedBranch] = useState(initialBranch);
    // schema state
    const [schema, setSchema] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [validationSchema, setValidationSchema] = useState(yup.object().shape({}));
    const [formConfig, setFormConfig] = useState([]);

    // requestOptions hook for authenticated api calls
    const [requestOptions, setRequestOptions] = useState({});

    const [employees, setEmployees] = useState([]);

    // toast hook
    const toast = useToast();

    // fetch session
    useEffect(() => {
        const fetchSession = async () => {
            const session_ = await getPlainSession();
            setSession(session_);
        }
        fetchSession();
    }, []);

    

    useEffect(() => {
        if(!selectedBranch){
            setSelectedBranch(session.branchId)
        }
    }, [session]);

    
    // authenticate api calls
    useEffect(() => {
        setRequestOptions({
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.token}`,
                },
            }
        )
    }, [session, session.token])

    // fetch schema
    useEffect(() => {   
        const fetchSchema = async () => {
        
            try {
                const response = await apiClient.get('/event/schema/base/', requestOptions);
                setSchema(response.data);
              } catch (error) {
                setError(error);
              } finally {
                setLoading(false);
              }
        }
        fetchSchema();
    }, [session, requestOptions])
    
    // validate schema
    useEffect(() => {
        if (schema) {
            const config = generateFormConfig(schema);
            setFormConfig(config);

            // Convert the schema to Yup schema for validation
            const yupSchema = yup.object().shape(
                Object.keys(schema.properties).reduce((acc, key) => {
                    const field = schema.properties[key];
                    if (field.type === 'string' && field.minLength) {
                    acc[key] = yup.string().min(field.minLength).required();
                    } else if (field.type === 'integer') {
                    acc[key] = yup.number().integer().required();
                    } else if (field.type === 'boolean') {
                    acc[key] = yup.boolean().required();
                    } else if (field.type === 'number') {
                    acc[key] = yup.number().required();
                    } else {
                    acc[key] = yup.string().required();
                    }
                    return acc;
                }, {})
            );

            setValidationSchema(yupSchema);
        }
    }, [schema]);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await apiClient.get(`/employees/?b=${selectedBranch}&dep=1&active=true&skip=0&limit=100`, requestOptions);
                setEmployees(response.data)
            } catch (error) {
                setEmployees([]);
            }
        }
        fetchEmployees();
    }, [session, requestOptions, selectedBranch]);

    console.log(employees)
    // keys which will not rendered on the form
    const keysToHidden = ['process_id', 'branch_id', 'status', 'description', 'details', 'date']
    let updatedFormConfig = alterFormConfigType(formConfig, keysToHidden, 'hidden');

    const DropdownIndex = findFieldIndex(updatedFormConfig, 'select', 'employee_id');
    if(updatedFormConfig && updatedFormConfig[DropdownIndex] && updatedFormConfig[DropdownIndex].options){
        if(typeof(updatedFormConfig[DropdownIndex].options) === typeof(employees)){
            updatedFormConfig[DropdownIndex].options = employees;
        }
    }

    let time = new Date().toISOString().split('T')[1].split('.')[0];
    time = time.substring(0, time.length - 3);

    const defaultValues = {
        process_id: 16,
        branch_id: selectedBranch,
        status: "scheduled",
        description: `Bağlı randevu kodu: ${recordId}`,
        details: {},
        date: selectedDate,
        time: time
    }

    const handleSubmit = async (data) => {
        //console.log(data)
        try {
            const response = await apiClient.post('/event/', data, requestOptions);
            //console.log('Event created:', response.data);
            if(response && (response.status === 200 || response.status === 201)){
                toast({
                    title: 'Nedime Randevusu Başarıyla Oluşturuldu.',
                    description: ``,
                    status: 'success',
                    //duration: 9000,
                    isClosable: true,
                })
            }
            
        } catch (error) {
            console.error('Error creating event:', error);
            console.log(error.response.data.detail);
            toast({
                title: 'Randevu Oluşturulamadı.',
                description: JSON.stringify(error.response.data.detail, null, 2),
                status: 'error',
                //duration: 9000,
                isClosable: true,
            })
        }
    }

    return(
    <Box w={'full'}>
        <AdvancedDynamicForm formConfig={updatedFormConfig} onSubmit={handleSubmit} onFormChange={(data) => {console.log(data)}} defaultValues={defaultValues}/>
    </Box>
    );
}

export default BridesMaidForm;