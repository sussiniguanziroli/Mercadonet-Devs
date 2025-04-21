// Ubicación recomendada: src/theme.js

import { createTheme } from '@mui/material/styles';
// --- IMPORTACIÓN AÑADIDA ---
import { stepConnectorClasses } from '@mui/material/StepConnector';

// --- Tus Variables Originales (como referencia para la sección 'custom') ---
// ... (variables comentadas igual que antes) ...

const theme = createTheme({
  // --------------------------------------------------
  // PALETA DE COLORES
  // --------------------------------------------------
  palette: {
    mode: 'light',
    primary: {
      main: '#131921',
      dark: '#242e3d',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FF7F00',
      light: '#ff9c39',
      contrastText: '#000000',
    },
    text: {
      primary: '#2c2c2c',
      secondary: '#7A7A7A',
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    // error: { main: '#d32f2f' },
    // warning: { main: '#ffa000' },
    // info: { main: '#1976d2' },
    // success: { main: '#388e3c' },
    custom: {
      gris: '#7A7A7A',
      naranja: '#FF7F00',
      azul: '#131921',
      blanco: '#FFFFFF',
      negro: '#000000',
      azulHover: '#242e3d',
      naranjaHover: '#ff9c39',
      azulBarroq: '#1D2830',
      mainWhite: '#F5F5F5',
      textGray: '#2c2c2c',
      buttonYellow: '#F5B31F',
      footerBackground: '#e1e1e1',
      mobileButton: '#2f6735',
      azulOscuro: '#7098ee',
      darkGray: '#474747',
      listWhite: '#f5f7f8',
      itemWhite: '#ffffff',
      azulLight: '#004787',
      azulUtils: '#084484',
    }
  },

  // --------------------------------------------------
  // TIPOGRAFÍA
  // --------------------------------------------------
  typography: {
    fontFamily: [
      '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"',
      'Arial', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"',
    ].join(','),
    // ... (otras personalizaciones de tipografía comentadas) ...
  },

  // --------------------------------------------------
  // ESPACIADO
  // --------------------------------------------------
  spacing: 8,

  // --------------------------------------------------
  // FORMA
  // --------------------------------------------------
  shape: {
    borderRadius: 4,
  },

  // --------------------------------------------------
  // SOBRESCRITURA DE COMPONENTES
  // --------------------------------------------------
  components: {
    MuiStepConnector: {
      styleOverrides: {
        root: {
          // top: 20,
          // left: 'calc(-50% + 20px)',
          // right: 'calc(50% + 20px)',
        },
        line: {
          height: 3,
          border: 0,
          backgroundColor: '#424242', // Color inactivo para fondo oscuro
          borderRadius: 1,
        },
        // --- Estilos condicionales (usando la importación) ---
        // Aplica degradado si el conector tiene la clase 'active' o 'completed'
        [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}`]: {
          background: 'linear-gradient(90deg, #FF7F00 0%, #ff9c39 100%)',
        },
        [`&.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]: {
          background: 'linear-gradient(90deg, #FF7F00 0%, #ff9c39 100%)',
        },
      }
    },
    // ... (otros componentes como MuiButton, MuiTextField, etc.) ...
      MuiButton: {
        defaultProps: {
          // disableElevation: true,
          // variant: 'contained',
        },
        styleOverrides: {
          root: {
            // textTransform: 'none',
            // borderRadius: '20px',
          },
        },
      },
      MuiTextField: {
        defaultProps: {
         // variant: 'outlined',
         // margin: 'normal',
        },
      },
      // ... (Ejemplos comentados para MuiStepLabel, MuiStepIcon) ...
  }
});

export default theme;