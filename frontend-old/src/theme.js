import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2D9C8E',
      light: '#4DB6A9',
      dark: '#1A7A6E',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#F4845F',
      light: '#F9A58A',
      dark: '#D4623D',
      contrastText: '#ffffff',
    },
    success: {
      main: '#52B788',
    },
    warning: {
      main: '#F4A261',
    },
    error: {
      main: '#E76F51',
    },
    background: {
      default: '#F5F7F6',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1C2B2A',
      secondary: '#5C7A78',
    },
    divider: 'rgba(45,156,142,0.12)',
  },
  typography: {
    fontFamily: '"DM Sans", "Roboto", sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 600, letterSpacing: '-0.01em' },
    h4: { fontWeight: 600, letterSpacing: '-0.01em' },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 500 },
    body1: { lineHeight: 1.6 },
  },
  shape: { borderRadius: 14 },
  shadows: [
    'none',
    '0 1px 3px rgba(28,43,42,0.06)',
    '0 2px 8px rgba(28,43,42,0.08)',
    '0 4px 16px rgba(28,43,42,0.10)',
    '0 8px 24px rgba(28,43,42,0.12)',
    '0 12px 32px rgba(28,43,42,0.14)',
    ...Array(19).fill('none'),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #F5F7F6; }
        ::-webkit-scrollbar-thumb { background: #C5D9D7; border-radius: 3px; }
      `,
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '9px 22px',
          fontWeight: 500,
          fontSize: '0.875rem',
        },
        contained: {
          boxShadow: '0 2px 8px rgba(45,156,142,0.25)',
          '&:hover': { boxShadow: '0 4px 16px rgba(45,156,142,0.35)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(28,43,42,0.07)',
          border: '1px solid rgba(45,156,142,0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(28,43,42,0.07)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            '& fieldset': { borderColor: 'rgba(45,156,142,0.2)' },
            '&:hover fieldset': { borderColor: 'rgba(45,156,142,0.4)' },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 500 },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 4, height: 6, backgroundColor: 'rgba(45,156,142,0.12)' },
        bar: { borderRadius: 4 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: '0 1px 0 rgba(45,156,142,0.12)' },
      },
    },
  },
});

export default theme;
