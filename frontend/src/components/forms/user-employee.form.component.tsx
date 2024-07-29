"use client"

import React from 'react'
import { apiClient } from '@/apiClient';
import { useEffect, useState } from 'react';
import { generateFormConfig, alterFormConfigType, findFieldIndex, renameFormLabels } from '@/utils';

import * as yup from 'yup';
import DynamicForm from '../dynamic-form.component';
import { Box, Text, useToast } from '@chakra-ui/react';
import { createUserEmployee, getSession } from '@/actions';


const UserEmployee = () => {
    // session state
    const [session, setSession] = useState({});

    // schema state
    const [schema, setSchema] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [validationSchema, setValidationSchema] = useState(yup.object().shape({}));
    const [formConfig, setFormConfig] = useState([]);

    // useState hooks for the dropdown selection options
    const [auths, setAuths] = useState([]);
    const [branches, setBranches] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [employmentTypes, setEmploymentTypes] = useState([]);

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

    // fetch dropdown options
    useEffect(()=>{
        
        const fetchBranches = async () =>{
            try {
                const response = await apiClient.get('/branch/?skip=0&limit=50', requestOptions);
                
                setBranches(response.data);
            } catch (error) {
                console.error('Error fetching branches:', error);
                setBranches([])
            }
        }
        fetchBranches(); 
    }, [session, session.token, requestOptions]);


    useEffect(() => {
        const fetchAuths = async () => {
            try {
                const response = await apiClient.get('/auth/?skip=0&limit=10', requestOptions);
                
                setAuths(response.data);
            } catch (error) {
                console.error('Error fetching branches:', error);
                setAuths([])
            }
        }
        fetchAuths();
    }, [session,  session.token, requestOptions]);


    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await apiClient.get('/departments/?skip=0&limit=50', requestOptions);
                setDepartments(response.data);
            } catch (error) {
                console.error('Error fetching branches:', error);
                setDepartments([])
            }
        }
        fetchDepartments();
    }, [session,  session.token, requestOptions]);
    

    useEffect(() => {
        const fetchEmploymentTypes = async () => {
            try {
                const response = await apiClient.get('/employment-types/?skip=0&limit=10', requestOptions);
                
                setEmploymentTypes(response.data);
            } catch (error) {
                console.error('Error fetching branches:', error);
                setEmploymentTypes([])
            }
        }
        fetchEmploymentTypes();
    }, [session,  session.token, requestOptions])

    // ------------------------------------------------------------------------------------------------------------------------------------------------
    

    // fetch schema
    useEffect(() => {   
        const fetchSchema = async () => {
            const requestOptions = {
                headers: {
                  "Content-Type": "application/json",
                },
              };
            try {
                const response = await apiClient.get('/user-employee/schema/', requestOptions);
                setSchema(response.data);
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
        'is_active': true,
        'employment_start_date': new Date().toISOString().split('T')[0],
        'employment_status': true,
        'balance': 0,
        'password': '123456',
        'country_code': "+90"
    }

    // keys which will not rendered on the form
    const keysToHidden = ['is_active', 'employment_status']

    // hide the keys and values from the form
    let updatedFormConfig = alterFormConfigType(formConfig, keysToHidden, 'hidden');
    // ------------------------------------------------------------------------------------------------------------------------------------------------

    // load dropdown options
    useEffect(() => {
        const branchDropdownIndex = findFieldIndex(updatedFormConfig, 'select', 'branch_id');
        if(updatedFormConfig && updatedFormConfig[branchDropdownIndex] && updatedFormConfig[branchDropdownIndex].options){
            if(typeof(updatedFormConfig[branchDropdownIndex].options) === typeof(branches)){
                updatedFormConfig[branchDropdownIndex].options = branches;
            }
        }
    }, [branches]);
    
    useEffect(() => {
        const departmentDropdownIndex = findFieldIndex(updatedFormConfig, 'select', 'department_id');
        //console.log(updatedFormConfig[branchDropdownIndex])
        if(updatedFormConfig && updatedFormConfig[departmentDropdownIndex] && updatedFormConfig[departmentDropdownIndex].options){
            if(typeof(updatedFormConfig[departmentDropdownIndex].options) === typeof(departments)){
                updatedFormConfig[departmentDropdownIndex].options = departments;
            }
        }
    }, [departments]);

    useEffect(() => {
        const authDropdownIndex = findFieldIndex(updatedFormConfig, 'select', 'auth_id');
        //console.log(updatedFormConfig[branchDropdownIndex])
        if(updatedFormConfig && updatedFormConfig[authDropdownIndex] && updatedFormConfig[authDropdownIndex].options){
            if(typeof(updatedFormConfig[authDropdownIndex].options) === typeof(auths)){
                updatedFormConfig[authDropdownIndex].options = auths;
            }
        }
    }, [auths]);

    useEffect(() => {
        const empoymentTypeDropdownIndex = findFieldIndex(updatedFormConfig, 'select', 'employment_type_id');
        //console.log(updatedFormConfig[branchDropdownIndex])
        if(updatedFormConfig && updatedFormConfig[empoymentTypeDropdownIndex] && updatedFormConfig[empoymentTypeDropdownIndex].options){
            if(typeof(updatedFormConfig[empoymentTypeDropdownIndex].options) === typeof(employmentTypes)){
                updatedFormConfig[empoymentTypeDropdownIndex].options = employmentTypes;
            }
        }
    }, [employmentTypes]);

    const labelMapping = {
        "Username": 'KULLANICI ADI',
        "Password": 'ŞİFRE',
        'Is Active': 'AKTİFLİK',
        "Name": 'AD-SOYAD',
        'Country Code': 'ÜLKE KODU',
        'Phone Number': 'TELEFON',
        'Job Title': 'İŞ TANIMI',
        "Employment Start Date": 'İŞ BAŞLANGIÇ TARİHİ',
        "Salary": 'MAAŞ',
        'Balance': 'BAKİYE',
        'Employment Status': 'ÇALIŞMA DURUMU'
      };
    updatedFormConfig = renameFormLabels(updatedFormConfig, labelMapping);
    
    // ------------------------------------------------------------------------------------------------------------------------------------------------
    const onSubmit = async (data) => {
        
        // Handle form submission via server action
        const result = await createUserEmployee(data);
        if(result === 201){
            // show toaster
            //setShowToaster
            toast({
                title: 'Kullanıcı Eklendi',
                description: "We've created your account for you.",
                status: 'success',
                //duration: 9000,
                isClosable: true,
            })
        }
    };
    
    return(
        <Box>
            {/* check auth & render dynamic form */}
            {session && session.authLevel >= 5 ? (
                   
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

export default UserEmployee