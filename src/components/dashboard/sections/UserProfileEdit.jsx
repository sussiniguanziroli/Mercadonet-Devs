import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Box, Typography, TextField, Button, Paper, CircularProgress, Alert, Grid } from '@mui/material';
import { useAuth } from '../../../context/AuthContext'; // Adjust path as needed
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/config'; // Adjust path as needed

const UserProfileEdit = () => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [initialData, setInitialData] = useState(null);

    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            displayName: '',
            // Add other fields you want to be editable here, e.g.:
            // bio: '',
            // contactPhone: '',
        }
    });

    useEffect(() => {
        if (currentUser) {
            const fetchUserProfile = async () => {
                setLoading(true);
                setError('');
                try {
                    const userDocRef = doc(db, "users", currentUser.uid);
                    const docSnap = await getDoc(userDocRef);
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        setInitialData(userData);
                        reset({
                            displayName: userData.displayName || '',
                            // Reset other fields
                            // bio: userData.bio || '',
                            // contactPhone: userData.contactPhone || '',
                        });
                    } else {
                        setError("No se encontró el perfil de usuario.");
                    }
                } catch (err) {
                    console.error("Error fetching user profile:", err);
                    setError("Error al cargar el perfil. Intenta de nuevo.");
                } finally {
                    setLoading(false);
                }
            };
            fetchUserProfile();
        } else {
            setLoading(false);
            setError("Usuario no autenticado.");
        }
    }, [currentUser, reset]);

    const onSubmit = async (data) => {
        if (!currentUser) {
            setError("Debes estar autenticado para actualizar tu perfil.");
            return;
        }
        setError('');
        setSuccess('');

        try {
            const userDocRef = doc(db, "users", currentUser.uid);
            const dataToUpdate = {
                ...data,
                updatedAt: serverTimestamp()
            };
            // Filter out any fields that haven't changed to avoid unnecessary writes,
            // or simply update all submitted fields. For simplicity, updating all.
            await updateDoc(userDocRef, dataToUpdate);
            setSuccess("Perfil actualizado con éxito!");
            // Optionally re-fetch or update initialData if needed
            setInitialData(prev => ({...prev, ...data}));

        } catch (err) {
            console.error("Error updating user profile:", err);
            setError("Error al actualizar el perfil. Intenta de nuevo.");
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
                <CircularProgress sx={{ color: '#FFA500' }} />
                <Typography sx={{ ml: 2, color: 'text.secondary' }}>Cargando perfil...</Typography>
            </Box>
        );
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
            <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 3, fontWeight: 'medium' }}>
                Editar Perfil de Usuario
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {!currentUser ? (
                <Typography>Por favor, inicia sesión para editar tu perfil.</Typography>
            ) : !initialData && !loading ? (
                 <Typography>No se pudieron cargar los datos del perfil.</Typography>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="displayName"
                                control={control}
                                rules={{ required: 'El nombre para mostrar es requerido' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Nombre para Mostrar"
                                        variant="outlined"
                                        fullWidth
                                        error={!!errors.displayName}
                                        helperText={errors.displayName?.message}
                                        InputLabelProps={{ sx: { color: 'grey.400' } }}
                                        InputProps={{ sx: { color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' } } }}
                                    />
                                )}
                            />
                        </Grid>
                        
                        {/* Add other fields here, for example:
                        <Grid item xs={12}>
                            <Controller
                                name="bio"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Biografía Corta"
                                        variant="outlined"
                                        fullWidth
                                        multiline
                                        rows={3}
                                        InputLabelProps={{ sx: { color: 'grey.400' } }}
                                        InputProps={{ sx: { color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' } } }}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="contactPhone"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Teléfono de Contacto (Opcional)"
                                        variant="outlined"
                                        fullWidth
                                        InputLabelProps={{ sx: { color: 'grey.400' } }}
                                        InputProps={{ sx: { color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' } } }}
                                    />
                                )}
                            />
                        </Grid>
                        */}

                        <Grid item xs={12} sx={{ mt: 2 }}>
                            <Button 
                                type="submit" 
                                variant="contained" 
                                disabled={isSubmitting}
                                sx={{ 
                                    backgroundColor: '#FFA500', 
                                    color: 'black',
                                    fontWeight: 'bold',
                                    '&:hover': { backgroundColor: '#FF8C00' },
                                    '&.Mui-disabled': { backgroundColor: 'grey.700'}
                                }}
                            >
                                {isSubmitting ? <CircularProgress size={24} sx={{color: 'white'}} /> : 'Guardar Cambios'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            )}
        </Paper>
    );
};

export default UserProfileEdit;
