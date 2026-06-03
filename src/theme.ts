// =====================================================
//  Тема Material-UI: мятно-белая гамма + поддержка dark
// =====================================================
import { createTheme } from '@mui/material/styles';

export const mintTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4DB6AC',
      light: '#80CBC4',
      dark: '#00867D',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#26A69A',
      light: '#64D8CB',
      dark: '#00766C',
    },
    success: { main: '#27AE60' },
    warning: { main: '#F39C12' },
    error:   { main: '#E74C3C' },
    info:    { main: '#5C6BC0' },
    background: {
      default: '#F5F9F8',
      paper:   '#FFFFFF',
    },
    text: {
      primary:   '#1F3A37',
      secondary: '#5C7370',
    },
    divider: 'rgba(77, 182, 172, 0.18)',
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'Inter, "Segoe UI", Roboto, sans-serif',
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600, fontSize: '1.6rem' },
    h5: { fontWeight: 600, fontSize: '1.3rem' },
    h6: { fontWeight: 600, fontSize: '1.1rem' },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, padding: '8px 18px' },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(31, 58, 55, 0.06)',
          border: '1px solid rgba(77, 182, 172, 0.12)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#1F3A37',
          boxShadow: '0 1px 0 rgba(77, 182, 172, 0.18)',
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4DB6AC',
      light: '#80CBC4',
      dark: '#00867D',
    },
    secondary: {
      main: '#26A69A',
    },
    background: {
      default: '#0F1F1D',
      paper:   '#1A2D2A',
    },
    text: {
      primary:   '#E0F2F1',
      secondary: '#A8C5C2',
    },
    divider: 'rgba(77, 182, 172, 0.18)',
  },
  shape: { borderRadius: 12 },
  typography: mintTheme.typography,
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 10, padding: '8px 18px' } } },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1A2D2A',
          color: '#E0F2F1',
          boxShadow: '0 1px 0 rgba(77, 182, 172, 0.18)',
        },
      },
    },
  },
});
