import React from 'react';
import { Skeleton, Box } from '@mui/material';

const SkeletonMobileCard = () => (
  <Box 
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 1, // Espaciado entre los elementos
      padding: 2,
      border: '1px solid #ddd',
      borderRadius: '8px',
      width: '100%', // Asegura que ocupe todo el ancho disponible
      minHeight: 200, // Altura mínima de la tarjeta
    }}
  >
    {/* Logotipo */}
    <Skeleton variant="rectangular" width="100%" height={120} /> {/* Imagen de la card (logotipo) */}

    {/* Título */}
    <Skeleton variant="text" width="80%" height={25} />

    {/* Descripción */}
    <Skeleton variant="text" width="90%" height={15} />
    <Skeleton variant="text" width="70%" height={15} />

    {/* Botones */}
    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
      <Skeleton variant="rectangular" width="45%" height={30} /> {/* Botón 1 */}
      <Skeleton variant="rectangular" width="45%" height={30} /> {/* Botón 2 */}
    </Box>
  </Box>
);

const SkeletonMobileCardLoader = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column', // Coloca las cards de manera vertical (una por debajo de la otra)
      gap: 3, // Espaciado entre las tarjetas
      width: '100%', // Se adapta a cualquier contenedor
      padding: '10px 0',
    }}
  >
    {Array.from(new Array(4)).map((_, index) => (
      <SkeletonMobileCard key={index} />
    ))}
  </Box>
);

export default SkeletonMobileCardLoader;
