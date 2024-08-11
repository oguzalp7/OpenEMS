"use client"

import { Box, Input } from '@chakra-ui/react'
import React, { useEffect } from 'react'

const DatePicker = ({selectedDate, onSelect}) => {
    const [currentDate, setCurrentDate] = React.useState(selectedDate || new Date().toISOString().split('T')[0]);
  
      useEffect(() => {
          setCurrentDate(selectedDate);
      }, [selectedDate]);
      
      const handleChange = (e) => {
          //console.log(new Date().toISOString().split('T')[0])
          const selected = e.target.value
          setCurrentDate(selected)
          onSelect(selected)
      }
      
    return (
      <Box>
          <Input type='date' id='date' name='date' value={selectedDate} onChange={handleChange} />
      </Box>
      
    )
  }
  
  export default DatePicker