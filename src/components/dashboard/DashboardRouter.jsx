import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import actual and placeholder section components
import ProviderPanel from './sections/ProviderPanel';
import UserProfileEdit from './sections/UserProfileEdit';
import ProviderEdit from './sections/ProviderEdit'; 
import ProviderProducts from './sections/ProviderProducts';
import ProviderStats from './sections/ProviderStats';
import ProviderMessages from './sections/ProviderMessages';
import UserFavorites from './sections/UserFavorites';
import UserBilling from './sections/UserBilling';


const DashboardRouter = ({ isProvider }) => {
    const defaultElementForPerfil = isProvider ? <ProviderPanel /> : <UserProfileEdit />;

    return (
        <Routes>
            <Route index element={defaultElementForPerfil} />

            {/* Provider Routes */}
            <Route path="provider-panel" element={isProvider ? <ProviderPanel /> : <Navigate to="/perfil/profile" replace />} />
            <Route path="provider/edit" element={isProvider ? <ProviderEdit /> : <Navigate to="/perfil/profile" replace />} />
            <Route path="provider/products" element={isProvider ? <ProviderProducts /> : <Navigate to="/perfil/profile" replace />} />
            <Route path="provider/stats" element={isProvider ? <ProviderStats /> : <Navigate to="/perfil/profile" replace />} />
            <Route path="provider/messages" element={isProvider ? <ProviderMessages /> : <Navigate to="/perfil/profile" replace />} />
            
            {/* User Routes */}
            <Route path="profile" element={<UserProfileEdit />} />
            <Route path="favorites" element={<UserFavorites />} />
            <Route path="billing" element={<UserBilling />} />
            
            {/* Fallback: if no specific route under /perfil matches, redirect to the appropriate default */}
            <Route path="*" element={<Navigate to={isProvider ? "/perfil/provider-panel" : "/perfil/profile"} replace />} />
        </Routes>
    );
};

export default DashboardRouter;
