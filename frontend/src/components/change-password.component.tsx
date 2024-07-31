"use client";

import { getSession } from "@/actions";
import { apiClient } from "@/apiClient";
import bcrypt from 'bcryptjs';
import { Box, Button, FormControl, FormLabel, Heading, Input, VStack, Text, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";

const ChangePassword = () => {
    // session state
    const [session, setSession] = useState({});
    const [hashedPassword, setHashedPassword] = useState(""); // Current user's hashed password
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    // fetch session and current hashed password
    useEffect(() => {
        const fetchSessionAndPassword = async () => {
            const session_ = await getSession();
            setSession(session_);

            // Fetch the current user's hashed password (assumed to be available securely)
            try {
                const response = await apiClient.get('/user/password/', {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session_.token}`,
                    },
                });
                if (response.status === 200) {
                    setHashedPassword(response.data); 
                } else {
                    setError("Kullanıcı bilgileri getirilemedi.");
                }
            } catch (error) {
                setError("Kullanıcı bilgileri getirilemedi.");
            }
        };
        fetchSessionAndPassword();
    }, []);

    const handleSubmit = async () => {
        // Compare old password with the hashed password
        const isMatch = await bcrypt.compare(oldPassword, hashedPassword); 
        if (!isMatch) {
            setError("Eski şifreniz yanlış.");
            return;
        }

        if (oldPassword === newPassword) {
            setError("Yeni şifreniz ile eski şifreniz aynı olamaz.");
            return;
        }

        setLoading(true);
        setError("");

        const requestOptions = {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.token}`,
            },
        };

        const data = {
            password: oldPassword,
            new_password: newPassword,
        };

        try {
            const response = await apiClient.put('/user/password/', data, requestOptions);
            if (response.status !== 201) {
                setError(response.data.detail || "Şifre değiştirilemedi.");
            } else {
                toast({
                    title: "Şifre başarıyla değiştirildi.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                setOldPassword("");
                setNewPassword("");
            }
        } catch (error) {
            setError("Şifre değiştirilemedi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            w={['full', 'md']}
            p={[8, 10]}
            mt={[20, '10vh']}
            mx='auto'
            border={['none', '1px']}
            borderColor={['', 'gray.300']}
            borderRadius={10}
        >
            <VStack spacing={4} align={'flex-start'} w='full'>
                <VStack spacing={1} align={['flex-start', 'center']} w='full'>
                    <Heading>Şifre Değiştir</Heading>
                    <Text>Eski Şifrenizi Ve Yeni Şifrenizi Giriniz.</Text>
                </VStack>

                <FormControl>
                    <FormLabel>Eski Şifre:</FormLabel>
                    <Input rounded='none' variant='filled' type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                </FormControl>

                <FormControl>
                    <FormLabel>Yeni Şifre:</FormLabel>
                    <Input rounded='none' variant='filled' type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </FormControl>
                <Button onClick={handleSubmit} colorScheme="orange" w='full' isLoading={loading}>Şifre Değiştir</Button>
                {error && (<Text color="red.500">{error}</Text>)}
            </VStack>
        </Box>
    );
}

export default ChangePassword;