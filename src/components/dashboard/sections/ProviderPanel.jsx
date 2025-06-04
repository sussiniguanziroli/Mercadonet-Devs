import React from 'react';
import { Typography, Box, Grid, Card, CardContent, ListItemIcon, Button as MuiButton, Paper } from '@mui/material';
import { Business, Assessment, Storefront, Forum } from '@mui/icons-material';
import { NavLink } from 'react-router-dom';

const ProviderPanel = () => {
    const panelItems = [
        { 
            title: "Editar Empresa", 
            description: "Gestiona la información de tu empresa", 
            icon: <Business sx={{ fontSize: 36, color:'primary.main' }} />, 
            path: "/perfil/provider/edit" 
        },
        { 
            title: "Ver estadísticas", 
            description: "Consulta los clics en tus anuncios", 
            icon: <Assessment sx={{ fontSize: 36, color:'primary.main' }} />, 
            path: "/perfil/provider/stats" 
        },
        { 
            title: "Mis productos", 
            description: "Administra los productos que ofreces", 
            icon: <Storefront sx={{ fontSize: 36, color:'primary.main' }} />, 
            path: "/perfil/provider/products" 
        },
        { 
            title: "Mensajes recibidos", 
            description: "Revisa las consultas de los compradores", 
            icon: <Forum sx={{ fontSize: 36, color:'primary.main' }} />, 
            path: "/perfil/provider/messages" 
        },
    ];

    return (
        <Box>
            <Typography 
                variant="h4" 
                gutterBottom 
                sx={{ 
                    color: 'text.primary', 
                    mb: 3, 
                    fontWeight: 'medium' 
                }}
            >
                Panel de Proveedor
            </Typography>
            <Grid container spacing={3}>
                {panelItems.map(item => (
                    <Grid item xs={12} sm={6} key={item.title}>
                        <Card sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: 'rgba(40,40,40,0.7)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                            }
                        }}>
                            <CardContent sx={{ flexGrow: 1, color: 'text.primary', p: 3 }}>
                                <ListItemIcon sx={{ display: 'block', textAlign: 'left', fontSize: 36, color: '#FFA500', mb: 1.5 }}>
                                    {item.icon}
                                </ListItemIcon>
                                <Typography variant="h6" component="div" sx={{ fontWeight: '500', mb: 0.5 }}>
                                    {item.title}
                                </Typography>
                                <Typography variant="body2" color="grey.400" sx={{ minHeight: '40px' }}>
                                    {item.description}
                                </Typography>
                            </CardContent>
                            <Box sx={{ p: 2, pt: 1, display: 'flex', justifyContent: 'flex-start' }}>
                                <MuiButton
                                    component={NavLink}
                                    to={item.path}
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                        color: '#FFA500',
                                        borderColor: 'rgba(255,165,0,0.5)',
                                        '&:hover': {
                                            borderColor: '#FFA500',
                                            backgroundColor: 'rgba(255,165,0,0.1)'
                                        }
                                    }}
                                >
                                    Acceder
                                </MuiButton>
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            <Paper sx={{
                p: { xs: 2, sm: 3 },
                mt: 4,
                backgroundColor: 'rgba(40,40,40,0.7)',
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: '500' }}>
                    Promociona tus productos
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, color: 'grey.400' }}>
                    Crea promociones para impulsar las ventas de tus productos y destacarlos en tu perfil.
                </Typography>
                <MuiButton variant="contained" sx={{
                    backgroundColor: '#FFA500',
                    color: 'black',
                    fontWeight: 'bold',
                    '&:hover': { backgroundColor: '#FF8C00' }
                }}>
                    Crear promoción
                </MuiButton>
            </Paper>
        </Box>
    );
};

export default ProviderPanel;