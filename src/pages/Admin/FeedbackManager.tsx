import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TablePagination,
  TextField,
  InputAdornment,
  SelectChangeEvent
} from '@mui/material';
import { Search, MessageCircle, AlertCircle, Lightbulb } from 'lucide-react';
import { getFeedback, updateFeedbackStatus, type FeedbackStatus } from '../../api/feedback';
import toast from 'react-hot-toast';

type FeedbackType = 'bug' | 'feature' | 'general';

interface Feedback {
  id: string;
  title: string;
  description: string;
  type: FeedbackType;
  status: FeedbackStatus;
  email: string;
  created_at: string;
  updated_at: string;
}

const statusColors = {
  new: 'info',
  in_progress: 'warning',
  resolved: 'success',
  closed: 'default'
} as const;

const typeIcons = {
  bug: AlertCircle,
  feature: Lightbulb,
  general: MessageCircle
} as const;

const FeedbackManager = () => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<FeedbackType | 'all'>('all');

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const data = await getFeedback();
      setFeedback(data);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleStatusChange = async (id: string, newStatus: FeedbackStatus) => {
    try {
      console.log('Changing status:', { id, newStatus });
      await updateFeedbackStatus(id, newStatus);
      console.log('Status updated, fetching feedback...');
      await fetchFeedback(); // Refresh the list after successful update
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'text.primary' }}>
        Feedback Management
      </Typography>

      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search feedback..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} />
              </InputAdornment>
            ),
          }}
        />

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e: SelectChangeEvent<FeedbackStatus | 'all'>) => setStatusFilter(e.target.value as FeedbackStatus | 'all')}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="new">New</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={typeFilter}
            label="Type"
            onChange={(e: SelectChangeEvent<FeedbackType | 'all'>) => setTypeFilter(e.target.value as FeedbackType | 'all')}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="bug">Bug</MenuItem>
            <MenuItem value="feature">Feature</MenuItem>
            <MenuItem value="general">General</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Loading...</TableCell>
              </TableRow>
            ) : filteredFeedback.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">No feedback found</TableCell>
              </TableRow>
            ) : (
              filteredFeedback
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item) => {
                  const TypeIcon = typeIcons[item.type];
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <IconButton size="small" sx={{ mr: 1 }}>
                          <TypeIcon size={20} />
                        </IconButton>
                        {item.type}
                      </TableCell>
                      <TableCell>{item.title}</TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Typography noWrap>{item.description}</Typography>
                      </TableCell>
                      <TableCell>{item.email}</TableCell>
                      <TableCell>
                        <FormControl size="small">
                          <Select
                            value={item.status}
                            onChange={(e) => handleStatusChange(item.id, e.target.value as FeedbackStatus)}
                            sx={{ minWidth: 120 }}
                          >
                            <MenuItem value="new">New</MenuItem>
                            <MenuItem value="in_progress">In Progress</MenuItem>
                            <MenuItem value="resolved">Resolved</MenuItem>
                            <MenuItem value="closed">Closed</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        {new Date(item.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredFeedback.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
};

export default FeedbackManager;
