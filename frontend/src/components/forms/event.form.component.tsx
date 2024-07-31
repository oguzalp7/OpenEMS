"use client"

import React, { useEffect, useState } from 'react'
import { getSession } from '@/actions'
import ChakraDropdown from '../dropdown.component'
import { apiClient } from '@/apiClient'
import Loading from '../loading.component'
import { Box, HStack, VStack, Text, InputGroup, Input, InputLeftAddon, FormLabel, Button } from '@chakra-ui/react'
import * as yup from 'yup';
import { generateFormConfig, findFieldIndex, updateFieldOptions, alterFormConfigType } from '@/utils'
import AdvancedDynamicForm from '../advanced-dynamic-form.component'
import useToggleSwitch from '@/hooks/useToggleSwitch'
import NeonToggleSwitch from '../neon-switch.component'

const EventForm = () => {
    // session state
    const [session, setSession] = useState({});

    // requestOptions hook for authenticated api calls
    const [requestOptions, setRequestOptions] = useState({});

    const [isOn, toggleSwitch] = useToggleSwitch();

    // for higher level auth users
    const [showBranchDropdown, setShowBranchDropdown] = useState(false);
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');

    // fetch departments for dropdown or tab component
    const [showDepartments, setShowDepartments] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');

    // create base event schema from pydantic schema
    const [baseSchema, setBaseSchema] = useState(null);
    const [baseValidationSchema, setBaseValidationSchema] = useState(yup.object().shape({}));
    const [baseFormConfig, setBaseFormConfig] = useState([]);    

    // create event details schema from pydantic schema
    const [detailsSchema, setDetailsSchema] = useState(null);
    const [detailsValidationSchema, setDetailsValidationSchema] = useState(yup.object().shape({}));
    const [detailsFormConfig, setDetailsFormConfig] = useState([]);

    // final form config
    const [combinedFormConfig, setCombinedFormConfig] = useState([]);
    const [combinedValidationSchema, setCombinedValidationSchema] = useState(yup.object().shape({}));

    const [paymentTypes, setPaymentTypes] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [employeesHair, setEmployeesHair] = useState([]);

    const [countryCode, setCountryCode] = useState('+90');
    const [customerPhone, setCustomerPhone] = useState('5')
    const [customerName, setCustomerName] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [insertCustomer, setInsertCustomer] = useState(false);
    

    
    // process time for current time
    let time = new Date().toISOString().split('T')[1].split('.')[0];
    time = time.substring(0, time.length - 3);
    const [baseDefaultValues, setBaseDefaultValues] = useState({})

    // load session information
    useEffect(() => {
        const fetchSession = async () => {
            const session_ = await getSession();
            setSession(session_);
        };
        fetchSession();
    }, []);

    // set headers, authenticate requests.
    useEffect(() => {
        if (session && session.token) {
        setRequestOptions({
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.token}`,
            },
        });
    } else {
    // do something to re-login maybe.
    }
    }, [session, session.token]);

    // configure branch dropdown
    useEffect(()=>{
        if(session && session.authLevel && session.authLevel === 5){
            setShowBranchDropdown(true);
        }
    }, [session, session.authLevel]);

    // fetch branches if necessary
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
        if (showBranchDropdown) {
        fetchBranches();
        }
    }, [session, session.token, requestOptions, showBranchDropdown]);

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
        if(selectedBranch){
            setBaseDefaultValues({
                status: 'scheduled',
                description: ' ',
                branch_id: selectedBranch,
                date: new Date().toISOString().split('T')[0],
                time: time,
                details: '{}',
            })
        }
        
    }, [selectedBranch])

   

    

    // configure departments dropdown
    useEffect(()=>{
        if(session && session.authLevel && session.authLevel > 3){
            setShowDepartments(true);
        }
    }, [session, session.authLevel]);

    useEffect(() => {
        const fetchDepartmentsByBranch = async () => {
            try {
                const response = await apiClient.get(`/branch/${selectedBranch}`, requestOptions);
                setDepartments(response.data.departments)
            } catch (error) {
                setDepartments([{id: -1, name: 'fetch error'}])
            }
        }
        if(showDepartments){
            fetchDepartmentsByBranch();
        }
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
        if(selectedDepartment){
            if(selectedDepartment === '1' || selectedDepartment === '3'){
                setBaseDefaultValues({
                    status: 'scheduled',
                    description: ' ',
                    branch_id: selectedBranch,
                    date: new Date().toISOString().split('T')[0],
                    time: time,
                    details: '{}',
                    plus: "0",
                    remaining_payment: "0"
                })
            }
        }
    }, [selectedDepartment])

    useEffect(() => {
        setBaseDefaultValues(
            {
                status: 'scheduled',
                description: ' ',
                branch_id: selectedBranch,
                date: new Date().toISOString().split('T')[0],
                time: time,
                details: '{}',
                plus: "0",
                customer_id: customerId
            }
        )

    }, [selectedBranch, selectedDepartment, customerId]);
    

    // fetch base schema
    useEffect(() => {
        const fetchBaseSchema = async () => {
        const requestOptions = {
            headers: {
            "Content-Type": "application/json",
            },
        };
        try {
            const response = await apiClient.get('/event/schema/base', requestOptions);
            setBaseSchema(response.data);
        } catch (err) {
            setBaseSchema(null);
        }
        };
        fetchBaseSchema();
    }, []);

    // validate base schema
    useEffect(() => {
        if (baseSchema) {
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

    // Fill the options for base schema
    // Fetch and set options for process_id
    useEffect(() => {
        const updateOptions = async () => {
        if (selectedDepartment) {
            const response = await apiClient.get(`/processes/?dep=${selectedDepartment}&skip=0&limit=150`, requestOptions);
            setBaseFormConfig((prevConfig) => {
            const updatedConfig = [...prevConfig];
            const ddIndex = findFieldIndex(updatedConfig, 'select', 'process_id');
            if (ddIndex !== -1) {
                updatedConfig[ddIndex].options = response.data;
            }
            return updatedConfig;
            });
        }
        };
        updateOptions();
    }, [selectedDepartment, requestOptions]);

    // Fetch and set options for employee_id
    useEffect(() => {
        const updateEmployeeOptions = async () => {
        if (selectedBranch && selectedDepartment) {
            const response = await apiClient.get(`/employees/?b=${selectedBranch}&dep=${selectedDepartment}&active=true&skip=0&limit=100`, requestOptions);
            setEmployees(response.data)
            setBaseFormConfig((prevConfig) => {
            const updatedConfig = [...prevConfig];
            const ddIndex = findFieldIndex(updatedConfig, 'select', 'employee_id');
            if (ddIndex !== -1) {
                updatedConfig[ddIndex].options = response.data;
            }
            return updatedConfig;
            });
        }
        };
        updateEmployeeOptions();
    }, [selectedBranch, selectedDepartment, requestOptions]);


    // fetch details schema
    useEffect(() => {
        const fetchDetailsSchema = async () => {
        const requestOptions = {
            headers: {
            "Content-Type": "application/json",
            },
        };
        try {
            const response = await apiClient.get(`/event/schema/details/${selectedDepartment}`, requestOptions);
            setDetailsSchema(response.data);
        } catch (err) {
            setDetailsSchema(null);
        }
        };
        fetchDetailsSchema();
    }, [selectedDepartment]);
    

    // validate details schema
    useEffect(() => {
        if (detailsSchema) {
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

    useEffect(() => {
        const fetchHairStylists = async () => {
          
          try{
            const response = await apiClient.get(`/employees/?b=${selectedBranch}&dep=2&active=true&skip=0&limit=100`, requestOptions);
            setEmployeesHair(response.data)
          }catch(e){  
            setEmployeesHair([])
          }
        }
    
        if(selectedDepartment === '1' || selectedDepartment === 1){
          fetchHairStylists();
        }
        
    }, [selectedDepartment, selectedBranch]);

    // fetch payment types if downpayment required
    useEffect(() => {
        const fetchPaymentTypes = async () => {
        try {
            const response = await apiClient.get('/payment-types/?skip=0&limit=100', requestOptions);
            setPaymentTypes(response.data);
        } catch (error) {
            setPaymentTypes([])
        }
        }
        if(selectedDepartment === '1' && selectedDepartment){
        fetchPaymentTypes();
        }
    
    }, [selectedDepartment])
    
    // combine two forms
    useEffect(()=>{
        const combinedForm = [...baseFormConfig, ...detailsFormConfig]
        setCombinedFormConfig(combinedForm);
        
    }, [baseFormConfig, detailsFormConfig]);

    // combine validation schemas
    useEffect(() => {
        const combinedSchema = baseValidationSchema.concat(detailsValidationSchema);
        setCombinedValidationSchema(combinedSchema);
    }, [baseValidationSchema, detailsValidationSchema]);

    

    let updatedFormConfig = [...combinedFormConfig]

    if(selectedDepartment === '1'){
        const paymentTypeDropdownIndex = findFieldIndex(updatedFormConfig, 'select', "payment_type_id");
        if(updatedFormConfig && updatedFormConfig[paymentTypeDropdownIndex] && updatedFormConfig[paymentTypeDropdownIndex].options){
          if(typeof(updatedFormConfig[paymentTypeDropdownIndex].options) === typeof(paymentTypes)){
              updatedFormConfig[paymentTypeDropdownIndex].options = paymentTypes;
          }
        }

        const hairDropdownIndex = findFieldIndex(updatedFormConfig, 'select', "hair_stylist_id");
        if(updatedFormConfig && updatedFormConfig[hairDropdownIndex] && updatedFormConfig[hairDropdownIndex].options){
            if(typeof(updatedFormConfig[hairDropdownIndex].options) === typeof(employeesHair)){
                updatedFormConfig[hairDropdownIndex].options = employeesHair;
            }
        }

        const optionalEmployeeIndex = findFieldIndex(updatedFormConfig, 'select', 'optional_makeup_id');
        if(updatedFormConfig && updatedFormConfig[optionalEmployeeIndex] && updatedFormConfig[optionalEmployeeIndex].options){
            if(typeof(updatedFormConfig[optionalEmployeeIndex].options) === typeof(employees)){
                updatedFormConfig[optionalEmployeeIndex].options = employees;
            }
        }
    }

   
    // keys which will not rendered on the form
    const keysToHidden = ['status', 'details', 'customer_id', 'branch_id']
    
    // // hide the keys and values from the form
    updatedFormConfig = alterFormConfigType(updatedFormConfig, keysToHidden, 'hidden');

    // // found a bug on the pipeline, num_nail_arts was treated as foreign key.
    const keysToNumber = ['num_nail_arts', 'plus'];
    updatedFormConfig = alterFormConfigType(updatedFormConfig, keysToNumber, 'number');

    
    
    useEffect(() => {
        const queryCustomer = async () => {
            try {
                const encodedCountryCode = encodeURIComponent(countryCode);
                const response = await apiClient.get(`/customer/get/?country_code=${encodedCountryCode}&phone_number=${customerPhone}`, requestOptions);
                setCustomerName(response.data.name);
                setCustomerId(response.data.id);
                setInsertCustomer(false);
                setFetchCustomer(false)
              } catch (error) {
                if (error.response && error.response.status === 404) {
                  console.log('Customer not found, ready to add a new one.');
                  setInsertCustomer(true);
                  setFetchCustomer(false);
                } else {
                  console.error('Error querying customer:', error);
                }
              }
          
        };
        if (countryCode.length >= 2 && customerPhone.length === 10) {
            queryCustomer();
        }
    }, [countryCode, customerPhone, requestOptions]);

    const handleSubmit = async (formData: any) => {
        const insertNewCustomer = async () => {
            const data = {
                name: customerName,
                country_code: countryCode,
                phone_number: customerPhone,
                black_listed: false,
                events: {
                    past_events: []
                }
            }
            try {
                const response = await apiClient.post('/customer/', data, requestOptions);
                if(response.status == 201 || response.status === 200 && !customerId){
                    // const encodedCountryCode = encodeURIComponent(countryCode);
                    // const response = await apiClient.get(`/customer/get/?country_code=${encodedCountryCode}&phone_number=${customerPhone}`, requestOptions);
                    // setCustomerName(response.data.name);
                    // setCustomerId(response.data.id);
                    // setInsertCustomer(false);
                    // setCustomerId(response.data.id);
                    // console.log('insert customer response: ', response.data)
                    // formData['customer_id'] = response.data.id;
                    // console.log('insert custoemr: ', formData)
                    return response.data.id;
                }
            } catch (error) {
                console.error(error)
            }
            
        }
        if(insertCustomer && customerName){
            const custId = await insertNewCustomer();
            formData['customer_id'] = custId;
        }
        // Create an object to hold the details
        const details = {};
        console.log(formData)
        // Iterate through the form data keys
        for (const key in formData) {
            if (detailsValidationSchema._nodes.includes(key)) {
                // If the key is in the details schema, add it to the details object
                details[key] = formData[key];
            }
        }

        // Remove keys that are part of the details schema from the formData
        const filteredFormData = Object.keys(formData)
            .filter(key => !detailsValidationSchema._nodes.includes(key))
            .reduce((obj, key) => {
                obj[key] = formData[key];
                return obj;
            }, {});

        // Set the details object in the filtered form data
        filteredFormData.details = details;

        console.log('Submitted data:', filteredFormData);
        try {
            const response = await apiClient.post('/event', filteredFormData, requestOptions);
            console.log('Event created:', response.data);
            if(!isOn){
                resetForm();
            }
        } catch (error) {
            console.error('Error creating event:', error);
        }
    }

    const handleFormChange = (formData) => {
        console.log('FormData: ', formData)
    }
    
    const resetForm = () => {
        setCountryCode('+90');
        setCustomerPhone('5');
        setCustomerName('');
        setCustomerId('')
        setBaseDefaultValues(
            {
                status: 'scheduled',
                description: ' ',
                branch_id: selectedBranch,
                date: new Date().toISOString().split('T')[0],
                time: time,
                details: '{}',
                plus: "0",
                customer_id: customerId,
                optional_makeup_id: '',
                hair_stylist_id: '',
                process_id: '',
                employee_id: '',
                is_tst: false,
                payment_type_id: '',
                downpayment: 0,
            }
        )
    }

    return (
        <Box>
            <VStack>
                <HStack>
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
                        ) : (
                            <Loading />
                        )}
                    </>
                )}
                {session && selectedBranch && (
                    <>
                        {showDepartments && (
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
                    </>
                )}

                <Button onClick={resetForm}>RESET</Button> 
                <Box>
                    <NeonToggleSwitch isOn={isOn} toggleSwitch={toggleSwitch} />
                </Box>
                
                </HStack>
                
            </VStack>
            
            <br />
            <Box w={['xs', 'sm', 'md', 'md']}>
                <hr />
                <br />
                {/* check auth & render dynamic form */}
                {session && session.authLevel >= 3 && updatedFormConfig && baseDefaultValues && selectedDepartment ? (
                
                <Box>
                    
                    <InputGroup>
                        <InputLeftAddon w={'100px'}  children={<Input type='text' placeholder='CC' w={'xs'} value={countryCode} onChange={(e) => setCountryCode(e.target.value)}/>}  />
                        <Input w={'full'} type='tel' placeholder='5...' value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                    </InputGroup>
                    <br/>
                    <HStack>
                        <FormLabel >
                            <Text noOfLines={1} as="b">{'Müşteri'.toUpperCase()}:</Text>
                        </FormLabel>
                        <Input type='text' placeholder='Ad-Soyad' value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                    </HStack>
                    <br/>
                    <AdvancedDynamicForm formConfig={updatedFormConfig} onSubmit={handleSubmit} onFormChange={handleFormChange} defaultValues={baseDefaultValues}/>
                    
                </Box>
                ) : (
                <Box>
                    <Text>Bu içeriği görüntüleyemezsiniz.</Text>
                </Box>
                )}
                <br />
                <hr />
            </Box>
        </Box>
    )
}

export default EventForm