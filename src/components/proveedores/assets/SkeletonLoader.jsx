import React from 'react';
import { Skeleton, Box } from '@mui/material';

const SkeletonCard = () => (
    <Box

        sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 2,
            padding: 2,
            border: '1px solid #ddd',
            borderRadius: '8px',
            alignItems: 'center',
            minHeight: 300, // Altura mínima
            width: '100%',
        }}
    >
        {/* Logotipo */}
        <Skeleton variant="rectangular" width={100} height={100} /> {/* Logotipo cuadrado */}

        <Box sx={{ flex: 1 }}>
            {/* Título */}
            <Skeleton variant="text" width="50%" height={25} />

            {/* Subtítulo */}
            <Skeleton variant="text" width="30%" height={20} />

            {/* Descripción */}
            <Skeleton variant="text" width="80%" height={15} />
            <Skeleton variant="text" width="70%" height={15} />
        </Box>

        {/* Botones */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Skeleton variant="rectangular" width={80} height={30} /> {/* Botón 1 */}
            <Skeleton variant="rectangular" width={80} height={30} /> {/* Botón 2 */}
        </Box>
    </Box>
);

const SkeletonLoader = () => (
    <Box
        sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3, // Espaciado entre tarjetas
            width: '100%', // Ocupa todo el ancho disponible
        }}
    >
        {Array.from(new Array(4)).map((_, index) => (
            <SkeletonCard key={index} />
        ))}
    </Box>
);

export default SkeletonLoader;
