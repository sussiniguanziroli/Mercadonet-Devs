// components/registroProveedor/assetsRegistro/CustomStepper.jsx
import { Stepper, Step, StepLabel, StepConnector } from "@mui/material";
import CustomStepIcon from './CustomStepIcon'; // Importa tu ícono personalizado
import { styled } from '@mui/material/styles'; // Necesitas styled para el conector

// --- Estilizar el Conector ---
// (Este styled component se mantiene igual que antes)
const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  // Estilos para el contenedor del conector si necesitas (posicionamiento)
  // top: 18,

  // Quitar la línea por defecto y usar el elemento 'line' para el degradado
  '& .MuiStepConnector-line': {
    height: 3, // Grosor de la línea
    border: 0,
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0', // Color inactivo
    borderRadius: 1,
    // --- Simplificación: Hacer toda la línea naranja por ahora ---
    // (Considera mover la lógica de active/completed al theme.js como vimos antes para mayor precisión)
    borderColor: 'transparent',
    background: 'linear-gradient(90deg, #FF7F00 0%, #ff9c39 100%)', // Usando colores directamente
  },
}));


const CustomStepper = ({ activeStep, steps, sx = {} }) => {
  return (
    <Stepper
      alternativeLabel // Mantiene las etiquetas debajo
      activeStep={activeStep}
      // Usa el conector personalizado
      connector={<ColorlibConnector />}
      sx={{
        padding: 3,
        // Asume que el fondo oscuro viene del contenedor padre o del modo oscuro del tema
        // backgroundColor: "background.paper",
        ...sx
      }}
    >
      {steps.map((label, index) => (
        <Step key={label}>
          <StepLabel
            // *** CORRECCIÓN APLICADA AQUÍ ***
            slots={{ stepIcon: CustomStepIcon }} // Usar la prop 'slots' en lugar de 'StepIconComponent'
            sx={{
              "& .MuiStepLabel-label": { // Estilo para el texto del label
                marginTop: 1, // Espacio entre ícono y texto
                // Usa un color claro de tu tema o directamente blanco
                // color: 'custom.blanco',
                color: '#FFFFFF',
                fontWeight: activeStep === index ? "bold" : "normal",
                '&.Mui-active': { color: '#FAFAFA' }, // Estilos opcionales comentados
                '&.Mui-completed': { color: '#FAFAFA' },
              },
            }}
          >
            {label}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};

export default CustomStepper;