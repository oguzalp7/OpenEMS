"use client"
import Link from "next/link";


import React from "react";
import { Flex, IconButton, Image, useColorMode } from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";


const Navbar =  () => {
    const { colorMode, toggleColorMode } = useColorMode();
    return(
        <Flex w={['200px', 'xs', 'lg', 'lg']} ml={[0, 0, 10, 20]}>
            <Flex  align='center'>
                <Flex display={['flex', 'flex', 'flex', 'flex']}>
                    <Link href={'/create-event'}>
                        <Image src="https://muberyasaglam.com.tr/minimages/ekleme.png"/>
                    </Link>

                    <Link href={'/events'}>
                        <Image src="https://muberyasaglam.com.tr/minimages/saat.png"/>
                    </Link>

                    <Link href={'/settings'}>
                        <Image src="https://muberyasaglam.com.tr/minimages/ms.png"/>
                    </Link>

                    <Link href={'/analysis'}>
                        <Image src="https://muberyasaglam.com.tr/minimages/grafik.png"/>
                    </Link>

                    <Link href={'/customers'}>
                        <Image src="https://muberyasaglam.com.tr/minimages/mercek.png"/>
                    </Link>

                    <Link href={'/settings'}>
                        <Image src="https://muberyasaglam.com.tr/minimages/ayarlar.png"/>
                    </Link>

                    <Link href={'/logout'}>
                        <Image src="https://muberyasaglam.com.tr/minimages/kapat.png"/>
                    </Link>
                </Flex>
            </Flex>
            <IconButton
                        colorScheme='red'
                        size='xl'
                        aria-label="Toggle color mode"
                        w={10}
                        onClick={toggleColorMode}
                        icon={colorMode === "light" ? <MoonIcon/> : <SunIcon/>}
                        border={'1px'}
                    />
        </Flex>
        
    );
}

export default Navbar