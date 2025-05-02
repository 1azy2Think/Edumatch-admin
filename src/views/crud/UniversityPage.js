import React, { useState, useEffect } from 'react';
import {
  Grid,
  Button,
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
  Typography,
  Chip,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  IconEdit,
  IconTrash,
  IconPlus,
  IconSearch
} from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import { collection, getDocs, doc, setDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';

const UniversityPage = () => {
  // State management
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUniversity, setCurrentUniversity] = useState({
    name: '',
    state: '', // Changed from country to state
    address: '', // Added address field
    website: '',
    coursesCount: 0,
    scholarshipsCount: 0
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Extract state from address
  const extractStateFromAddress = (address) => {
    if (!address) return '';
    
    // Try to find state in the address (assuming format like "City, State, Malaysia")
    const parts = address.split(',').map(part => part.trim());
    
    // Look for common Malaysian states in the address
    const malaysianStates = [
      'Selangor', 'Kuala Lumpur', 'Penang', 'Johor', 'Perak', 
      'Sabah', 'Sarawak', 'Melaka', 'Negeri Sembilan', 'Kedah', 
      'Pahang', 'Terengganu', 'Kelantan', 'Perlis', 'Labuan', 'Putrajaya'
    ];
    
    for (const part of parts) {
      for (const state of malaysianStates) {
        if (part.includes(state)) {
          return state;
        }
      }
    }
    
    // If we can't find a specific state, return the second-to-last part (often the state)
    if (parts.length >= 2) {
      return parts[parts.length - 2];
    }
    
    return '';
  };

  // Fetch universities on component mount
  useEffect(() => {
    fetchUniversities();
  }, []);

  // Fetch universities from Firestore
  const fetchUniversities = async () => {
    try {
      setLoading(true);
      
      // Fetch universities
      const universitiesSnapshot = await getDocs(collection(db, 'universities'));
      
      // Fetch courses and scholarships to count them per university
      const coursesSnapshot = await getDocs(collection(db, 'courses'));
      const scholarshipsSnapshot = await getDocs(collection(db, 'scholarships'));
      
      // Create maps to count courses and scholarships per university
      const courseCounts = {};
      const scholarshipCounts = {};
      
      // Count courses per university
      coursesSnapshot.docs.forEach(doc => {
        const course = doc.data();
        const uniId = course.university_id;
        if (uniId) {
          courseCounts[uniId] = (courseCounts[uniId] || 0) + 1;
        }
      });
      
      // Count scholarships per university
      scholarshipsSnapshot.docs.forEach(doc => {
        const scholarship = doc.data();
        const uniId = scholarship.university_id;
        if (uniId) {
          scholarshipCounts[uniId] = (scholarshipCounts[uniId] || 0) + 1;
        }
      });
      
      const universitiesList = universitiesSnapshot.docs.map(doc => {
        const data = doc.data();
        let address = '';
        let state = '';
        
        // Extract address and state from the data
        if (data.location && data.location.address) {
          address = data.location.address;
          state = extractStateFromAddress(address);
        } else if (data.contact_info && data.contact_info.address) {
          address = data.contact_info.address;
          state = extractStateFromAddress(address);
        }
        
        // Get course and scholarship counts
        const coursesCount = courseCounts[doc.id] || data.coursesCount || 0;
        const scholarshipsCount = scholarshipCounts[doc.id] || data.scholarshipsCount || 0;
        
        return {
          id: doc.id,
          ...data,
          address,
          state,
          coursesCount,
          scholarshipsCount
        };
      });
      
      setUniversities(universitiesList);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching universities:', err);
      setError('Failed to load universities. Please try again.');
      setLoading(false);
    }
  };

  // Open dialog for adding new university
  const handleAddNew = () => {
    setCurrentUniversity({
      name: '',
      state: '',
      address: '',
      website: '',
      coursesCount: 0,
      scholarshipsCount: 0
    });
    setDialogMode('add');
    setOpenDialog(true);
  };

  // Open dialog for editing university
  const handleEdit = (university) => {
    setCurrentUniversity({
      id: university.id,
      name: university.name || '',
      state: university.state || '',
      address: university.address || '',
      website: university.website || '',
      coursesCount: university.coursesCount || 0,
      scholarshipsCount: university.scholarshipsCount || 0
    });
    setDialogMode('edit');
    setOpenDialog(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // If address changes, extract state
    if (name === 'address') {
      const state = extractStateFromAddress(value);
      setCurrentUniversity({
        ...currentUniversity,
        address: value,
        state: state
      });
    } else {
      setCurrentUniversity({
        ...currentUniversity,
        [name]: value
      });
    }
  };

  // Save university (add or update)
  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Prepare data for saving
      const { id, state, coursesCount, scholarshipsCount, ...universityData } = currentUniversity;
      
      // Create location object if address exists
      if (currentUniversity.address) {
        universityData.location = {
          address: currentUniversity.address,
          coordinates: universityData.location?.coordinates || { lat: 0, lng: 0 }
        };
      }
      
      if (dialogMode === 'add') {
        // Add new university
        await addDoc(collection(db, 'universities'), universityData);
        setSnackbar({
          open: true,
          message: 'University added successfully!',
          severity: 'success'
        });
      } else {
        // Update existing university
        const universityRef = doc(db, 'universities', id);
        await setDoc(universityRef, universityData, { merge: true });
        setSnackbar({
          open: true,
          message: 'University updated successfully!',
          severity: 'success'
        });
      }
      
      setOpenDialog(false);
      fetchUniversities();
    } catch (err) {
      console.error('Error saving university:', err);
      setSnackbar({
        open: true,
        message: `Error: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete university
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this university?')) {
      try {
        setLoading(true);
        await deleteDoc(doc(db, 'universities', id));
        setSnackbar({
          open: true,
          message: 'University deleted successfully!',
          severity: 'success'
        });
        fetchUniversities();
      } catch (err) {
        console.error('Error deleting university:', err);
        setSnackbar({
          open: true,
          message: `Error: ${err.message}`,
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Filter universities based on search term
  const filteredUniversities = universities.filter(university => 
    university.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    university.state?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get chip colors based on count
  const getCountColor = (count) => {
    if (count >= 10) return 'success';
    if (count >= 5) return 'primary';
    if (count >= 1) return 'info';
    return 'default';
  };

  return (
    <PageContainer title="University Management" description="Manage all universities">
      <DashboardCard title="Universities">
        <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <TextField
              size="small"
              placeholder="Search universities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: 300 }}
              InputProps={{
                startAdornment: <IconSearch size="20" style={{ marginRight: '8px' }} />,
              }}
            />
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<IconPlus size="18" />}
            onClick={handleAddNew}
          >
            Add University
          </Button>
        </Box>

        {loading && !openDialog ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table sx={{ minWidth: 650 }} aria-label="universities table">
              <TableHead>
                <TableRow>
                  <TableCell>University Name</TableCell>
                  <TableCell>State</TableCell>
                  <TableCell>Courses</TableCell>
                  <TableCell>Scholarships</TableCell>
                  <TableCell>Website</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUniversities.length > 0 ? (
                  filteredUniversities.map((university) => (
                    <TableRow key={university.id}>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {university.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{university.state || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={university.coursesCount || '0'}
                          size="small"
                          color={getCountColor(university.coursesCount)}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={university.scholarshipsCount || '0'}
                          size="small"
                          color={getCountColor(university.scholarshipsCount)}
                        />
                      </TableCell>
                      <TableCell>
                        {university.website ? (
                          <Typography variant="body2" sx={{ 
                            textDecoration: 'underline', 
                            color: 'primary.main',
                            cursor: 'pointer'
                          }} onClick={() => window.open(university.website, '_blank')}>
                            Visit Website
                          </Typography>
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          color="primary" 
                          size="small"
                          onClick={() => handleEdit(university)}
                        >
                          <IconEdit size="18" />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          size="small"
                          onClick={() => handleDelete(university.id)}
                        >
                          <IconTrash size="18" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="textSecondary" py={2}>
                        No universities found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DashboardCard>

      {/* Add/Edit University Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New University' : 'Edit University'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="University Name"
                name="name"
                value={currentUniversity.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={currentUniversity.address}
                onChange={handleInputChange}
                required
                helperText="State will be automatically extracted from address"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                name="state"
                value={currentUniversity.state}
                onChange={handleInputChange}
                disabled
                helperText="Auto-detected from address"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Website"
                name="website"
                value={currentUniversity.website}
                onChange={handleInputChange}
                placeholder="e.g. https://www.university.edu"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                Course & Scholarship Counts
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                These counts will be automatically updated when courses and scholarships are added or removed.
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ width: 120 }}>
                  Courses:
                </Typography>
                <Chip 
                  label={currentUniversity.coursesCount || '0'} 
                  size="small"
                  color={getCountColor(currentUniversity.coursesCount)}
                  sx={{ mr: 1 }}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ width: 120 }}>
                  Scholarships:
                </Typography>
                <Chip 
                  label={currentUniversity.scholarshipsCount || '0'} 
                  size="small"
                  color={getCountColor(currentUniversity.scholarshipsCount)}
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            color="primary"
            disabled={!currentUniversity.name || !currentUniversity.address}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default UniversityPage;