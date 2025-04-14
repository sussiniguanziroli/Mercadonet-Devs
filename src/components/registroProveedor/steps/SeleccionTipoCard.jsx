// src/components/registroProveedor/steps/SeleccionTipoCard.jsx

import React from 'react';
import { Box, Typography, ButtonBase } from '@mui/material';

// --- Componente del Paso: Selección de Tipo de Card ---
const SeleccionTipoCard = ({
    onSelectCard,
    onCancel
}) => {

    const handleCardSelection = (cardType) => {
        console.log(`[SeleccionTipoCard] Selected: ${cardType}`);
        onSelectCard(cardType);
    };

    // --- URLs Originales de las Imágenes ---
    const imgHistoriaSrc = "https://i.ibb.co/BckXY1L/Card-Historia.png";
    const imgProductosSrc = "https://i.ibb.co/7gFBkjr/Card-Producto.png";

    const textColor = 'common.white';
    const secondaryTextColor = 'grey.300';
    const accentColor = '#FFA500'; // Ajusta si usas variable SASS $color-naranja

    return (
        <Box sx={{
            textAlign: 'center',
            padding: { xs: 1, sm: 2, md: 0 },
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: 3, md: 4 },
            width: '100%',
            alignItems: 'center'
        }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: '500', color: textColor, mt: { xs: 2, md: 0 } }}>
                Elige el Tipo de Card para tu Perfil
            </Typography>

            {/* Contenedor de las opciones */}
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'center',
                // --- CAMBIO AQUÍ ---
                // Antes: alignItems: 'center' (o 'flex-start' en una versión)
                // Ahora: Alinear al inicio (arriba) en desktop, centrado en móvil
                alignItems: { xs: 'center', md: 'flex-start' },
                // --- FIN CAMBIO ---
                flexWrap: 'wrap',
                gap: { xs: 5, md: 8 },
                width: '100%',
                mt: 2,
            }}>

                {/* Opción 1: Card Historia */}
                <div className="button-and-text-div">
                    <Typography variant="h5" component="h2" sx={{ mb: 2, fontFamily: 'Montserrat, sans-serif', color: textColor }}>
                        Card Historia
                    </Typography>
                    <ButtonBase
                        onClick={() => handleCardSelection('tipoA')}
                        focusRipple
                        sx={{ borderRadius: '8px', display: 'block', padding: '2px' }}
                        aria-label="Seleccionar Card Historia"
                        className="card-image-button"
                    >
                        <img
                            src={imgHistoriaSrc}
                            alt="Ejemplo de Card Historia"
                            style={{ display: 'block', maxWidth: '300px', width: '100%', height: 'auto', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}
                        />
                    </ButtonBase>
                    <Typography variant="body2" component="p" sx={{ mt: 2, color: secondaryTextColor }} className="card-description-hover">
                         Todo proveedor tiene una historia que contar y una identidad a construir.
                    </Typography>
                     <Typography variant="body2" component="p" sx={{ color: secondaryTextColor }} className="card-description-hover">
                         ¡Cuéntanos a qué se dedica tu empresa y por qué deberían elegirte!
                    </Typography>
                </div>

                {/* Opción 2: Card Productos */}
                <div className="button-and-text-div">
                     <Typography variant="h5" component="h2" sx={{ mb: 2, fontFamily: 'Montserrat, sans-serif', color: textColor }}>
                        Card Productos
                    </Typography>
                    <ButtonBase
                        onClick={() => handleCardSelection('tipoB')}
                        focusRipple
                        sx={{ borderRadius: '8px', display: 'block', padding: '2px' }}
                        aria-label="Seleccionar Card Productos"
                        className="card-image-button"
                    >
                        <img
                            src={imgProductosSrc}
                            alt="Ejemplo de Card Productos"
                            style={{ display: 'block', maxWidth: '300px', width: '100%', height: 'auto', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}
                        />
                    </ButtonBase>
                    <Typography variant="body2" component="p" sx={{ mt: 2, color: secondaryTextColor }} className="card-description-hover">
                        Card Premium de
                        <Typography component="span" sx={{ fontWeight: 'bold', color: accentColor }}>
                            {' '}Mercadonet+
                        </Typography>
                    </Typography>
                     <Typography variant="body2" component="p" sx={{ color: secondaryTextColor }} className="card-description-hover">
                         Destinado a proveedores más demandantes que buscan destacar su catálogo de manera visual.
                    </Typography>
                     <Typography variant="body2" component="p" sx={{ color: secondaryTextColor }} className="card-description-hover">
                         Permite mostrar imágenes y descripciones de publicaciones o productos directamente en la tarjeta del proveedor.
                    </Typography>
                </div>

            </Box>
        </Box>
    );
};

export default SeleccionTipoCard;