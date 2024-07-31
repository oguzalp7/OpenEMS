"use client"

import { Box } from "@chakra-ui/react";


const NeonToggleSwitch = ({ isOn, toggleSwitch }) => {
    return (
      <Box position="relative" display="inline-block" width="4em" height="2em" onClick={toggleSwitch}>
        <Box
          position="absolute"
          top="0.5em"
          left="0.5em"
          width={"4em"}//"4em"
          height={"2em"} //"2em"
          overflow="hidden"
          borderRadius="1em"
          bg={isOn ? 'gray.900' : 'gray.900'}
          boxShadow={isOn ? '0 0 10px rgba(255, 255, 255, 0.5)' : '0 0 10px rgba(127, 127, 127, 0.5)'}
          cursor="pointer"
          transition="all 0.3s"
        >
          
          <Box
            position="absolute"
            top="50%"
            left={isOn ? 'calc(100% - 2em)' : '0.5em'}
            transform="translateY(-50%)"
            width={"1.5em"} //"1.5em"
            height={"1.5em"}//"1.5em"
            borderRadius="50%"
            bg={isOn ? 'rgba(255, 255, 255, 0.5)': 'rgba(127, 127, 127, 0.5)'}
            boxShadow={isOn ? '0 0 5px rgba(0, 255, 0, 0.7)' : '0 0 5px rgba(255, 0, 255, 0.7)'}
            transition="all 0.3s"
          />
        </Box>
      </Box>
    );
  };

export default NeonToggleSwitch;