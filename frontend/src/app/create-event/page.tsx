"use client"

import React from 'react'
import { apiClient } from '@/apiClient';
import { useEffect, useState } from 'react';
import { getSession } from '@/actions';
import { Box, useToast, Text, HStack, VStack } from '@chakra-ui/react';
import * as yup from 'yup';

import { alterFormConfigType, generateFormConfig, renameFormLabels } from '@/utils';
import ChakraDropdown from '@/components/dropdown.component';
import Loading from '@/components/loading.component';
import DynamicForm from '@/components/dynamic-form.component';

const CreateEvent = () => {
  // session state
  const [session, setSession] = useState({});

  // requestOptions hook for authenticated api calls
  const [requestOptions, setRequestOptions] = useState({})

  // fetch departments for dropdown or tab component
  const [showDepartments, setShowDepartments] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(session.departmentId || '1' || '');

  const [processes, setProcesses] = useState([]);
  //const [selectedProcess, setSelectedProcess] = useState('')

  // for higher level auth users
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(session.branchId || '')

  // create base event schema from pydantic schema
  const [baseSchema, setBaseSchema] = useState(null);
  const [baseValidationSchema, setBaseValidationSchema] = useState(yup.object().shape({}));
  const [baseFormConfig, setBaseFormConfig] = useState([]);

  // create evet details schema from pydantic schema
  const [detailsSchema, setDetailsSchema] = useState(null);
  const [detailsValidationSchema, setDetailsValidationSchema] = useState(yup.object().shape({}));
  const [detailsFormConfig, setDetailsFormConfig] = useState([]);

  // load session information
  useEffect(() => {
    const fetchSession = async () => {
      const session_ = await getSession();
      setSession(session_)
    }
    fetchSession();
  }, []);

  // set headers, authenticate requests.
  useEffect(() => {
    if(session && session.token){
      setRequestOptions({
        headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
        },
      })
    }else{
      // do something to re-login maybe.
    }
  }, [session, session.token])

  // configure show dropdowns
  useEffect(() => {
    if(session && session.authLevel && session.authLevel > 3){
      setShowDepartments(true);
    }
    if(session && session.authLevel && session.authLevel === 5){
      setShowBranchDropdown(true);
    }
  }, [session, session.authLevel])


  // fetch department if necessary
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await apiClient.get('/departments/?skip=0&limit=3', requestOptions);
        
        setDepartments(response.data);
      } catch (error) {
        console.error('Error fetching departments:', error);
        setDepartments([])
      }
    }
    if(showDepartments){
      fetchDepartments();
    }

  }, [session, session.token, requestOptions, showDepartments])

  const handleDepartmentSelect = (selectedId) => {
    setSelectedDepartment(selectedId);
  };

  // fetch branches if necessary
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await apiClient.get('/branch/?skip=0&limit=20', requestOptions);
        
        setBranches(response.data);
      } catch (error) {
        console.error('Error fetching branches:', error);
        setBranches([])
      }
    }
    if(showBranchDropdown){
      fetchBranches();
    }
    
  }, [session, session.token, requestOptions, showBranchDropdown]);

  const handleSelectBranch = (selectedId) => {
    setSelectedBranch(selectedId);
  }

  // fetch processes
  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        const response = await apiClient.get(`/processes/?dep=${selectedDepartment}&skip=0&limit=150`, requestOptions);
        
        setProcesses(response.data);
      } catch (error) {
        console.error('Error fetching processes:', error);
        setProcesses([]);
      }
    }
    fetchProcesses();
  }, [session, session.token, requestOptions, selectedDepartment]);

  // fetch base schema
  useEffect(() => {
    const fetchBaseSchema = async () => {
      const requestOptions = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      try{
        const response = await apiClient.get('/event/schema/base', requestOptions);
        setBaseSchema(response.data);
      }catch(err){
        setBaseSchema(null)
      }
    }
    fetchBaseSchema();
  }, []);

  // validate base schema
  useEffect(() => {
    if(baseSchema){
      const config = generateFormConfig(baseSchema);
      setBaseFormConfig(config);

      // Convert the schema to Yup schema for validation
      const yupSchema = yup.object().shape(
        Object.keys(baseSchema.properties).reduce((acc, key) => {
            const field = baseSchema.properties[key];
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

      // set base validation schema
      setBaseValidationSchema(yupSchema);
    }

  }, [baseSchema]);

  //console.log(baseValidationSchema)

  // fetch details schema
  useEffect(() => {
    const fetchDetailsSchema = async () => {
      const requestOptions = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      try{
        const response = await apiClient.get(`/event/schema/details/${selectedDepartment}`, requestOptions);
        setDetailsSchema(response.data);
      }catch(err){
        setDetailsSchema(null)
      }
    }
    fetchDetailsSchema();
  }, [selectedDepartment]);

  // validate details schema
  useEffect(() => {
    if(detailsSchema){
      const config = generateFormConfig(detailsSchema);
      setDetailsFormConfig(config);

      // Convert the schema to Yup schema for validation
      const yupSchema = yup.object().shape(
        Object.keys(detailsSchema.properties).reduce((acc, key) => {
            const field = detailsSchema.properties[key];
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

      // set base validation schema
      setDetailsValidationSchema(yupSchema);
    }

  }, [detailsSchema]);

  //console.log(detailsFormConfig);

  // process time for current time
  let time = new Date().toISOString().split('T')[1].split('.')[0]
  time = time.substring(0, time.length - 3)

  // merge formConfigs & validation schemas
  const combinedFormConfig = [...baseFormConfig, ...detailsFormConfig];
  const combinedSchema = baseValidationSchema.concat(detailsValidationSchema);
  
  // keys which will not rendered on the form
  const keysToHidden = ['status', 'branch_id', 'details', 'customer_id']

  // hide the keys and values from the form
  let updatedFormConfig = alterFormConfigType(combinedFormConfig, keysToHidden, 'hidden');

  // found a bug on the pipeline, num_nail_arts was treated as foreign key.
  const keysToNumber = ['num_nail_arts', 'plus'];
  updatedFormConfig = alterFormConfigType(updatedFormConfig, keysToNumber, 'number')

  // define default values
  const defaultBaseValues = {
    status: 'scheduled',
    description: ' ',
    branch_id: selectedBranch,
    date: new Date().toISOString().split('T')[0],
    time: time,
    country: ' ',
    city: ' ',
    hotel: ' '
  }

  // rename columns
  const labelMapping = {
    "Date": 'TARİH',
    "Time": 'SAAT',
    'Description': 'AÇIKLAMA',
    "Name": 'AD-SOYAD',
    'Is Tst': 'TST',
    'Downpayment': 'KAPORA',
    'Remaining Payment': 'BAKİYE',
    "Employment Start Date": 'İŞ BAŞLANGIÇ TARİHİ',
    "Country": 'ÜLKE',
    'City': 'ŞEHİR',
    'Hotel': 'OTEL',
    'Num Nail Arts': 'NAILART',
    'Plus': 'GELİN+',
  };
  
  updatedFormConfig = renameFormLabels(updatedFormConfig, labelMapping);

  // fetch dropdown data
  const onSubmit = async (data) => {
    console.log(data);
  }

  return (
    <Box>
      <VStack>
        <HStack>
          {session && showDepartments && (
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

          {session && showBranchDropdown && (
            <>
              {branches ? (
                <ChakraDropdown
                options={branches}
                label="ŞUBE"
                initialValue={""}
                value={selectedBranch}
                onSelect={handleSelectBranch}
              />
              ):(
                <Loading/>
              )}
            </>
          )}
        </HStack>
      </VStack>
      
      <br/>
      <Box  w={'md'}>
        <hr/>
        <br/>
        {/* check auth & render dynamic form */}
        {session && session.authLevel >= 3 ? (
            <Box>
               <DynamicForm schema={combinedSchema} formConfig={updatedFormConfig} onSubmit={onSubmit} defaultValues={defaultBaseValues}/>
            </Box>
            
           
        ): (
            <Box>
                <Text>Bu içeriği görüntüleyemezsiniz.</Text>
            </Box>
        )
        }
        <br/>
        <hr/>
        
      </Box>
      
      
    </Box>
  )
}

export default CreateEvent