"use client"

import { Box, Input } from '@chakra-ui/react'
import React from 'react'


const DatePicker = ({onSelect}) => {
    const [selectedDate, setSelectDate] = React.useState(new Date().toISOString().split('T')[0])
    const handleChange = (e) => {
        //console.log(new Date().toISOString().split('T')[0])
        const selected = e.target.value
        setSelectDate(selected)
        onSelect(selected)
    }
    
  return (
    <Box>
        <Input type='date' id='date' name='date' value={selectedDate} onChange={handleChange} />
    </Box>
    
  )
}

export default DatePicker