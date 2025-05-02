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
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Card,
    CardContent,
    CardActions,
    Divider,
    Stack,
    Switch,
    FormControlLabel,
    Tooltip,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import {
    IconEdit,
    IconTrash,
    IconPlus,
    IconSearch,
    IconCalendar,
    IconCurrencyDollar,
    IconSchool,
    IconWorld,
    IconCheck,
    IconBookmark
} from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import { collection, getDocs, doc, setDoc, deleteDoc, addDoc, query, where, writeBatch } from 'firebase/firestore';
import { db } from '../../utils/firebase';

const ScholarshipPage = () => {
    // State management
    const [scholarships, setScholarships] = useState([]);
    const [universities, setUniversities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentScholarship, setCurrentScholarship] = useState({
        name: '',
        description: '',
        provider: '',
        amount: '',
        deadline: '',
        eligibility: '',
        university_id: '',
        is_active: true,
        created_at: new Date()
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch scholarships
                const scholarshipsSnapshot = await getDocs(collection(db, 'scholarships'));
                let scholarshipsList = scholarshipsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    // Ensure is_active has a default even if it's missing
                    is_active: doc.data().is_active !== undefined ? doc.data().is_active : true
                }));

                // Try to initialize the is_active field in the database
                await initializeActiveStatus();

                // Fetch universities
                const universitiesSnapshot = await getDocs(collection(db, 'universities'));
                const universitiesList = universitiesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setScholarships(scholarshipsList);
                setUniversities(universitiesList);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load data. Please try again.');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Open dialog for adding new scholarship
    const handleAddNew = () => {
        setCurrentScholarship({
            name: '',
            description: '',
            provider: '',
            amount: '',
            deadline: '',
            eligibility: '',
            university_id: '',
            is_active: true,
            created_at: new Date()
        });
        setDialogMode('add');
        setOpenDialog(true);
    };

    // Open dialog for editing scholarship
    const handleEdit = (scholarship) => {
        setCurrentScholarship({
          id: scholarship.id,
          name: scholarship.name || '',
          description: scholarship.criteria ? scholarship.criteria.join('\n') : '',
          provider: scholarship.university_name || '',
          amount: scholarship.value || '',
          deadline: scholarship.application_deadline || '',
          eligibility: scholarship.field_of_study ? scholarship.field_of_study.join(', ') : '',
          university_id: scholarship.university_id || '',
          is_active: scholarship.is_active !== undefined ? scholarship.is_active : true,
          created_at: scholarship.created_at || new Date(),
          
          original_criteria: scholarship.criteria || [],
          original_type: scholarship.type || [],
          original_applicable_course_levels: scholarship.applicable_course_levels || [],
          original_field_of_study: scholarship.field_of_study || [],
          original_location: scholarship.location || [],
          original_awards_details: scholarship.awards_details || {}
        });
        setDialogMode('edit');
        setOpenDialog(true);
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'amount') {
            setCurrentScholarship({
                ...currentScholarship,
                [name]: value === '' ? '' : parseFloat(value)
            });
        } else {
            setCurrentScholarship({
                ...currentScholarship,
                [name]: value
            });
        }
    };

    // Handle toggle changes
    const handleToggleChange = (e) => {
        setCurrentScholarship({
            ...currentScholarship,
            is_active: e.target.checked
        });
    };

    // Save scholarship (add or update)
    const handleSave = async () => {
        try {
            setLoading(true);

            // Get university name if university_id is provided
            let university_name = '';
            if (currentScholarship.university_id) {
                const universityRef = universities.find(u => u.id === currentScholarship.university_id);
                if (universityRef) {
                    university_name = universityRef.name;
                }
            }

            // Prepare scholarship data with the appropriate field mapping
            const scholarshipData = {
                name: currentScholarship.name,
                university_id: currentScholarship.university_id,
                university_name,
                criteria: currentScholarship.description ? currentScholarship.description.split('\n').filter(line => line.trim() !== '') : [],
                value: currentScholarship.amount,
                application_deadline: currentScholarship.deadline,
                is_active: currentScholarship.is_active,
                updated_at: new Date(),

                // Preserve original fields 
                type: currentScholarship.original_type || [],
                applicable_course_levels: currentScholarship.original_applicable_course_levels || [],
                field_of_study: currentScholarship.original_field_of_study || [],
                location: currentScholarship.original_location || [],
                awards_details: currentScholarship.original_awards_details || {}
            };

            if (dialogMode === 'add') {
                // Add new scholarship
                await addDoc(collection(db, 'scholarships'), scholarshipData);
                setSnackbar({
                    open: true,
                    message: 'Scholarship added successfully!',
                    severity: 'success'
                });
            } else {
                // Update existing scholarship
                const scholarshipRef = doc(db, 'scholarships', currentScholarship.id);
                const { id, original_criteria, original_type, original_applicable_course_levels,
                    original_field_of_study, original_location, original_awards_details,
                    ...scholarshipDataWithoutId } = scholarshipData;
                await setDoc(scholarshipRef, scholarshipDataWithoutId, { merge: true });
                setSnackbar({
                    open: true,
                    message: 'Scholarship updated successfully!',
                    severity: 'success'
                });
            }

            setOpenDialog(false);

            // Refresh scholarships
            const scholarshipsSnapshot = await getDocs(collection(db, 'scholarships'));
            const scholarshipsList = scholarshipsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setScholarships(scholarshipsList);
        } catch (err) {
            console.error('Error saving scholarship:', err);
            setSnackbar({
                open: true,
                message: `Error: ${err.message}`,
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // Delete scholarship
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this scholarship?')) {
            try {
                setLoading(true);
                await deleteDoc(doc(db, 'scholarships', id));
                setSnackbar({
                    open: true,
                    message: 'Scholarship deleted successfully!',
                    severity: 'success'
                });

                // Refresh scholarships
                const scholarshipsSnapshot = await getDocs(collection(db, 'scholarships'));
                const scholarshipsList = scholarshipsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setScholarships(scholarshipsList);
            } catch (err) {
                console.error('Error deleting scholarship:', err);
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

    // A function you could run once to ensure all scholarships have is_active field
    const initializeActiveStatus = async () => {
        try {
            const scholarshipsSnapshot = await getDocs(collection(db, 'scholarships'));

            // Create a writeBatch using the correct Firebase v9 syntax
            const batch = writeBatch(db);
            let updateCount = 0;

            scholarshipsSnapshot.docs.forEach(docSnapshot => {
                if (docSnapshot.data().is_active === undefined) {
                    console.log(`Setting is_active=true for scholarship: ${docSnapshot.id}`);
                    batch.update(docSnapshot.ref, { is_active: true });
                    updateCount++;
                }
            });

            if (updateCount > 0) {
                await batch.commit();
                console.log(`Updated is_active field for ${updateCount} scholarships`);
            } else {
                console.log('All scholarships already have is_active field');
            }
        } catch (err) {
            console.error('Error initializing active status:', err);
        }
    };

    // Toggle scholarship active status
    const handleToggleStatus = async (scholarship) => {
        try {
            setLoading(true);
            const scholarshipRef = doc(db, 'scholarships', scholarship.id);
            await setDoc(scholarshipRef, {
                is_active: !scholarship.is_active,
                updated_at: new Date()
            }, { merge: true });

            // Refresh scholarships
            const scholarshipsSnapshot = await getDocs(collection(db, 'scholarships'));
            const scholarshipsList = scholarshipsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setScholarships(scholarshipsList);

            setSnackbar({
                open: true,
                message: `Scholarship ${scholarship.is_active ? 'deactivated' : 'activated'} successfully!`,
                severity: 'success'
            });
        } catch (err) {
            console.error('Error toggling scholarship status:', err);
            setSnackbar({
                open: true,
                message: `Error: ${err.message}`,
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // Close snackbar
    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    // Filter scholarships based on search term and status filter
    const filteredScholarships = scholarships.filter(scholarship => {
        // Search term filter
        const matchesSearch =
            scholarship.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            scholarship.criteria?.some(criteria => criteria.toLowerCase().includes(searchTerm.toLowerCase())) ||
            scholarship.university_name?.toLowerCase().includes(searchTerm.toLowerCase());

        // Status filter
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && scholarship.is_active) ||
            (filterStatus === 'inactive' && !scholarship.is_active);

        return matchesSearch && matchesStatus;
    });

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'No deadline';

        try {
            // Check if it's a Firestore timestamp
            if (dateString._seconds) {
                return new Date(dateString._seconds * 1000).toLocaleDateString();
            }

            // Check if it's a regular date string
            return new Date(dateString).toLocaleDateString();
        } catch (err) {
            return dateString;
        }
    };

    // Get status color
    const getStatusColor = (isActive) => {
        return isActive ? 'success' : 'error';
    };

    return (
        <PageContainer title="Scholarship Management" description="Manage all scholarships">
            <DashboardCard title="Scholarships">
                <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={2}>
                        <TextField
                            size="small"
                            placeholder="Search scholarships..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{ width: 300 }}
                            InputProps={{
                                startAdornment: <IconSearch size="20" style={{ marginRight: '8px' }} />,
                            }}
                        />

                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel id="status-filter-label">Status</InputLabel>
                            <Select
                                labelId="status-filter-label"
                                value={filterStatus}
                                label="Status"
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <MenuItem value="all">All Status</MenuItem>
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<IconPlus size="18" />}
                        onClick={handleAddNew}
                    >
                        Add Scholarship
                    </Button>
                </Box>

                {loading && !openDialog ? (
                    <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : (
                    <Grid container spacing={3}>
                        {filteredScholarships.length > 0 ? (
                            filteredScholarships.map((scholarship) => (
                                <Grid item xs={12} sm={6} md={4} key={scholarship.id}>
                                    <Card sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        borderTop: '4px solid',
                                        borderColor: scholarship.is_active ? 'success.main' : 'error.main'
                                    }}>
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                                <Typography variant="h6" gutterBottom>
                                                    {scholarship.name}
                                                </Typography>
                                                <Chip
                                                    label={scholarship.is_active ? 'Active' : 'Inactive'}
                                                    size="small"
                                                    color={getStatusColor(scholarship.is_active)}
                                                />
                                            </Box>

                                            <Stack spacing={2}>
                                                <Box display="flex" alignItems="center">
                                                    <IconWorld size="20" style={{ marginRight: '8px' }} />
                                                    <Typography variant="body2">
                                                        <b>University:</b> {scholarship.university_name || 'Any university'}
                                                    </Typography>
                                                </Box>

                                                <Box display="flex" alignItems="center">
                                                    <IconCurrencyDollar size="20" style={{ marginRight: '8px' }} />
                                                    <Typography variant="body2">
                                                        <b>Amount:</b> {scholarship.value ? `RM ${scholarship.value}` : 'Not specified'}
                                                    </Typography>
                                                </Box>

                                                <Box display="flex" alignItems="center">
                                                    <IconCalendar size="20" style={{ marginRight: '8px' }} />
                                                    <Typography variant="body2">
                                                        <b>Deadline:</b> {formatDate(scholarship.application_deadline)}
                                                    </Typography>
                                                </Box>

                                                {scholarship.applicable_course_levels && scholarship.applicable_course_levels.length > 0 && (
                                                    <Box display="flex" alignItems="flex-start">
                                                        <IconSchool size="20" style={{ marginRight: '8px', marginTop: '3px' }} />
                                                        <Typography variant="body2">
                                                            <b>Applicable for:</b> {scholarship.applicable_course_levels.join(', ')}
                                                        </Typography>
                                                    </Box>
                                                )}

                                                {scholarship.field_of_study && scholarship.field_of_study.length > 0 && (
                                                    <Box display="flex" alignItems="flex-start">
                                                        <IconBookmark size="20" style={{ marginRight: '8px', marginTop: '3px' }} />
                                                        <Typography variant="body2">
                                                            <b>Field of Study:</b> {scholarship.field_of_study.join(', ')}
                                                        </Typography>
                                                    </Box>
                                                )}

                                                {/* Criteria Section */}
                                                {scholarship.criteria && scholarship.criteria.length > 0 && (
                                                    <Box mt={1}>
                                                        <Typography variant="subtitle2" gutterBottom>
                                                            Eligibility Criteria:
                                                        </Typography>
                                                        <List dense disablePadding>
                                                            {scholarship.criteria.map((criterion, index) => (
                                                                <ListItem key={index} disablePadding sx={{ mt: 0.5 }}>
                                                                    <ListItemIcon sx={{ minWidth: 24 }}>
                                                                        <IconCheck size="16" />
                                                                    </ListItemIcon>
                                                                    <ListItemText 
                                                                        primary={criterion} 
                                                                        primaryTypographyProps={{ 
                                                                            variant: 'body2',
                                                                            style: { margin: 0 }
                                                                        }} 
                                                                    />
                                                                </ListItem>
                                                            ))}
                                                        </List>
                                                    </Box>
                                                )}
                                            </Stack>
                                        </CardContent>

                                        <Divider />
                                        
                                        <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        size="small"
                                                        checked={scholarship.is_active}
                                                        onChange={() => handleToggleStatus(scholarship)}
                                                        color="success"
                                                    />
                                                }
                                                label={
                                                    <Typography variant="caption">
                                                        {scholarship.is_active ? 'Active' : 'Inactive'}
                                                    </Typography>
                                                }
                                            />

                                            <Box>
                                                <Tooltip title="Edit">
                                                    <IconButton
                                                        color="primary"
                                                        size="small"
                                                        onClick={() => handleEdit(scholarship)}
                                                    >
                                                        <IconEdit size="18" />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Delete">
                                                    <IconButton
                                                        color="error"
                                                        size="small"
                                                        onClick={() => handleDelete(scholarship.id)}
                                                    >
                                                        <IconTrash size="18" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))
                        ) : (
                            <Grid item xs={12}>
                                <Paper sx={{ p: 3, textAlign: 'center' }}>
                                    <Typography variant="body1" color="textSecondary">
                                        No scholarships found. Add a new scholarship to get started.
                                    </Typography>
                                </Paper>
                            </Grid>
                        )}
                    </Grid>
                )}

                {/* Add/Edit Scholarship Dialog */}
                <Dialog
                    open={openDialog}
                    onClose={() => setOpenDialog(false)}
                    fullWidth
                    maxWidth="md"
                >
                    <DialogTitle>
                        {dialogMode === 'add' ? 'Add New Scholarship' : 'Edit Scholarship'}
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ mt: 0.5 }}>
                            <Grid item xs={12} sm={8}>
                                <TextField
                                    fullWidth
                                    label="Scholarship Name"
                                    name="name"
                                    value={currentScholarship.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={currentScholarship.is_active}
                                            onChange={handleToggleChange}
                                            color="success"
                                        />
                                    }
                                    label="Active Status"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Criteria (one per line)"
                                    name="description"
                                    value={currentScholarship.description}
                                    onChange={handleInputChange}
                                    multiline
                                    rows={3}
                                    placeholder="Enter each criterion on a new line"
                                    helperText="Each line will be shown as a separate criterion point"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Provider"
                                    name="provider"
                                    value={currentScholarship.provider}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Ministry of Education"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel id="university-label">University</InputLabel>
                                    <Select
                                        labelId="university-label"
                                        name="university_id"
                                        value={currentScholarship.university_id}
                                        label="University"
                                        onChange={handleInputChange}
                                    >
                                        <MenuItem value="">Any University</MenuItem>
                                        {universities.map((university) => (
                                            <MenuItem key={university.id} value={university.id}>
                                                {university.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Amount (RM)"
                                    name="amount"
                                    value={currentScholarship.amount}
                                    onChange={handleInputChange}
                                    type="number"
                                    InputProps={{
                                        startAdornment: <InputLabel></InputLabel>,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Deadline"
                                    name="deadline"
                                    value={currentScholarship.deadline}
                                    onChange={handleInputChange}
                                    type="date"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Field of Study (comma separated)"
                                    name="eligibility"
                                    value={currentScholarship.eligibility}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Engineering, Computer Science, Business"
                                    helperText="Separate different fields with commas"
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                        <Button
                            onClick={handleSave}
                            variant="contained"
                            color="primary"
                            disabled={!currentScholarship.name}
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
            </DashboardCard>
        </PageContainer>
    );
};

export default ScholarshipPage;