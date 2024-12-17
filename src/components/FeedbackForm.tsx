import React, { useState } from 'react';
import { Button, TextField, Box, Typography, MenuItem } from '@mui/material';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { submitFeedback } from '../api/feedback';

type FeedbackType = 'bug' | 'feature' | 'general';

export const FeedbackForm = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<FeedbackType>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to submit feedback');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await submitFeedback({
        title,
        description,
        type,
        userId: user.id,
        email: user.email || '',
      });

      toast.success('Thank you for your feedback!');
      // Reset form
      setTitle('');
      setDescription('');
      setType('general');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit} 
      sx={{ 
        maxWidth: 600, 
        mx: 'auto', 
        p: 3,
      }}
    >
      <Typography 
        variant="h5" 
        gutterBottom
        sx={{
          color: 'text.primary',
          mb: 3
        }}
      >
        Submit Feedback
      </Typography>

      <TextField
        select
        fullWidth
        label="Feedback Type"
        value={type}
        onChange={(e) => setType(e.target.value as FeedbackType)}
        margin="normal"
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'background.default',
            '& fieldset': {
              borderColor: 'divider',
            },
            '&:hover fieldset': {
              borderColor: 'primary.main',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'primary.main',
            },
          },
          '& .MuiInputLabel-root': {
            color: 'text.secondary',
          },
          '& .MuiSelect-select': {
            color: 'text.primary',
          },
          '& .MuiSvgIcon-root': {
            color: 'text.secondary',
          },
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              bgcolor: 'background.paper',
              '& .MuiMenuItem-root': {
                color: 'text.primary',
              },
            },
          },
        }}
      >
        <MenuItem value="bug">Bug Report</MenuItem>
        <MenuItem value="feature">Feature Request</MenuItem>
        <MenuItem value="general">General Feedback</MenuItem>
      </TextField>

      <TextField
        fullWidth
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        margin="normal"
        required
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'background.default',
            '& fieldset': {
              borderColor: 'divider',
            },
            '&:hover fieldset': {
              borderColor: 'primary.main',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'primary.main',
            },
          },
          '& .MuiInputLabel-root': {
            color: 'text.secondary',
          },
          '& .MuiInputBase-input': {
            color: 'text.primary',
          },
        }}
      />

      <TextField
        fullWidth
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        margin="normal"
        required
        multiline
        rows={4}
        placeholder="Please describe your feedback in detail. For bug reports, include steps to reproduce the issue."
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'background.default',
            '& fieldset': {
              borderColor: 'divider',
            },
            '&:hover fieldset': {
              borderColor: 'primary.main',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'primary.main',
            },
          },
          '& .MuiInputLabel-root': {
            color: 'text.secondary',
          },
          '& .MuiInputBase-input': {
            color: 'text.primary',
          },
          '& .MuiInputBase-inputMultiline': {
            color: 'text.primary',
          },
        }}
      />

      <Button
        type="submit"
        variant="contained"
        disabled={isSubmitting}
        sx={{
          mt: 3,
          width: '100%',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          '&:hover': {
            bgcolor: 'primary.dark',
          },
        }}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
      </Button>
    </Box>
  );
};
