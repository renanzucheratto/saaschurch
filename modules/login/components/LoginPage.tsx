import { Box } from '@mui/material';
import { SignInForm } from './SignInForm';

export function LoginPage() {
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          px: { xs: 3, sm: 6, md: 8, lg: 12 },
          py: 4,
          maxWidth: { md: '50%', lg: '45%' },
        }}
      >
        

        <SignInForm />
      </Box>

      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          background: 'linear-gradient(180deg, #a855f7 0%, #6366f1 50%, #3b82f6 100%)',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          p: 4,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            opacity: 0.5,
          }}
        />

        
      </Box>
    </Box>
  );
}
