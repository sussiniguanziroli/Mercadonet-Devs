// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase/config'; // Adjust path if needed
import { onAuthStateChanged, signOut } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // To handle initial auth state check

  useEffect(() => {
    // onAuthStateChanged returns an unsubscribe function
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      if (user) {
        console.log("Auth State Changed: User logged in - ", user.uid, user.email);
      } else {
        console.log("Auth State Changed: User logged out");
      }
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const logout = () => {
    setLoading(true); // Optional: show loading during logout
    return signOut(auth).then(() => {
        console.log("User signed out successfully");
        // currentUser will be set to null by onAuthStateChanged
    }).catch((error) => {
        console.error("Error signing out: ", error);
    }).finally(() => {
        setLoading(false); // Optional
    });
  };

  const value = {
    currentUser,
    loadingAuth: loading, // Renamed to avoid conflict if components have their own 'loading'
    logout,
    // You can add login and signup functions here if you want them in the context,
    // but often they are kept in their respective components (Login.jsx, Register.jsx)
    // and this context primarily focuses on providing the current user state.
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children} 
      {/* Or show a global loader: loading ? <GlobalSpinner /> : children */}
    </AuthContext.Provider>
  );
};
