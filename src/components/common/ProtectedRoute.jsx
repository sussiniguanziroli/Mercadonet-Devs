// Example path: src/components/common/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Adjust path to your AuthContext.jsx

const ProtectedRoute = ({ children }) => {
  const { currentUser, loadingAuth } = useAuth();
  const location = useLocation(); // To save the location they were trying to access

  if (loadingAuth) {
    // You can replace this with a more sophisticated loading spinner
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Cargando...</div>;
  }

  if (!currentUser) {
    // User not logged in, redirect to login/register page
    // We pass the current location in `state` so after login,
    // you could redirect them back to the page they originally tried to access.
    return <Navigate to="/registrarme" state={{ from: location }} replace />;
  }

  // User is logged in, render the protected component
  return children;
};

export default ProtectedRoute;