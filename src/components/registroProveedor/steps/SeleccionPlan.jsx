import React from "react";
import { Container, Typography, Grid, Card, CardContent, Button, Chip, Box } from '@mui/material';
import { FaCheckCircle } from "react-icons/fa";

const plansData = [
    {
        id: 'Base',
        name: 'Base',
        price: '$1 USD',
        frequency: '/mensual',
        description: 'Visibilidad inicial para conectar tu empresa con nuevas oportunidades en el mercado mayorista.',
        features: [
            'Publicación de Productos',
            'Catálogo digital propio',
            'Card Productos',
            'Multimedia en Carrusel',
            'Soporte prioritario al Proveedor',
            'Enlace directo a su canal de ventas',
            'Categoría, Tipo de Proveedor, Marcas y Ubicación',
            'Nombre e Historia de tu empresa',
        ],
        buttonText: 'Empezar',
        muiButtonVariant: 'contained',
        isPopular: false,
        cardClassName: 'plan-card plan-card--base',
        buttonClassName: 'plan-button plan-button--base'
    },
    {
        id: 'Pro',
        name: 'Pro',
        tag: 'Más vendido',
        logoText: 'Mercadonet +',
        price: '$5 USD',
        frequency: '/mensual',
        description: 'Una experiencia exclusiva. Destaca con herramientas avanzadas, visibilidad premium y una sección exclusiva para tus productos.',
        features: [
            'Publicación de Productos',
            'Catálogo digital propio',
            'Card Productos',
            'Multimedia en Carrusel',
            'Soporte prioritario al Proveedor',
            'Enlace directo a su canal de ventas',
            'Categoría, Tipo de Proveedor, Marcas y Ubicación',
            'Nombre e Historia de tu empresa',
        ],
        buttonText: 'Empezar',
        muiButtonVariant: 'contained',
        isPopular: true,
        cardClassName: 'plan-card plan-card--popular',
        buttonClassName: 'plan-button plan-button--popular'
    },
];

const SeleccionPlan = ({ nextStep, prevStep, updateFormData }) => {
    const handlePlanSelection = (planId) => {
        const selectedPlanData = plansData.find(p => p.id === planId);
        if (selectedPlanData) {
            updateFormData({ plan: selectedPlanData });
        }
        nextStep();
    };

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
            <Typography
                variant="subtitle2" // Podría ser 'overline' o 'caption' también para un texto pequeño y estilizado
                align="center"
                gutterBottom
                className="section-plans-title" // Clase Sass para el color blanco y otros estilos
            >
                PLANES
            </Typography>
            <Typography
                variant="h3"
                component="h1"
                align="center"
                gutterBottom
                className="section-main-title" // Clase Sass para el color blanco
                sx={{ fontWeight: 'bold', mb: 1 }}
            >
                Comienza hoy y dale visibilidad a tu empresa en el mercado Mayorista
            </Typography>
            <Typography
                variant="h6"
                align="center"
                paragraph // paragraph añade un margin-bottom
                className="section-subtitle" // Clase Sass para el color blanco
                sx={{ mb: { xs: 3, md: 5 } }}
            >
                Conecta, destaca y crece con el plan que potencie tu empresa
            </Typography>

            <Grid container spacing={4} justifyContent="center" alignItems="stretch">
                {plansData.map((plan) => (
                    <Grid item key={plan.id} xs={12} sm={7} md={plan.isPopular ? 4.5 : 3.5}>
                        <Card
                            className={plan.cardClassName}
                            sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}
                        >
                            {plan.isPopular && plan.tag && (
                                <Chip
                                    label={plan.tag}
                                    className="plan-tag" // Estilizado en Sass
                                    size="small"
                                    sx={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', zIndex: 1 }}
                                />
                            )}
                            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: { xs: 2, md: 3 } }}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="h4" component="h2" className="plan-name" gutterBottom>
                                        {plan.name}
                                        {plan.logoText && <span className="plan-logo-text">{plan.logoText}</span>}
                                    </Typography>
                                    <Typography variant="body2" className="plan-description">
                                        {plan.description}
                                    </Typography>
                                </Box>
                                <Box sx={{ mb: 3, display: 'flex', alignItems: 'baseline' }}>
                                    <Typography variant="h3" component="p" className="plan-price">
                                        {plan.price}
                                    </Typography>
                                    <Typography variant="subtitle1" className="plan-frequency">
                                        {plan.frequency}
                                    </Typography>
                                </Box>
                                <Typography variant="subtitle1" gutterBottom className="plan-features-title">
                                    ¿Qué está incluido?
                                </Typography>
                                <Box component="ul" className="plan-feature-list" sx={{ listStyle: 'none', p: 0, mb: 'auto' }}>
                                    {plan.features.map((feature, index) => (
                                        <Box component="li" key={index} className="plan-feature-item" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <FaCheckCircle fontSize="small" className="plan-feature-icon" />
                                            <Typography variant="body2" sx={{ ml: 1 }}>{feature}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </CardContent>
                            <Box sx={{ p: { xs: 2, md: 3 }, pt: 0 }}>
                                <Button
                                    fullWidth
                                    variant={plan.muiButtonVariant}
                                    className={plan.buttonClassName}
                                    onClick={() => handlePlanSelection(plan.id)}
                                >
                                    {plan.buttonText}
                                </Button>
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Box textAlign="center" sx={{ mt: 4 }}>
                <Button variant="outlined" onClick={prevStep} className="multistep-button-prev">
                    Volver
                </Button>
            </Box>
        </Container>
    );
};

export default SeleccionPlan;