// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
// Import the new function to fetch ALL providers by user ID
import { fetchProvidersByUserId } from '../services/firestoreService';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProviders, setUserProviders] = useState([]); // NEW STATE: Array of provider objects ({id, data: {nombreProveedor, cardType, ...}})
  const [isProveedor, setIsProveedor] = useState(false); // Derived from userProviders.length

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(false);

      if (user) {
        console.log("Auth State Changed: User logged in - ", user.uid, user.email);
        try {
          // Attempt to fetch ALL provider data for the logged-in user
          const providers = await fetchProvidersByUserId(user.uid);
          setUserProviders(providers);
          setIsProveedor(providers.length > 0);
          console.log(`User ${user.uid} has ${providers.length} provider(s).`);
        } catch (error) {
          console.error("Error fetching provider data in AuthContext:", error);
          setUserProviders([]); // Reset if error occurs
          setIsProveedor(false);
        }
      } else {
        console.log("Auth State Changed: User logged out");
        setCurrentUser(null);
        setUserProviders([]); // Reset provider status on logout
        setIsProveedor(false);
      }
    });

    return unsubscribe;
  }, []);

  const logout = () => {
    setLoading(true);
    return signOut(auth).then(() => {
        console.log("User signed out successfully");
    }).catch((error) => {
        console.error("Error signing out: ", error);
    }).finally(() => {
        setLoading(false);
    });
  };

  const value = {
    currentUser,
    loadingAuth: loading,
    logout,
    userProviders, // Expose the array of user's provider profiles
    isProveedor, // Derived: true if userProviders array is not empty
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
