// src/components/registroProveedor/assetsRegistro/CustomStepIcon.jsx (o donde lo tengas)
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
// --- Importa los íconos que necesitas de react-icons ---
// Elige los que mejor se adapten a tus pasos. Ejemplos:
import { FaFileAlt, FaClipboardList, FaFileImage, FaStar, FaCheck} from 'react-icons/fa'; // Usando Font Awesome (fa)
import { MdSummarize } from "react-icons/md";


// El styled component para el círculo naranja se mantiene igual
const StepIconRoot = styled(Box)(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.grey[700], // Color base si no está activo/completado
  zIndex: 1,
  color: '#fff', // Color del ícono dentro del círculo
  width: 40,
  height: 40,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '1.1rem', // Tamaño base para los íconos de react-icons
  ...( (ownerState.active || ownerState.completed) && {
       background: 'linear-gradient(135deg, #ff9c39 0%, #FF7F00 100%)', // Tu degradado naranja
       boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
  }),
  ...(ownerState.completed && {
      // Puedes mantener el mismo estilo o cambiarlo ligeramente si está completado
  }),
}));

function CustomStepIcon(props) {
  const { active, completed, className, icon } = props; // 'icon' es el número del paso (1, 2, 3...)

  // --- Mapea el número del paso al ícono de react-icons ---
  // ¡Asegúrate de que estos íconos representen bien tus pasos!
  const icons = {
    '1': <FaFileAlt />,          // Ícono para "Elección de Card"
    '2': <FaClipboardList />,    // Ícono para "Datos básicos de Empresa"
    '3': <FaFileImage />,        // Ícono para "Descripción y Multimedia"
    '4': <FaStar />, 
    '5': <MdSummarize />,        // Ícono para "Mercadonet+"
    // Añade más si tienes más pasos
  };

  return (
    <StepIconRoot ownerState={{ completed, active }} className={className}>
       {/* Decide qué mostrar: el ícono del paso o un check si está completado */}
       {/* Opción 1: Mostrar check si está completado */}
       {/* {completed ? <FaCheck /> : icons[String(icon)]} */}

       {/* Opción 2: Mostrar siempre el ícono del paso (parece más cercano a tu imagen) */}
       {icons[String(icon)]}
    </StepIconRoot>
  );
}

export default CustomStepIcon;