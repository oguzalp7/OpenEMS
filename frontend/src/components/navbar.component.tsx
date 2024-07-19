"use client"
import Link from "next/link";


import React from "react";
import { Flex, Image } from "@chakra-ui/react";


const Navbar =  () => {

    return(
        <Flex w={['200px', 'xs', 'lg', 'lg']} ml={[0, 0, 10, 20]}>
            <Flex  align='center'>
                <Flex display={['flex', 'flex', 'flex', 'flex']}>
                    <Link href={'/insert-event'}>
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
        </Flex>
    );
}

export default Navbar