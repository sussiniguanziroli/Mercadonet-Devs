import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Tabs, Tab, Button, Grid } from '@mui/material'; // Added Button and Grid for placeholder examples
import { useAuth } from '../../../context/AuthContext'; // Adjust path as needed
import { collection, query, where, getDocs, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'; // Added serverTimestamp
import { db } from '../../../firebase/config'; // Adjust path as needed

// Placeholder for sub-forms or sections within ProviderEdit
// You would create these as separate components later with their own form logic
const EditGeneralInfoForm = ({ providerData, onUpdate, isFormSubmitting }) => (
    <Box sx={{ mt: 2 }}>
        <Typography variant="h6">Información General</Typography>
        <Typography variant="body2" color="text.secondary">
            Aquí podrás editar el nombre de tu empresa, tipo de registro, categorías, ubicación, etc.
            (Formulario para editar datos de 'datosGenerales' del proveedor)
        </Typography>
        {/* Example: <Button onClick={() => onUpdate({ generalDataField: 'newValue' })} disabled={isFormSubmitting}>Guardar Info General</Button> */}
    </Box>
);

const EditPersonalizedInfoForm = ({ providerData, onUpdate, isFormSubmitting }) => (
    <Box sx={{ mt: 2 }}>
        <Typography variant="h6">Información Personalizada de Card ({providerData?.cardType === 'tipoA' ? 'Historia' : 'Productos'})</Typography>
        <Typography variant="body2" color="text.secondary">
            Aquí podrás editar la descripción, logo, carrusel, y otros detalles específicos de tu tipo de card.
            (Formulario para editar datos de 'datosPersonalizados[providerData.cardType]' del proveedor)
        </Typography>
        {/* Example: <Button onClick={() => onUpdate({ personalizedDataField: 'newValue' })} disabled={isFormSubmitting}>Guardar Info Personalizada</Button> */}
    </Box>
);

const EditPlanInfoForm = ({ providerData, onUpdate, isFormSubmitting }) => (
     <Box sx={{ mt: 2 }}>
        <Typography variant="h6">Plan y Suscripción</Typography>
        <Typography variant="body2" color="text.secondary">
            Aquí podrás ver y gestionar tu plan actual.
            (Visualización del 'planSeleccionado' y opciones para cambiarlo si aplica)
        </Typography>
        {/* Example: <Button onClick={() => onUpdate({ planDataField: 'newValue' })} disabled={isFormSubmitting}>Cambiar Plan</Button> */}
    </Box>
);


function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`provider-edit-tabpanel-${index}`}
      aria-labelledby={`provider-edit-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}


const ProviderEdit = () => {
    const { currentUser } = useAuth();
    const [providerDoc, setProviderDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [currentTab, setCurrentTab] = useState(0);
    // This state would ideally be managed by individual forms within each tab
    const [isSubmittingForm, setIsSubmittingForm] = useState(false); 

    useEffect(() => {
        if (currentUser) {
            const fetchProviderData = async () => {
                setLoading(true);
                setError('');
                setSuccess('');
                try {
                    const q = query(collection(db, "proveedores"), where("userId", "==", currentUser.uid));
                    const providerQuerySnapshot = await getDocs(q);
                    if (!providerQuerySnapshot.empty) {
                        const docData = providerQuerySnapshot.docs[0].data();
                        const docId = providerQuerySnapshot.docs[0].id;
                        setProviderDoc({ id: docId, ...docData });
                    } else {
                        setError("No se encontró un perfil de proveedor asociado a este usuario.");
                    }
                } catch (err) {
                    console.error("Error fetching provider data:", err);
                    setError("Error al cargar los datos del proveedor. Intenta de nuevo.");
                } finally {
                    setLoading(false);
                }
            };
            fetchProviderData();
        } else {
            setError("Usuario no autenticado.");
            setLoading(false);
        }
    }, [currentUser]);

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    const handleUpdateProviderData = async (updatedDataPortion) => {
        if (!providerDoc || !providerDoc.id) {
            setError("No hay datos de proveedor para actualizar.");
            return;
        }
        setSuccess('');
        setError('');
        setIsSubmittingForm(true); // Indicate form submission start

        try {
            const providerDocRef = doc(db, "proveedores", providerDoc.id);
            await updateDoc(providerDocRef, {
                ...updatedDataPortion,
                updatedAt: serverTimestamp() // Correctly uses imported serverTimestamp
            });
            setSuccess("Datos del proveedor actualizados con éxito!");
            setProviderDoc(prev => ({ ...prev, ...updatedDataPortion, updatedAt: new Date() })); // Optimistically update local state
        } catch (err) {
            console.error("Error updating provider data:", err);
            setError("Error al actualizar los datos. Intenta de nuevo.");
        } finally {
            setIsSubmittingForm(false); // Indicate form submission end
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
                <CircularProgress sx={{ color: '#FFA500' }} />
                <Typography sx={{ ml: 2, color: 'text.secondary' }}>Cargando datos del proveedor...</Typography>
            </Box>
        );
    }
    
    if (error && !loading) { // Show error only after loading attempt
        return <Alert severity="error" sx={{m:2}}>{error}</Alert>;
    }

    if (!providerDoc && !loading) { // Show message if no doc and not loading
        return <Typography sx={{p:3, color: 'text.secondary'}}>No se encontraron datos del proveedor para editar.</Typography>;
    }
    
    // Ensure providerDoc is available before rendering dependent UI
    if (!providerDoc) {
        return null; // Or a more specific placeholder/message
    }


    return (
        <Paper 
            elevation={3} 
            sx={{ 
                p: { xs: 2, sm: 3, md: 4 }, 
                backgroundColor: 'rgba(40,40,40,0.7)', 
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'text.primary'
            }}
        >
            <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 1, fontWeight: 'medium' }}>
                Editar Mi Empresa: {providerDoc.nombreProveedor || ''}
            </Typography>
            
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>} {/* Show non-critical errors here too */}


            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                    value={currentTab} 
                    onChange={handleTabChange} 
                    aria-label="Secciones de edición del proveedor"
                    textColor="inherit"
                    // indicatorColor="primary" // Using sx for custom indicator color
                     sx={{
                        '& .MuiTab-root': { color: 'grey.400', textTransform: 'none', fontSize: '0.9rem'},
                        '& .Mui-selected': { color: '#FFA500' }, 
                        '& .MuiTabs-indicator': { backgroundColor: '#FFA500' } 
                    }}
                >
                    <Tab label="General" id="provider-edit-tab-0" aria-controls="provider-edit-tabpanel-0" />
                    <Tab label="Personalizada" id="provider-edit-tab-1" aria-controls="provider-edit-tabpanel-1" />
                    <Tab label="Plan" id="provider-edit-tab-2" aria-controls="provider-edit-tabpanel-2" />
                </Tabs>
            </Box>
            <TabPanel value={currentTab} index={0}>
                <EditGeneralInfoForm 
                    providerData={providerDoc} 
                    onUpdate={handleUpdateProviderData} 
                    isFormSubmitting={isSubmittingForm} 
                />
            </TabPanel>
            <TabPanel value={currentTab} index={1}>
                <EditPersonalizedInfoForm 
                    providerData={providerDoc} 
                    onUpdate={handleUpdateProviderData} 
                    isFormSubmitting={isSubmittingForm}
                />
            </TabPanel>
            <TabPanel value={currentTab} index={2}>
                <EditPlanInfoForm 
                    providerData={providerDoc} 
                    onUpdate={handleUpdateProviderData} 
                    isFormSubmitting={isSubmittingForm}
                />
            </TabPanel>

        </Paper>
    );
};

export default ProviderEdit;