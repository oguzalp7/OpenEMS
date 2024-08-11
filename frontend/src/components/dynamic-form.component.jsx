"use client";

import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { VStack, Button, Box, Stack } from '@chakra-ui/react';
import LabeledInput from './form-components/labeled-input.component';
import CheckboxInput from './form-components/checkbox-input.component';
import SelectInput from './form-components/select-input.component';

const DynamicForm = ({ schema, formConfig, onSubmit, defaultValues }) => {
    const { register, handleSubmit, setValue, formState: { errors } } = useForm({
      resolver: yupResolver(schema),
      defaultValues: defaultValues,
    });
  
    const renderField = (fieldConfig) => {
      const { type, name, label, options } = fieldConfig;
  
      switch (type) {
      //   case 'text':
      //   case 'email':
      //   case 'password':
      //   case 'time':
        case 'hidden':
          return <></>
        case 'checkbox':
          return <CheckboxInput key={name} name={name} label={label} register={register} error={errors[name]} />;
        
        case 'select':
          return <SelectInput key={name} name={name} label={label} options={options} register={register} error={errors[name]} />;
        default:
          return <LabeledInput key={name} type={type} name={name} label={label} register={register} error={errors[name]} />;
      }
    };
    const handleFormSubmit = (data) => {
      console.log(data);
      onSubmit(data);
    };
  
    return (
      <form onSubmit={handleSubmit((e) => {
          //e.preventDefault();
          handleSubmit(handleFormSubmit)(e);
      })}>
        <VStack spacing={4}>
          <Stack spacing={2} w={['xs', 'full']}>
              {formConfig.map((fieldConfig) => renderField(fieldConfig))}
              <Button type="submit" colorScheme="blue">KAYDET</Button>
          </Stack>
        </VStack>
      </form>
    );
  };
  
  export default DynamicForm;
  