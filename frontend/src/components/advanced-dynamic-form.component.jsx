"use client";

import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { VStack, Button } from '@chakra-ui/react';
import LabeledInput from './form-components/labeled-input.component';
import CheckboxInput from './form-components/checkbox-input.component';
import SelectInputV2 from './form-components/select-input-v2.component';

const AdvancedDynamicForm = ({ formConfig, onSubmit, onFormChange, defaultValues }) => {
    const { register, handleSubmit, control, setValue } = useForm({
        defaultValues,
      });
    
      const formValues = useWatch({ control });

      useEffect(() => {
        if (onFormChange) {
          onFormChange(formValues);
        }
      }, [formValues, onFormChange]);
    
      // Update form values when defaultValues change
      useEffect(() => {
        if (defaultValues) {
          Object.keys(defaultValues).forEach((key) => {
            setValue(key, defaultValues[key]);
          });
        }
      }, [defaultValues, setValue]);

      const renderField = (fieldConfig) => {
        const { type, name, label, options } = fieldConfig;
    
        switch (type) {
          case 'hidden':
            return <input key={name} type="hidden" {...register(name)} />;
          case 'checkbox':
            return <CheckboxInput key={name} name={name} label={label} register={register} />;
          case 'select':
            return <SelectInputV2 key={name} name={name} label={label} options={options} control={control} />;
          default:
            return <LabeledInput key={name} type={type} name={name} label={label} register={register} />;
        }
      };
    
      return (
        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack spacing={4}>
            {formConfig.map((fieldConfig) => renderField(fieldConfig))}
            <Button w={'full'} mt={5} type="submit" colorScheme="blue">KAYDET</Button>
          </VStack>
        </form>
      );
};

export default AdvancedDynamicForm;