// components/registroProveedor/assetsRegistro/CustomStepper.jsx
// (Asegúrate de que la ruta sea correcta donde lo uses)

// styled ya no se importa
import { Stepper, Step, StepLabel } from "@mui/material";

const CustomStepper = ({ activeStep, steps, sx = {} }) => {
  return (
    <Stepper
      activeStep={activeStep}
      alternativeLabel
      sx={{
        padding: 3,
        backgroundColor: "background.paper", // Usa color del tema
        borderRadius: 2,
        ...sx // Permite añadir/sobrescribir estilos desde fuera
      }}
    >
      {steps.map((label, index) => (
        <Step key={label}>
          <StepLabel
            sx={{
              "& .MuiStepLabel-label": { // Estilo para el texto del label
                fontWeight: activeStep === index ? "bold" : "normal",
                color: activeStep === index ? "primary.main" : "text.secondary", // Colores del tema
                // Podrías añadir otras propiedades como fontSize si quisieras
              },
              // Ejemplo: Estilo opcional para el ícono
              // "& .MuiStepIcon-root": {
              //   color: activeStep === index ? "primary.main" : "action.disabled",
              //   "&.Mui-completed": {
              //      color: "success.main", // Color para pasos completados
              //    },
              // }
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