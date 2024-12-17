import React from 'react';
import { Container, Paper, Typography } from '@mui/material';
import { FeedbackForm } from '../components/FeedbackForm';

export const Feedback = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom
        sx={{ color: 'text.primary' }}
      >
        Feedback
      </Typography>
      <Paper 
        elevation={3} 
        sx={{ 
          mt: 2,
          bgcolor: 'background.paper',
          borderRadius: 2
        }}
      >
        <FeedbackForm />
      </Paper>
    </Container>
  );
};

export default Feedback;
