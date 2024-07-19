"use client"

import { Box, Select } from '@chakra-ui/react'
import React from 'react'

const ChakraDropdown = ({options, label, initialValue, onSelect}) => {

    const handleChange = (e) => {
        const selectedId = e.target.value;
        //console.log(selectedId)
        onSelect(selectedId);
    }

  return (
    <Box>
        <Select onChange={handleChange}>
        <option value={initialValue} label={`${label}`}>{`${label}`}</option>
        {options.map((option: { id: React.Key | null | undefined }) => (
            <option key={option.id} value={option.id} label={option.name} >{option.name}</option>
        ))}
        </Select>
    </Box>
  )
}

export default ChakraDropdown

