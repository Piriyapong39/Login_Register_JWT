import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';

function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary">
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}


const handleLogout = (event) => {
  event.preventDefault();
  localStorage.removeItem('token');
  window.location = "/login"
}

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

export default function StickyFooter() {
  const [authStatus, setAuthStatus] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch("http://localhost:3333/authen", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          }
        });
        const result = await response.json();
        if (result.status === "ok") {
          setAuthStatus("success");
          // alert("Authen success");
        } else {
          setAuthStatus("failed");
          // alert("Authen Failed");
          localStorage.removeItem('token');
          window.location = "/login"
        }
      } catch (error) {
        console.error("Error:", error);
        setAuthStatus("failed");
      }
    };
    fetchData();
  }, []);
  return (
    <ThemeProvider theme={defaultTheme}>
      <Button variant="contained" onClick={handleLogout} style={{position: 'fixed',top: '10px',right: '10px'}}>Logout</Button>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <CssBaseline />
        <Container component="main" sx={{ mt: 8, mb: 2 }} maxWidth="sm">
          <Typography variant="h2" component="h1" gutterBottom>
            Homepage
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom>
            {'Hi USER'}
          </Typography>
          <Typography variant="body1">สวัสดีจ้า</Typography>
        </Container>
        <Box
          component="footer"
          sx={{
            py: 3,
            px: 2,
            mt: 'auto',
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[200]
                : theme.palette.grey[800],
          }}
        >
          <Container maxWidth="sm">
            <Typography variant="body1">
              Project Login-Register-jwt
            </Typography>
            <Copyright />
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}





