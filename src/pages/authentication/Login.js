import { useState } from 'react';

// material-ui
import { Grid, Stack, Typography, Snackbar, Button, Alert } from '@mui/material';

// project import
import AuthLogin from './auth-forms/AuthLogin';
import AuthWrapper from './AuthWrapper';

// ================================|| LOGIN ||================================ //

const Login = () => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [formMode, setFormMode] = useState('login'); // 'login' or 'newPassword'

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleNewPassword = () => {
    setSnackbarOpen(false);
    setFormMode(formMode === 'login' ? 'newPassword' : 'login');
  };

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">{formMode === 'login' ? 'Login' : 'Update Password'}</Typography>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <AuthLogin setSnackbarOpen={setSnackbarOpen} formMode={formMode} />
        </Grid>
      </Grid>
      <Snackbar open={snackbarOpen} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert
          onClose={handleSnackbarClose}
          severity={formMode === 'login' ? 'warning' : 'success'}
          action={
            <Button color="inherit" size="small" onClick={handleNewPassword}>
              {formMode === 'login' ? 'Set New Password' : 'Go To Login'}
            </Button>
          }
        >
          {formMode === 'login' ? 'Make a new password' : 'New password is set'}
        </Alert>
      </Snackbar>
    </AuthWrapper>
  );
};

export default Login;
