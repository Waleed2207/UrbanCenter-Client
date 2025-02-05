import { ThemeProvider, createTheme } from '@mui/material/styles';

const ThemeCustomization = ({ children }) => {
  const theme = createTheme({
    palette: {
      primary: { main: '#1976d2' },
      secondary: { main: '#dc004e' },
    },
  });

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default ThemeCustomization;
