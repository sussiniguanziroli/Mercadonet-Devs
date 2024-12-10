import React from 'react';
import { Skeleton, Box } from '@mui/material';

const SkeletonFilterLoader = () => (
  <Box
    sx={{
      width: '400px', // Ancho fijo para los filtros
      padding: 2, // Padding interno
      display: 'flex',
      flexDirection: 'column',
      gap: 2, // Espaciado entre los elementos
    }}
  >
    {/* Simula el título del filtro */}
    <Skeleton variant="text" width="60%" height={30} />

    {/* Simula las opciones del filtro */}
    {Array.from(new Array(6)).map((_, index) => (
      <Skeleton key={index} variant="rectangular" width="100%" height={25} />
    ))}

    {/* Simula un nuevo grupo de filtros */}
    <Skeleton variant="text" width="50%" height={30} />
    {Array.from(new Array(4)).map((_, index) => (
      <Skeleton key={index} variant="rectangular" width="100%" height={25} />
    ))}
  </Box>
);

export default SkeletonFilterLoader;
