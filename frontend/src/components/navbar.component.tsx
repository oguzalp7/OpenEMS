"use client"
import Link from "next/link";
import LogoutForm from "./logout-form.component";

import React, { useState } from "react";
import { MoonIcon, SunIcon, HamburgerIcon, CloseIcon, SettingsIcon, CalendarIcon, Icon, AddIcon } from "@chakra-ui/icons";
import { useColorMode, IconButton,  Button, Flex, Image, Text } from "@chakra-ui/react";
import { MdLogout, MdOutlineEditCalendar  } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { FcStatistics, FcDataSheet, FcLock, FcSettings, FcClock  } from "react-icons/fc";
import { logout } from "@/actions";


const Navbar =  () => {

    const { colorMode, toggleColorMode } = useColorMode();
    // const session = await getSession();
    const [display, setDisplay] = useState('none');

    const handleHambugerIcon = () => {
        if(display === 'none'){
            setDisplay('flex');
        }else if(display === 'flex'){
            setDisplay('none');
        }
    }

    return(
        <Flex w={['200px', 'xs', 'lg', 'lg']} ml={[0, 0, 2, 20]}>
            <Flex  align='center'>
                <Flex display={['flex', 'flex', 'flex', 'flex']}>
                    <Link href={'/'}>
                        <Image src="https://muberyasaglam.com.tr/minimages/ekleme.png"/>
                    </Link>

                    <Link href={'/events'}>
                        <Image src="https://muberyasaglam.com.tr/minimages/saat.png"/>
                    </Link>

                    <Link href={'/'}>
                        <Image src="https://muberyasaglam.com.tr/minimages/ms.png"/>
                    </Link>

                    <Link href={'/'}>
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