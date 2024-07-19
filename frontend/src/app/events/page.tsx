'use client';
import React, { useState, useEffect } from 'react';
import axios from "axios";

function getToken() {
  return localStorage.getItem('jwt');
}

axios.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

const Page = () => {
  const [userProfile, setUserProfile] = useState(null);

  const getUserProfile = async () => {
    try {
      const response = await axios.get('/departments/?skip=0&limit=10');
      setUserProfile(response.data[0]);
      // console.log(response); // It always logs undefined
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    if (getToken()) {
      getUserProfile();
    }
  }, []); // Trigger useEffect when count changes (i.e., token retrieval)

  return <div>user dashboard: {userProfile && userProfile.name}</div>;
};

export default Page;