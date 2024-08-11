"use client";

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/apiClient.client';
import * as yup from 'yup';
import { generateFormConfig} from '@/utils';
import { getPlainSession } from '@/actions';

import AdvancedDynamicForm from './advanced-dynamic-form.component';


const DynamicUpdateForm = ({ schemaUrl, onSubmit, defaultValues, recordId }) => {
    // session state
    const [session, setSession] = useState({});

    // requestOptions hook for authenticated api calls
    const [requestOptions, setRequestOptions] = useState({});

    const [schema, setSchema] = useState(null);
    const [formConfig, setFormConfig] = useState([]);
    const [validationSchema, setValidationSchema] = useState(yup.object().shape({}));
    const [loading, setLoading] = useState(true);

    // load session information
    useEffect(() => {
        const fetchSession = async () => {
            const session_ = await getPlainSession();
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

    useEffect(() => {
        const fetchFormSchema = async () => {
            try {
              const response = await apiClient.get(schemaUrl, requestOptions);
              setSchema(response.data);
              setLoading(false);
            } catch (error) {
              console.error('Error fetching schema:', error);
              setLoading(false);
            }
        };
        fetchFormSchema();  
    }, [session, requestOptions]);

    useEffect(() => {
        if(schema){
            const config = generateFormConfig(schema);
            setFormConfig(config);

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

    return(
        // <pre>{JSON.stringify(defaultValues, null, 2)}</pre>
        // <DynamicForm schema={validationSchema} formConfig={formConfig} onSubmit={onSubmit} defaultValues={defaultValues} />
        <AdvancedDynamicForm formConfig={formConfig} onSubmit={onSubmit} defaultValues={defaultValues} onFormChange={(data) => {console.log(data)}}/>
        // <UserEmployee initialValues={defaultValues}/>
    );
}   

export default DynamicUpdateForm;