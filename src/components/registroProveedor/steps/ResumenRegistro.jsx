// src/components/registroProveedor/steps/ResumenRegistro.jsx
import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Tabs,
    Tab,
    Paper,
    Grid,
    Button,
    TextField,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    CircularProgress
} from '@mui/material';

import {
    FaShoppingCart,
    FaUserCircle,
    FaCreditCard,
    FaFileAlt,
    FaBuilding,
    FaWhatsapp,
    FaCheckCircle
} from 'react-icons/fa';

import CardHistoriaPreview from '../card_simulators/CardHistoriaPreview';
import CardProductosPreview from '../card_simulators/CardProductosPreview';

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`checkout-tabpanel-${index}`}
            aria-labelledby={`checkout-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: { xs: 2, md: 3 } }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

function allyProps(index) {
    return {
        id: `checkout-tab-${index}`,
        'aria-controls': `checkout-tabpanel-${index}`,
    };
}

const ResumenRegistro = ({ formData, onConfirm, onBack, onCancel }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleFinalConfirm = async () => {
        setIsProcessing(true);
        await onConfirm();
        setIsProcessing(false);
    };

    const {
        tipoCard,
        datosGenerales = {},
        datosPersonalizados = {}, // This comes from RegistrosProveedorNavigator's state
        planSeleccionado = {}
    } = formData || {};

    const personalDataForSelectedType = datosPersonalizados?.[tipoCard] || {};

    const proveedorPreviewProps = {
        nombre: datosGenerales.nombreProveedor || 'Nombre de Empresa Ejemplo',
        tipoRegistro: datosGenerales.tipoRegistro || '',
        tipoProveedor: datosGenerales.tipoProveedor || [],
        ubicacionDetalle: `${datosGenerales.ciudad || ''}${datosGenerales.ciudad && datosGenerales.provincia ? ', ' : ''}${datosGenerales.provincia || ''}` || 'Ubicación Ejemplo',
        selectedServices: [datosGenerales.categoriaPrincipal, ...(datosGenerales.categoriasAdicionales || [])].filter(Boolean),
        
        descripcion: personalDataForSelectedType.descripcion || '',
        
        logoPreview: personalDataForSelectedType.logo?.url || null, 

        carrusel: (personalDataForSelectedType.carruselURLs || []).map(item => ({
            ...item, 
            url: item.url 
        })),
                                                                 
        marca: tipoCard === 'tipoA' 
               ? (personalDataForSelectedType.marca || []) 
               : (personalDataForSelectedType.marcas || []), 
        extras: personalDataForSelectedType.extras || [], 
        servicios: personalDataForSelectedType.servicios || [], 
        
        sitioWeb: personalDataForSelectedType.sitioWeb || '',
        whatsapp: personalDataForSelectedType.whatsapp || '',
        telefono: personalDataForSelectedType.telefono || '',
        email: personalDataForSelectedType.email || '',

        ...(tipoCard === 'tipoB' && {
            galeriaProductos: (personalDataForSelectedType.galeria || []).map(prod => ({
                titulo: prod.titulo,
                precio: prod.precio,
                imagenPreview: prod.url || prod.imagenURL || null, 
            })).filter(p => p.titulo || p.precio || p.imagenPreview)
        }),
    };
    
    if (!formData) {
        return (
            <Container sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography>Cargando resumen...</Typography>
            </Container>
        );
    }
    
    return (
        <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
            <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
                Finalizar Registro y Suscripción
            </Typography>

            <Paper elevation={3}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={activeTab} onChange={handleTabChange} aria-label="Pestañas del checkout" centered>
                        <Tab label="Tu Configuración y Plan" icon={<FaShoppingCart />} iconPosition="start" {...allyProps(0)} />
                        <Tab label="Datos de Contacto" icon={<FaUserCircle />} iconPosition="start" {...allyProps(1)} />
                        <Tab label="Pago" icon={<FaCreditCard />} iconPosition="start" {...allyProps(2)} />
                    </Tabs>
                </Box>

                <TabPanel value={activeTab} index={0}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={5}>
                            <Typography variant="h6" gutterBottom component="div" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <FaFileAlt style={{ marginRight: '8px' }} /> Plan Seleccionado
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Typography variant="h5" component="div" color="primary.main">
                                    {planSeleccionado?.name || 'Nombre del Plan no disponible'}
                                </Typography>
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    {planSeleccionado?.price || '$0 USD'} {planSeleccionado?.frequency || '/mes'}
                                </Typography>
                                <Divider sx={{ my: 1.5 }} />
                                <Typography variant="subtitle1" gutterBottom>Características principales:</Typography>
                                <List dense>
                                    {(planSeleccionado?.features || ['Característica 1', 'Característica 2', 'Característica 3']).slice(0, 3).map((feature, idx) => (
                                        <ListItem key={idx} disablePadding>
                                            <ListItemIcon sx={{ minWidth: '30px' }}><FaCheckCircle color="green" /></ListItemIcon>
                                            <ListItemText primary={feature} />
                                        </ListItem>
                                    ))}
                                </List>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={7}>
                            <Typography variant="h6" gutterBottom component="div" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <FaBuilding style={{ marginRight: '8px' }} /> Vista Previa de tu Publicación
                            </Typography>
                            <Box className="checkout-card-preview-container"  sx={{
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                p: 0.5,
                                overflow: 'hidden',
                                minHeight: 300,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {tipoCard === 'tipoA' && <CardHistoriaPreview proveedor={proveedorPreviewProps} />}
                                {tipoCard === 'tipoB' && <CardProductosPreview proveedor={proveedorPreviewProps} />}
                                {!tipoCard && <Typography>No se ha definido el tipo de card para la previsualización.</Typography>}
                            </Box>
                        </Grid>
                    </Grid>
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                    <Typography variant="h6" gutterBottom component="div">Información del Contacto Principal</Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <List>
                            <ListItem>
                                <ListItemIcon><FaUserCircle /></ListItemIcon>
                                <ListItemText primary="Nombre Completo" secondary={`${datosGenerales.nombre || ''} ${datosGenerales.apellido || ''}`} />
                            </ListItem>
                            <Divider component="li" />
                            <ListItem>
                                <ListItemIcon><FaWhatsapp /></ListItemIcon>
                                <ListItemText primary="WhatsApp de Contacto (Formulario General)" secondary={datosGenerales.whatsapp || 'No provisto'} />
                            </ListItem>
                            <Divider component="li" />
                            <ListItem>
                                <ListItemIcon><FaBuilding /></ListItemIcon>
                                <ListItemText primary="Rol en la Empresa" secondary={datosGenerales.rol || 'No provisto'} />
                            </ListItem>
                            {datosGenerales.cuit && (
                                <>
                                <Divider component="li" />
                                <ListItem>
                                    <ListItemIcon><FaFileAlt /></ListItemIcon>
                                    <ListItemText primary="CUIT/Identificación Fiscal" secondary={datosGenerales.cuit} />
                                </ListItem>
                                </>
                            )}
                             <Divider component="li" />
                            <ListItem>
                                <ListItemIcon><FaCreditCard /></ListItemIcon>
                                <ListItemText primary="Email para Facturación/Notificaciones" secondary={personalDataForSelectedType.email || datosGenerales.email || 'Email no provisto'} />
                            </ListItem>
                        </List>
                    </Paper>
                     <Typography variant="body2" sx={{ mt: 2, textAlign:'center' }}>
                        Esta es la información que usaremos para el registro y contacto.
                    </Typography>
                </TabPanel>

                <TabPanel value={activeTab} index={2}>
                    <Typography variant="h6" gutterBottom component="div">Detalles de Pago (Simulación)</Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Nombre en la Tarjeta" variant="outlined" defaultValue={`${datosGenerales.nombre || ''} ${datosGenerales.apellido || ''}`} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Número de Tarjeta" variant="outlined" placeholder="XXXX XXXX XXXX XXXX" />
                            </Grid>
                            <Grid item xs={6} sm={4}>
                                <TextField fullWidth label="Vencimiento (MM/AA)" variant="outlined" placeholder="MM/AA" />
                            </Grid>
                            <Grid item xs={6} sm={4}>
                                <TextField fullWidth label="CVC/CVV" variant="outlined" placeholder="XXX" />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                 <Typography variant="subtitle1" align="right" sx={{fontWeight:'bold', mt:2}}>
                                    Total: {planSeleccionado?.price || '$0 USD'}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                     <Typography variant="body2" sx={{ mt: 2, textAlign:'center' }}>
                        Esto es una simulación. No se procesarán pagos reales.
                    </Typography>
                </TabPanel>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: { xs: 2, md: 3 }, borderTop: 1, borderColor: 'divider' }}>
                    <Button variant="outlined" onClick={onBack} disabled={isProcessing}>
                        Volver
                    </Button>
                    {onCancel && ( 
                         <Button variant="text" color="error" onClick={onCancel} disabled={isProcessing}>
                            Cancelar Registro
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleFinalConfirm} 
                        disabled={isProcessing || activeTab !== 2} 
                        startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <FaCreditCard />}
                    >
                        {isProcessing ? 'Procesando...' : `Confirmar y Pagar ${planSeleccionado?.price || ''}`}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default ResumenRegistro;