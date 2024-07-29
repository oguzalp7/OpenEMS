"use client"

import React from 'react'
import { apiClient } from '@/apiClient';
import { useEffect, useState } from 'react';
import { generateFormConfig, alterFormConfigType, findFieldIndex, renameFormLabels } from '@/utils';

import * as yup from 'yup';
import DynamicForm from '../dynamic-form.component';
import { Box, Text, useToast } from '@chakra-ui/react';
import { createBranch, getSession } from '@/actions';


const Branch = () => {
    // session state
    const [session, setSession] = useState({});

    // schema state
    const [schema, setSchema] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [validationSchema, setValidationSchema] = useState(yup.object().shape({}));
    const [formConfig, setFormConfig] = useState([]);

    // requestOptions hook for authenticated api calls
    const [requestOptions, setRequestOptions] = useState({})

    // toast hook
    const toast = useToast();
    // ------------------------------------------------------------------------------------------------------------------------------------------------

    // fetch session
    useEffect(() => {
        const fetchSession = async () => {
            const session_ = await getSession();
            setSession(session_);
        }
        fetchSession();
    }, []);

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
    // ------------------------------------------------------------------------------------------------------------------------------------------------

    // fetch schema
    useEffect(() => {   
        const fetchSchema = async () => {
            const session = await getSession();
            const requestOptions = {
                headers: {
                  "Content-Type": "application/json",
                   Authorization: `Bearer ${session.token}`,
                },
              };
            try {
                const response = await apiClient.get('/branch/schema/', requestOptions);
                setSchema(response.data);
                console.log(response.data)
              } catch (error) {
                setError(error);
              } finally {
                setLoading(false);
              }
        }
        fetchSchema();
    }, [])

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

    // define default values
    const defaultValues = {
        'name': "",
        'is_franchise': true,
        'studio_extra_guest_price': 0,
        'hotel_extra_guest_price': 0,
        'outside_extra_guest_price': 0
    }

    const labelMapping = {
        'Name': 'ADI',
        'Is Franchise': 'FRANCHISE',
        'Studio Extra Guest Price': 'STÜDYO GELİN+',
        'Hotel Extra Guest Price': 'OTEL GELİN+',
        'Outside Extra Guest Price': 'ŞEHİRDIŞI GELİN+'
      };
     let updatedFormConfig = renameFormLabels(formConfig, labelMapping);
    
    // ------------------------------------------------------------------------------------------------------------------------------------------------
    const onSubmit = async (data) => {
        
        // Handle form submission via server action
        const result = await createBranch(data);
        if(result === 201){
            // show toaster
            //setShowToaster
            toast({
                title: 'Şube Eklendi',
                description: "Şubeniz Eklendi.",
                status: 'success',
                //duration: 9000,
                isClosable: true,
            })
        }
    };

    return(
        <Box>
             <Text>ŞUBE EKLE</Text>
            {/* check auth & render dynamic form */}
            {session  && session.authLevel >= 5 ? (
                   
                    <DynamicForm schema={validationSchema} formConfig={updatedFormConfig} onSubmit={onSubmit} defaultValues={defaultValues}/>
                ): (
                    <Box>
                        <Text>Bu içeriği görüntüleyemezsiniz.</Text>
                    </Box>
                )
            }
        </Box>
       
    );
}

export default Branch