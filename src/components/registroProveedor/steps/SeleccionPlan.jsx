// src/components/registroProveedor/steps/SeleccionPlan.jsx

import React, { useState, useEffect } from "react";
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
        buttonText: 'Seleccionar Plan Base',
        isPopular: false,
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
        buttonText: 'Seleccionar Plan Pro',
        isPopular: true,
    },
];

const SeleccionPlan = ({ initialData, onNext, onBack }) => {
    const [selectedPlanId, setSelectedPlanId] = useState(null);

    useEffect(() => {
        if (initialData && initialData.id) {
            setSelectedPlanId(initialData.id);
        }
    }, [initialData]);

    const handlePlanCardSelection = (planId) => {
        setSelectedPlanId(planId);
    };

    const handleContinueToSummary = () => {
        if (!selectedPlanId) {
            alert("Por favor, selecciona un plan para continuar.");
            return;
        }
        const currentSelectedPlanObject = plansData.find(p => p.id === selectedPlanId);
        if (currentSelectedPlanObject) {
            onNext(currentSelectedPlanObject);
        } else {
            alert("Error al encontrar los detalles del plan seleccionado.");
            console.error("Error: No se encontró el objeto del plan para el ID:", selectedPlanId);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
            <Typography variant="subtitle2" align="center" gutterBottom className="section-plans-title">
                PLANES
            </Typography>
            <Typography variant="h3" component="h1" align="center" gutterBottom className="section-main-title" sx={{ fontWeight: 'bold', mb: 1 }}>
                Comienza hoy y dale visibilidad a tu empresa en el mercado Mayorista
            </Typography>
            <Typography variant="h6" align="center" paragraph className="section-subtitle" sx={{ mb: { xs: 3, md: 5 } }}>
                Conecta, destaca y crece con el plan que potencie tu empresa
            </Typography>

            <Grid container spacing={4} justifyContent="center" alignItems="stretch">
                {plansData.map((plan) => {
                    const isSelected = selectedPlanId === plan.id;
                    const cardClasses = `plan-card ${plan.isPopular ? 'plan-card--popular' : 'plan-card--base'} ${isSelected ? 'plan-card--selected' : ''}`;

                    return (
                        <Grid item key={plan.id} xs={12} sm={7} md={plan.isPopular ? 4.5 : 3.5}>
                            <Card
                                className={cardClasses}
                                onClick={() => handlePlanCardSelection(plan.id)}
                                sx={{ // Mantener solo SX que no colisionen con SASS o sean para layout básico
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative', // Necesario para el Chip absoluto
                                    // cursor: 'pointer', // Ya definido en SASS .plan-card
                                    // transiciones, borders, shadows, transform manejados por SASS
                                }}
                            >
                                {plan.isPopular && plan.tag && (
                                    <Chip
                                        label={plan.tag}
                                        className="plan-tag" // SASS controlará esto
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
                                    <Box component="ul" className="plan-feature-list" sx={{ listStyle: 'none', p: 0, mb: 'auto' /*o mb:3 si prefieres*/ }}>
                                        {plan.features.map((feature, index) => (
                                            <Box component="li" key={index} className="plan-feature-item" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <FaCheckCircle fontSize="small" className="plan-feature-icon" /> {/* Color manejado por SASS */}
                                                <Typography variant="body2" sx={{ ml: 1 }}>{feature}</Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </CardContent>
                                <Box sx={{ p: { xs: 2, md: 3 }, pt: 0, mt: 'auto' }}>
                                    <Button
                                        fullWidth
                                        className="plan-button" // SASS controlará variant, color, fontWeight
                                    >
                                        {isSelected ? 'Plan Seleccionado' : plan.buttonText}
                                    </Button>
                                </Box>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 5, pt: 2, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                <Button variant="outlined" onClick={onBack} className="multistep-button-prev">
                    {/* sx para color y borde del botón "Volver" se pueden mantener o mover a SASS si ya está definido en .multistep-button-prev */}
                    Volver
                </Button>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleContinueToSummary}
                    disabled={!selectedPlanId}
                    className="multistep-button-next" // Puedes añadir estilos SASS para esta clase si MUI no es suficiente
                    sx={{
                        color: 'common.white',
                        '&.Mui-disabled': {
                            backgroundColor: 'rgba(255, 255, 255, 0.12)',
                            color: 'rgba(255, 255, 255, 0.3)',
                            borderColor: 'rgba(255, 255, 255, 0.12)',
                        }
                    }}
                >
                    Continuar al Resumen
                </Button>
            </Box>
        </Container>
    );
};

export default SeleccionPlan;