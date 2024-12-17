import { createTheme } from '@mui/material/styles';

// Create theme instances for light and dark modes
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1b1e',
      secondary: '#6c757d',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#1a1b1e',
      paper: '#2b2c30',
    },
    text: {
      primary: '#ffffff',
      secondary: '#adb5bd',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
});
