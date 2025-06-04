import React, { useState, useEffect } from 'react';
    import { useNavigate, useLocation, NavLink } from 'react-router-dom';
    import {
        Box, Drawer, AppBar, Toolbar, List, Typography, Divider, CssBaseline,
        ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, CircularProgress, Button as MuiButton
    } from '@mui/material';
    import {
        AccountCircle, BarChart, Email, Storefront, Favorite, Receipt,
        Dashboard as DashboardIcon, Menu as MenuIcon, Business
    } from '@mui/icons-material';

    import { useAuth } from '../../context/AuthContext'; // Adjust path as needed
    import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
    import { db } from '../../firebase/config'; // Adjust path as needed
    import DashboardRouter from './DashboardRouter'; // Import the router for the content

    const drawerWidth = 260;

    function Dashboard() {
        const navigate = useNavigate();
        const location = useLocation();
        const { currentUser, logout } = useAuth();
        const [isProvider, setIsProvider] = useState(false);
        // eslint-disable-next-line no-unused-vars
        const [providerDocs, setProviderDocs] = useState([]);
        const [loadingUserData, setLoadingUserData] = useState(true);
        const [mobileOpen, setMobileOpen] = useState(false);
        const [userName, setUserName] = useState('');
        const [headerTitle, setHeaderTitle] = useState('Panel');

        useEffect(() => {
            const currentPath = location.pathname;
            // Define paths for title setting
            const pathTitles = {
                '/perfil/provider-panel': 'Panel de Proveedor',
                '/perfil/provider/edit': 'Editar Mi Empresa',
                '/perfil/provider/products': 'Mis Productos',
                '/perfil/provider/stats': 'Estadísticas de Proveedor',
                '/perfil/provider/messages': 'Mensajes de Proveedor',
                '/perfil/profile': 'Editar Perfil',
                '/perfil/favorites': 'Favoritos',
                '/perfil/billing': 'Facturación',
            };

            if (currentPath === '/perfil') {
                setHeaderTitle(isProvider ? 'Panel de Proveedor' : 'Editar Perfil');
            } else {
                setHeaderTitle(pathTitles[currentPath] || 'Panel');
            }
        }, [location.pathname, isProvider]);

        useEffect(() => {
            if (currentUser) {
                const fetchUserDataAndProviderStatus = async () => {
                    setLoadingUserData(true);
                    try {
                        const userDocRef = doc(db, "users", currentUser.uid);
                        const userDocSnap = await getDoc(userDocRef);

                        if (userDocSnap.exists()) {
                            const userData = userDocSnap.data();
                            const providerStatus = userData.isProveedor || false;
                            setIsProvider(providerStatus);
                            setUserName(userData.displayName || currentUser.email || 'Usuario');

                            if (providerStatus) {
                                const q = query(collection(db, "proveedores"), where("userId", "==", currentUser.uid));
                                const providerQuerySnapshot = await getDocs(q);
                                const fetchedProviderDocs = [];
                                providerQuerySnapshot.forEach((doc) => {
                                    fetchedProviderDocs.push({ id: doc.id, ...doc.data() });
                                });
                                setProviderDocs(fetchedProviderDocs);
                                // if (fetchedProviderDocs.length === 0) {
                                //     console.log("User is marked as provider, but no provider documents found linking to this user ID.");
                                // }
                            }
                        } else {
                            // console.log("User document not found for UID:", currentUser.uid);
                            setIsProvider(false); 
                        }
                    } catch (error) {
                        console.error("Error fetching user/provider data:", error);
                        setIsProvider(false); 
                    } finally {
                        setLoadingUserData(false);
                    }
                };
                fetchUserDataAndProviderStatus();
            } else {
                setLoadingUserData(false); 
                navigate('/login'); 
            }
        }, [currentUser, navigate]);

        const handleDrawerToggle = () => {
            setMobileOpen(!mobileOpen);
        };
        
        const handleLogout = async () => {
            try {
                await logout();
                navigate('/'); 
            } catch (error) {
                console.error("Error logging out:", error);
            }
        };

        const providerMenuItems = [
            { text: 'Panel de Proveedor', icon: <DashboardIcon />, path: '/perfil/provider-panel' },
            { text: 'Editar mi Empresa', icon: <Business />, path: '/perfil/provider/edit' },
            { text: 'Mis productos', icon: <Storefront />, path: '/perfil/provider/products' },
            { text: 'Estadísticas', icon: <BarChart />, path: '/perfil/provider/stats' },
            { text: 'Mensajes', icon: <Email />, path: '/perfil/provider/messages' },
        ];

        const userMenuItems = [
            { text: 'Editar Perfil', icon: <AccountCircle />, path: '/perfil/profile' },
            { text: 'Favoritos', icon: <Favorite />, path: '/perfil/favorites' },
            { text: 'Facturación', icon: <Receipt />, path: '/perfil/billing' },
        ];

        const drawerContent = (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2, backgroundColor: 'rgba(0,0,0,0.2)' }}>
                    <Typography variant="h5" noWrap component={NavLink} to="/"
                        sx={{
                            color: '#FFA500', 
                            fontWeight: 'bold',
                            textDecoration: 'none',
                            '&:hover': { color: '#FFC966' }
                        }}>
                        Mercado<span style={{ color: 'white' }}>.NET</span>
                    </Typography>
                </Toolbar>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
                <List sx={{ flexGrow: 1, py:0 }}>
                    {isProvider && (
                        <>
                            <ListItem sx={{ pt: 2, pb: 1 }}>
                                <Typography variant="overline" sx={{ color: 'grey.500', pl: 2, fontSize: '0.65rem', fontWeight: 'bold' }}>PROVEEDOR</Typography>
                            </ListItem>
                            {providerMenuItems.map((item) => (
                                <ListItem key={item.text} disablePadding>
                                    <ListItemButton component={NavLink} to={item.path} selected={location.pathname === item.path}
                                        sx={{
                                            '&.Mui-selected': { backgroundColor: 'rgba(255, 165, 0, 0.15)', borderRight: '4px solid #FFA500', '& svg': {color: '#FFA500'}, '& .MuiListItemText-primary': {color: '#FFA500', fontWeight: '500'} , '&:hover': {backgroundColor: 'rgba(255, 165, 0, 0.25)'} },
                                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' },
                                            py: 1, pl:3, my: 0.5, borderRadius: '0 8px 8px 0', mr:1
                                        }}>
                                        <ListItemIcon sx={{ color: 'grey.400', minWidth: '40px' }}>{item.icon}</ListItemIcon>
                                        <ListItemText primary={item.text} primaryTypographyProps={{fontSize: '0.9rem'}}/>
                                    </ListItemButton>
                                </ListItem>
                            ))}
                            <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
                        </>
                    )}
                    <ListItem sx={{ pt: isProvider ? 1 : 2, pb: 1 }}>
                        <Typography variant="overline" sx={{ color: 'grey.500', pl: 2, fontSize: '0.65rem', fontWeight: 'bold' }}>USUARIO</Typography>
                    </ListItem>
                    {userMenuItems.map((item) => (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton component={NavLink} to={item.path} selected={location.pathname === item.path}
                                 sx={{
                                    '&.Mui-selected': { backgroundColor: 'rgba(255, 165, 0, 0.15)', borderRight: '4px solid #FFA500', '& svg': {color: '#FFA500'}, '& .MuiListItemText-primary': {color: '#FFA500', fontWeight: '500'} , '&:hover': {backgroundColor: 'rgba(255, 165, 0, 0.25)'} },
                                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' },
                                    py: 1, pl:3, my: 0.5, borderRadius: '0 8px 8px 0', mr:1
                                }}>
                                <ListItemIcon sx={{ color: 'grey.400', minWidth: '40px' }}>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} primaryTypographyProps={{fontSize: '0.9rem'}}/>
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
                 <Box sx={{ p: 2, mt: 'auto' }}>
                    <MuiButton fullWidth variant="outlined" onClick={handleLogout} sx={{color: 'grey.400', borderColor: 'grey.600', '&:hover': {borderColor: 'grey.500', backgroundColor: 'rgba(255,255,255,0.05)'}}}>
                        Cerrar Sesión
                    </MuiButton>
                </Box>
            </Box>
        );

        if (loadingUserData) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#121212' }}>
                    <CircularProgress sx={{color: '#FFA500' }} />
                    <Typography sx={{ml: 2, color: 'white'}}>Cargando panel...</Typography>
                </Box>
            );
        }
        
        if (!currentUser && !loadingUserData) { 
            return null; 
        }

        return (
            <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#1e1e1e' }}>
                <CssBaseline />
                <AppBar
                    position="fixed"
                    sx={{
                        width: { md: `calc(100% - ${drawerWidth}px)` },
                        ml: { md: `${drawerWidth}px` },
                        backgroundColor: 'rgba(30,30,30,0.85)', 
                        backdropFilter: 'blur(8px)',
                        boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
                    }}
                >
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2, display: { md: 'none' }, color: 'white' }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: 'white', fontWeight: '500' }}>
                             {headerTitle}
                        </Typography>
                        <Typography sx={{ color: 'grey.400', mr: 2 }}>Hola, {userName}</Typography>
                    </Toolbar>
                </AppBar>
                <Box
                    component="nav"
                    sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
                    aria-label="dashboard sections"
                >
                    <Drawer 
                        variant="temporary"
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        ModalProps={{ keepMounted: true }}
                        sx={{
                            display: { xs: 'block', md: 'none' },
                            '& .MuiDrawer-paper': { 
                                boxSizing: 'border-box', 
                                width: drawerWidth, 
                                backgroundColor: '#171717', 
                                color: 'white',
                                borderRight: '1px solid rgba(255,255,255,0.1)'
                            },
                        }}
                    >
                        {drawerContent}
                    </Drawer>
                    <Drawer 
                        variant="permanent"
                        sx={{
                            display: { xs: 'none', md: 'block' },
                            '& .MuiDrawer-paper': { 
                                boxSizing: 'border-box', 
                                width: drawerWidth,
                                backgroundColor: '#171717', 
                                color: 'white',
                                borderRight: 'none' 
                            },
                        }}
                        open
                    >
                        {drawerContent}
                    </Drawer>
                </Box>
                <Box
                    component="main"
                    sx={{ 
                        flexGrow: 1, 
                        p: {xs: 2, sm: 3}, 
                        width: { md: `calc(100% - ${drawerWidth}px)` }, 
                        color: 'white',
                        mt: { xs: '56px', sm: '64px'} 
                    }}
                >
                    {!loadingUserData && <DashboardRouter isProvider={isProvider} />}
                </Box>
            </Box>
        );
    }

    export default Dashboard;
    