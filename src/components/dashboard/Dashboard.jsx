import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, NavLink } from 'react-router-dom';
import {
    Box, Drawer, AppBar, Toolbar, List, Typography, Divider, CssBaseline,
    ListItem, ListItemButton, ListItemIcon, ListItemText, Collapse
} from '@mui/material';
import { useAuth } from '../../context/AuthContext'; // Assuming path to AuthContext
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config'; // Assuming path to firebase config

// Placeholder components for each dashboard section
// You will create these actual components later
const UserProfileSection = () => <Typography variant="h5" p={3}>User Profile Customization</Typography>;
const ProviderSettingsSection = () => <Typography variant="h5" p={3}>Provider Card/Page Settings</Typography>;
const StatisticsSection = () => <Typography variant="h5" p={3}>Useful Statistics</Typography>;
const ChatSection = () => <Typography variant="h5" p={3}>Internal Chat</Typography>;
const EditProviderGeneral = () => <Typography variant="h5" p={3}>Edit Provider General Info</Typography>;
const EditProviderPersonalized = () => <Typography variant="h5" p={3}>Edit Provider Personalized Info</Typography>;
const EditProviderPlan = () => <Typography variant="h5" p={3}>Edit Provider Plan</Typography>;


const drawerWidth = 280;

function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useAuth();
    const [isProvider, setIsProvider] = useState(false);
    const [providerData, setProviderData] = useState(null);
    const [loadingUserData, setLoadingUserData] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [providerSubMenuOpen, setProviderSubMenuOpen] = useState(false);

    useEffect(() => {
        if (currentUser) {
            const fetchUserData = async () => {
                setLoadingUserData(true);
                try {
                    const userDocRef = doc(db, "users", currentUser.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data();
                        setIsProvider(userData.isProveedor || false);
                        if (userData.isProveedor) {
                            // Attempt to fetch provider data using the *actual uploader's ID* (currentUser.uid)
                            // as the document ID for the provider's record.
                            // This assumes the provider document ID is still the uploader's UID.
                            // If provider IDs are now auto-generated, this logic needs to change
                            // to find the provider document associated with this currentUser.uid.
                            // For now, we'll assume a direct link for simplicity in this skeleton.
                            // You might need a query: collection("proveedores"), where("userId", "==", currentUser.uid)
                            const providerDocRef = doc(db, "proveedores", currentUser.uid); // << ADJUST IF PROVIDER ID IS NOT USER UID
                            const providerDocSnap = await getDoc(providerDocRef);
                            if (providerDocSnap.exists()) {
                                setProviderData(providerDocSnap.data());
                            } else {
                                console.log("Provider document not found for this user, though isProveedor is true.");
                                // This case needs handling - perhaps user is marked as provider but registration is incomplete
                                // or the provider document ID scheme has changed and this fetch is incorrect.
                            }
                        }
                    } else {
                        console.log("User document not found!");
                    }
                } catch (error) {
                    console.error("Error fetching user/provider data:", error);
                } finally {
                    setLoadingUserData(false);
                }
            };
            fetchUserData();
        } else {
            setLoadingUserData(false);
        }
    }, [currentUser]);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleProviderSubMenuToggle = () => {
        setProviderSubMenuOpen(!providerSubMenuOpen);
    };

    const menuItems = [
        { text: 'User Profile', icon: <AccountCircle />, path: '/perfil/profile', show: true },
        { text: 'Provider Settings', icon: <Storefront />, path: '/perfil/provider', show: isProvider, isSubMenuHeader: true, onClick: handleProviderSubMenuToggle, open: providerSubMenuOpen },
        { text: 'Edit General', icon: <Edit />, path: '/perfil/provider/general', show: isProvider, isSubMenuItem: true, parentOpen: providerSubMenuOpen },
        { text: 'Edit Personalized', icon: <Edit />, path: '/perfil/provider/personalized', show: isProvider, isSubMenuItem: true, parentOpen: providerSubMenuOpen },
        { text: 'Edit Plan', icon: <Edit />, path: '/perfil/provider/plan', show: isProvider, isSubMenuItem: true, parentOpen: providerSubMenuOpen },
        { text: 'Statistics', icon: <BarChart />, path: '/perfil/stats', show: true },
        { text: 'Chat', icon: <Message />, path: '/perfil/chat', show: true },
    ];

    const drawerContent = (
        <div>
            <Toolbar>
                <Typography variant="h6" noWrap component="div" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                    Dashboard
                </Typography>
            </Toolbar>
            <Divider />
            <List>
                {menuItems.map((item) => {
                    if (!item.show) return null;

                    if (item.isSubMenuHeader) {
                        return (
                            <React.Fragment key={item.text}>
                                <ListItemButton onClick={item.onClick}>
                                    <ListItemIcon sx={{ minWidth: '40px' }}>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.text} />
                                    {item.open ? <ExpandLess /> : <ExpandMore />}
                                </ListItemButton>
                                <Collapse in={item.open} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding>
                                        {menuItems.filter(subItem => subItem.isSubMenuItem && subItem.parentOpen).map(subItem => (
                                             <ListItem key={subItem.text} disablePadding sx={{ pl: 4 }}>
                                                <ListItemButton component={NavLink} to={subItem.path} selected={location.pathname === subItem.path}>
                                                    <ListItemIcon sx={{ minWidth: '36px' }}>{subItem.icon}</ListItemIcon>
                                                    <ListItemText primary={subItem.text} />
                                                </ListItemButton>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Collapse>
                            </React.Fragment>
                        );
                    }
                    
                    if (item.isSubMenuItem) return null; // Rendered under Collapse

                    return (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton component={NavLink} to={item.path} selected={location.pathname === item.path}>
                                <ListItemIcon sx={{ minWidth: '40px' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </div>
    );

    if (loadingUserData) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Typography>Loading dashboard...</Typography></Box>;
    }
    if (!currentUser) {
         navigate('/login'); // Or your login route
         return null;
    }


    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.2)'
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' }, color: 'text.primary' }}
                    >
                        <Settings /> {/* Using Settings as a placeholder for MenuIcon */}
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: 'text.primary' }}>
                        {menuItems.find(item => location.pathname.startsWith(item.path) && !item.isSubMenuItem)?.text || 
                         menuItems.find(item => location.pathname === item.path && item.isSubMenuItem)?.text ||
                         'My Profile'}
                    </Typography>
                     <Button color="inherit" onClick={() => navigate('/')} sx={{color: 'text.secondary'}}>
                        Go Home
                    </Button>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
                aria-label="dashboard sections"
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, 
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundColor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255,255,255,0.2)' },
                    }}
                >
                    {drawerContent}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(0,0,0,0.5)', color: 'white' },
                    }}
                    open
                >
                    {drawerContent}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, backgroundColor: 'rgba(0,0,0,0.7)' }}
            >
                <Toolbar /> {/* For spacing under the AppBar */}
                <Routes>
                    <Route index element={<UserProfileSection />} /> {/* Default for /perfil */}
                    <Route path="profile" element={<UserProfileSection />} />
                    {isProvider && (
                        <>
                            <Route path="provider" element={<ProviderSettingsSection />} /> 
                            <Route path="provider/general" element={<EditProviderGeneral />} />
                            <Route path="provider/personalized" element={<EditProviderPersonalized />} />
                            <Route path="provider/plan" element={<EditProviderPlan />} />
                        </>
                    )}
                    <Route path="stats" element={<StatisticsSection />} />
                    <Route path="chat" element={<ChatSection />} />
                    <Route path="*" element={<Typography>Section not found.</Typography>} /> {/* Fallback for /perfil/* */}
                </Routes>
            </Box>
        </Box>
    );
}

export default Dashboard;