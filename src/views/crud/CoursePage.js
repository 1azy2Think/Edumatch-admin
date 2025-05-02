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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Card,
  CardContent,
  Avatar,
  Rating,
  InputAdornment,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  IconEdit,
  IconTrash,
  IconPlus,
  IconSearch,
  IconFilter,
  IconSortAscending,
  IconEye,
  IconCalendar,
  IconClock,
  IconCoin,
  IconSchool,
  IconCategory,
  IconListDetails,
  IconX
} from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import { collection, getDocs, doc, setDoc, deleteDoc, addDoc, query, where, getDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';

// Define getLevelColor function to fix the missing function error
const getLevelColor = (level) => {
  switch (level) {
    case 'Foundation':
      return 'info';
    case 'Diploma':
      return 'success';
    case 'Degree':
      return 'primary';
    case 'Masters':
      return 'warning';
    case 'PhD':
      return 'error';
    default:
      return 'default';
  }
};

const CoursePage = () => {
  // State management
  const [courses, setCourses] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [activeTab, setActiveTab] = useState(0);
  const [currentCourse, setCurrentCourse] = useState({
    name: '',
    description: '',
    level: '',
    duration: '',
    total_fee: '',
    university_id: '',
    primary_category: '',
    intakes: [],
    created_at: new Date()
  });
  const [viewCourse, setViewCourse] = useState(null);
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
        
        // Fetch courses
        const coursesSnapshot = await getDocs(collection(db, 'courses'));
        const coursesList = coursesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCourses(coursesList);
        
        // Fetch universities
        const universitiesSnapshot = await getDocs(collection(db, 'universities'));
        const universitiesList = universitiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUniversities(universitiesList);
        
        // Fetch categories
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        const categoriesList = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCategories(categoriesList);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Open dialog for adding new course
  const handleAddNew = () => {
    try {
      setCurrentCourse({
        name: '',
        description: '',
        level: '',
        duration: '',
        total_fee: '',
        university_id: '',
        primary_category: '',
        intakes: [],
        created_at: new Date()
      });
      setDialogMode('add');
      setOpenDialog(true);
    } catch (err) {
      console.error('Error opening add dialog:', err);
      setSnackbar({
        open: true,
        message: `Error: ${err.message}`,
        severity: 'error'
      });
    }
  };

  // Open dialog for editing course
  const handleEdit = (course) => {
    try {
      if (!course) {
        throw new Error('Course data is invalid');
      }
      
      setCurrentCourse({
        id: course.id,
        name: course.name || '',
        description: course.description || '',
        level: course.level || '',
        duration: course.duration || '',
        total_fee: course.total_fee || '',
        university_id: course.university_id || '',
        primary_category: course.primary_category || '',
        intakes: course.intakes || [],
        created_at: course.created_at || new Date()
      });
      setDialogMode('edit');
      setOpenDialog(true);
    } catch (err) {
      console.error('Error opening edit dialog:', err);
      setSnackbar({
        open: true,
        message: `Error: ${err.message}`,
        severity: 'error'
      });
    }
  };

  // Handle view course details
  const handleViewCourse = async (course) => {
    try {
      setLoading(true);
      
      // Get the full course details if needed
      // You can fetch additional data here if required
      
      setViewCourse(course);
      setOpenViewDialog(true);
    } catch (err) {
      console.error('Error fetching course details:', err);
      setSnackbar({
        open: true,
        message: `Error: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle numeric conversion for total_fee
    if (name === 'total_fee') {
      setCurrentCourse({
        ...currentCourse,
        [name]: value === '' ? '' : parseFloat(value)
      });
    } else {
      setCurrentCourse({
        ...currentCourse,
        [name]: value
      });
    }
  };

  // Handle intakes input (comma separated)
  const handleIntakesChange = (e) => {
    const value = e.target.value;
    const intakes = value.split(',').map(item => item.trim()).filter(item => item !== '');
    setCurrentCourse({
      ...currentCourse,
      intakes
    });
  };

  // Handle fee breakdown changes
  const handleFeeBreakdownChange = (feeType, value) => {
    setCurrentCourse({
      ...currentCourse,
      fee_breakdown: {
        ...(currentCourse.fee_breakdown || {}),
        [feeType]: value === '' ? '' : parseFloat(value)
      }
    });
  };

  // Handle entry requirements changes
  const handleEntryRequirementChange = (examType, field, value) => {
    const updatedRequirements = {
      ...(currentCourse.entry_requirements || {})
    };
    
    if (!updatedRequirements[examType]) {
      updatedRequirements[examType] = {};
    }
    
    if (field === 'min_cgpa') {
      updatedRequirements[examType].min_cgpa = value === '' ? '' : parseFloat(value);
    } else if (field === 'required_subjects') {
      // This is just a simple implementation - might need more complex UI for full requirements
      updatedRequirements[examType].required_subjects = [
        { min_grade: value.grade, count: parseInt(value.count) }
      ];
    }
    
    setCurrentCourse({
      ...currentCourse,
      entry_requirements: updatedRequirements
    });
  };

  // Handle subject changes
  const handleSubjectChange = (year, index, value) => {
    const updatedSubjects = {
      ...(currentCourse.subjects || {})
    };
    
    if (!updatedSubjects[year]) {
      updatedSubjects[year] = [];
    }
    
    // Create a copy of the subjects array for the year
    const yearSubjects = [...updatedSubjects[year]];
    
    // Update the subject at the specific index
    if (index >= yearSubjects.length) {
      yearSubjects.push(value);
    } else {
      yearSubjects[index] = value;
    }
    
    // Filter out empty subjects
    const filteredSubjects = yearSubjects.filter(subject => subject.trim() !== '');
    
    updatedSubjects[year] = filteredSubjects;
    
    setCurrentCourse({
      ...currentCourse,
      subjects: updatedSubjects
    });
  };

  // Add a new subject field for a year
  const addSubjectField = (year) => {
    const updatedSubjects = {
      ...(currentCourse.subjects || {})
    };
    
    if (!updatedSubjects[year]) {
      updatedSubjects[year] = [];
    }
    
    updatedSubjects[year].push('');
    
    setCurrentCourse({
      ...currentCourse,
      subjects: updatedSubjects
    });
  };

  // Remove a subject field
  const removeSubjectField = (year, index) => {
    const updatedSubjects = {
      ...(currentCourse.subjects || {})
    };
    
    if (updatedSubjects[year] && updatedSubjects[year].length > index) {
      updatedSubjects[year].splice(index, 1);
      
      // If no subjects left for this year, remove the year
      if (updatedSubjects[year].length === 0) {
        delete updatedSubjects[year];
      }
      
      setCurrentCourse({
        ...currentCourse,
        subjects: updatedSubjects
      });
    }
  };

  // Add a new year to subjects
  const addSubjectYear = () => {
    // Find a unique year name if Year 1, Year 2, etc. are taken
    const existingYears = currentCourse.subjects ? Object.keys(currentCourse.subjects) : [];
    let yearNum = 1;
    let yearName = `Year ${yearNum}`;
    
    while (existingYears.includes(yearName)) {
      yearNum++;
      yearName = `Year ${yearNum}`;
    }
    
    const updatedSubjects = {
      ...(currentCourse.subjects || {}),
      [yearName]: ['']
    };
    
    setCurrentCourse({
      ...currentCourse,
      subjects: updatedSubjects
    });
  };

  // Save course (add or update)
  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Get university name for display
      let university_name = '';
      if (currentCourse.university_id) {
        const universityDoc = await getDoc(doc(db, 'universities', currentCourse.university_id));
        if (universityDoc.exists()) {
          university_name = universityDoc.data().name;
        }
      }
      
      const courseData = {
        ...currentCourse,
        university_name,
        updated_at: new Date()
      };
      
      if (dialogMode === 'add') {
        // Add new course
        await addDoc(collection(db, 'courses'), courseData);
        setSnackbar({
          open: true,
          message: 'Course added successfully!',
          severity: 'success'
        });
      } else {
        // Update existing course
        const courseRef = doc(db, 'courses', currentCourse.id);
        const { id, ...courseDataWithoutId } = courseData;
        await setDoc(courseRef, courseDataWithoutId, { merge: true });
        setSnackbar({
          open: true,
          message: 'Course updated successfully!',
          severity: 'success'
        });
      }
      
      setOpenDialog(false);
      
      // Refresh courses
      const coursesSnapshot = await getDocs(collection(db, 'courses'));
      const coursesList = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCourses(coursesList);
    } catch (err) {
      console.error('Error saving course:', err);
      setSnackbar({
        open: true,
        message: `Error: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete course
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        setLoading(true);
        await deleteDoc(doc(db, 'courses', id));
        setSnackbar({
          open: true,
          message: 'Course deleted successfully!',
          severity: 'success'
        });
        
        // Refresh courses
        const coursesSnapshot = await getDocs(collection(db, 'courses'));
        const coursesList = coursesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCourses(coursesList);
      } catch (err) {
        console.error('Error deleting course:', err);
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

  // Filter courses based on search term and filters
  const filteredCourses = courses.filter(course => {
    // Search term filter
    const matchesSearch = 
      course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.university_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = 
      filterCategory === 'all' || 
      course.primary_category === filterCategory;
    
    // Level filter
    const matchesLevel = 
      filterLevel === 'all' || 
      course.level === filterLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  // Get unique course levels
  const courseLevels = [...new Set(courses.map(course => course.level).filter(Boolean))];

  // Generate color for card background
  const getColorBackground = (index) => {
    const colors = ['#2196f3', '#4caf50', '#f44336', '#ff9800'];
    return colors[index % colors.length];
  };

  // Format year data from subject object
  const formatSubjectsData = (subjects) => {
    if (!subjects) return [];
    
    return Object.entries(subjects).map(([year, subjectList]) => ({
      year,
      subjects: subjectList
    }));
  };

  // Format entry requirements
  const formatEntryRequirements = (requirements) => {
    if (!requirements) return [];
    
    return Object.entries(requirements).map(([examType, details]) => ({
      examType,
      details
    }));
  };

  // Helper function to calculate total from fee components
  const calculateTotalFeeComponents = () => {
    if (!currentCourse.fee_breakdown) return 0;
    
    return Object.values(currentCourse.fee_breakdown).reduce((sum, value) => {
      const numValue = parseFloat(value) || 0;
      return sum + numValue;
    }, 0);
  };

  // Helper functions to get entry requirement details
  const getRequiredSubjectGrade = (examType) => {
    if (!currentCourse.entry_requirements || 
        !currentCourse.entry_requirements[examType] || 
        !currentCourse.entry_requirements[examType].required_subjects ||
        !currentCourse.entry_requirements[examType].required_subjects[0]) {
      return '';
    }
    
    return currentCourse.entry_requirements[examType].required_subjects[0].min_grade || '';
  };
  
  const getRequiredSubjectCount = (examType) => {
    if (!currentCourse.entry_requirements || 
        !currentCourse.entry_requirements[examType] || 
        !currentCourse.entry_requirements[examType].required_subjects ||
        !currentCourse.entry_requirements[examType].required_subjects[0]) {
      return '';
    }
    
    return currentCourse.entry_requirements[examType].required_subjects[0].count || '';
  };

  return (
    <PageContainer title="Course Management" description="Manage all courses">
      <DashboardCard title="Courses">
        <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <TextField
              size="small"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: 300 }}
              InputProps={{
                startAdornment: <IconSearch size="20" style={{ marginRight: '8px' }} />,
              }}
            />
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                labelId="category-filter-label"
                value={filterCategory}
                label="Category"
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.name}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="level-filter-label">Level</InputLabel>
              <Select
                labelId="level-filter-label"
                value={filterLevel}
                label="Level"
                onChange={(e) => setFilterLevel(e.target.value)}
              >
                <MenuItem value="all">All Levels</MenuItem>
                {courseLevels.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <Box display="flex" alignItems="center" gap={2}>
            <Tabs
              value={viewMode}
              onChange={(e, newValue) => setViewMode(newValue)}
              aria-label="view mode tabs"
            >
              <Tab value="table" icon={<IconFilter size="18" />} />
              <Tab value="grid" icon={<IconSortAscending size="18" />} />
            </Tabs>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<IconPlus size="18" />}
              onClick={handleAddNew}
            >
              Add Course
            </Button>
          </Box>
        </Box>

        {loading && !openDialog && !openViewDialog ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            {viewMode === 'table' ? (
              <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                <Table sx={{ minWidth: 650 }} aria-label="courses table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Course Name</TableCell>
                      <TableCell>University</TableCell>
                      <TableCell>Level</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Fees</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCourses.length > 0 ? (
                      filteredCourses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {course.name}
                            </Typography>
                            {course.description && (
                              <Typography 
                                variant="body2" 
                                color="textSecondary"
                                sx={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                }}
                              >
                                {course.description}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>{course.university_name || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip
                              label={course.level || 'N/A'}
                              size="small"
                              color={getLevelColor(course.level)}
                            />
                          </TableCell>
                          <TableCell>{course.duration || 'N/A'}</TableCell>
                          <TableCell>
                            {course.total_fee !== undefined && course.total_fee !== null
                              ? `RM ${course.total_fee.toLocaleString()}`
                              : 'N/A'}
                          </TableCell>
                          <TableCell>{course.primary_category || 'N/A'}</TableCell>
                          <TableCell>
                            <IconButton
                              color="info"
                              size="small"
                              onClick={() => handleViewCourse(course)}
                            >
                              <IconEye size="18" />
                            </IconButton>
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => handleEdit(course)}
                            >
                              <IconEdit size="18" />
                            </IconButton>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleDelete(course.id)}
                            >
                              <IconTrash size="18" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography variant="body2" color="textSecondary" py={2}>
                            No courses found.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Grid container spacing={3}>
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={course.id}>
                      <Card sx={{ height: '100%' }}>
                        <Box sx={{ position: 'relative' }}>
                          {/* Colored box instead of placeholder image */}
                          <Box
                            sx={{
                              width: '100%',
                              height: '140px',
                              backgroundColor: getColorBackground(index),
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              color: '#ffffff',
                              fontWeight: 'bold'
                            }}
                          >
                            {course.primary_category || 'Course'}
                          </Box>
                          <Chip
                            label={course.level || 'N/A'}
                            size="small"
                            color={getLevelColor(course.level)}
                            sx={{
                              position: 'absolute',
                              top: '10px',
                              left: '10px',
                            }}
                          />
                        </Box>
                        <CardContent>
                          <Typography variant="h6" gutterBottom noWrap>
                            {course.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            {course.university_name || 'Unknown University'}
                          </Typography>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                            <Typography variant="h6">
                              RM{(course.total_fee || 0).toLocaleString()}
                            </Typography>
                            <Typography color="textSecondary" variant="caption">
                              {course.duration || 'Unknown duration'}
                            </Typography>
                          </Box>
                          <Box mt={1} display="flex" justifyContent="space-between">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => handleViewCourse(course)}
                            >
                              <IconEye size="16" />
                            </IconButton>
                            <Box>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEdit(course)}
                              >
                                <IconEdit size="16" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(course.id)}
                              >
                                <IconTrash size="16" />
                              </IconButton>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Typography align="center" color="textSecondary">
                      No courses available to display.
                    </Typography>
                  </Grid>
                )}
              </Grid>
            )}
          </>
        )}

        {/* View Course Dialog */}
        <Dialog
          open={openViewDialog}
          onClose={() => setOpenViewDialog(false)}
          fullWidth
          maxWidth="md"
        >
          {viewCourse && (
            <>
              <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Course Details</Typography>
                <IconButton onClick={() => setOpenViewDialog(false)}>
                  <IconX size="18" />
                </IconButton>
              </DialogTitle>
              <DialogContent>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ 
                    height: '100px', 
                    backgroundColor: getColorBackground(1),
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 1,
                    mb: 2
                  }}>
                    <Typography variant="h4" color="white">{viewCourse.primary_category || 'Course'}</Typography>
                  </Box>
                  
                  <Typography variant="h5" fontWeight={600}>{viewCourse.name}</Typography>
                  <Typography variant="subtitle1" color="primary" fontWeight={500}>
                    {viewCourse.university_name || 'Unknown University'}
                  </Typography>
                  
                  <Chip
                    label={viewCourse.level || 'N/A'}
                    size="small"
                    color={getLevelColor(viewCourse.level)}
                    sx={{ mt: 1 }}
                  />
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconCalendar size="20" style={{ marginRight: '8px', color: '#1976d2' }} />
                      <Typography variant="body2" fontWeight={500}>Intakes</Typography>
                    </Box>
                    <Typography variant="body1" sx={{ mt: 1, pl: 3.5 }}>
                      {viewCourse.intakes && viewCourse.intakes.length > 0 
                        ? viewCourse.intakes.join(', ') 
                        : 'No intake information'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconClock size="20" style={{ marginRight: '8px', color: '#1976d2' }} />
                      <Typography variant="body2" fontWeight={500}>Duration</Typography>
                    </Box>
                    <Typography variant="body1" sx={{ mt: 1, pl: 3.5 }}>
                      {viewCourse.duration || 'Not specified'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconCoin size="20" style={{ marginRight: '8px', color: '#1976d2' }} />
                      <Typography variant="body2" fontWeight={500}>Total Fee</Typography>
                    </Box>
                    <Typography variant="body1" sx={{ mt: 1, pl: 3.5 }}>
                      {viewCourse.total_fee !== undefined && viewCourse.total_fee !== null
                        ? `RM ${viewCourse.total_fee.toLocaleString()}`
                        : 'Not specified'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconCategory size="20" style={{ marginRight: '8px', color: '#1976d2' }} />
                      <Typography variant="body2" fontWeight={500}>Category</Typography>
                    </Box>
                    <Typography variant="body1" sx={{ mt: 1, pl: 3.5 }}>
                      {viewCourse.primary_category || 'Not categorized'}
                    </Typography>
                  </Grid>
                </Grid>
                
                {viewCourse.description && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>Description</Typography>
                    <Typography variant="body1">
                      {viewCourse.description}
                    </Typography>
                  </Box>
                )}
                
                {viewCourse.subjects && Object.keys(viewCourse.subjects).length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>Subjects</Typography>
                    <Grid container spacing={2}>
                      {formatSubjectsData(viewCourse.subjects).map((yearData, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Card variant="outlined" sx={{ height: '100%' }}>
                            <CardContent>
                              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                                {yearData.year}
                              </Typography>
                              <List dense disablePadding>
                                {yearData.subjects.map((subject, sIndex) => (
                                  <ListItem disablePadding key={sIndex} sx={{ py: 0.5 }}>
                                    <ListItemText 
                                      primary={subject} 
                                      primaryTypographyProps={{ variant: 'body2' }} 
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
                
                {viewCourse.entry_requirements && Object.keys(viewCourse.entry_requirements).length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>Entry Requirements</Typography>
                    <Grid container spacing={2}>
                      {formatEntryRequirements(viewCourse.entry_requirements).map((reqData, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                                {reqData.examType}
                              </Typography>
                              {reqData.details.min_cgpa && (
                                <Typography variant="body2">
                                  Minimum CGPA: {reqData.details.min_cgpa}
                                </Typography>
                              )}
                              {reqData.details.required_subjects && (
                                <Box sx={{ mt: 1 }}>
                                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                                    Required Subjects:
                                  </Typography>
                                  {reqData.details.required_subjects.map((subj, sIndex) => (
                                    <Typography key={sIndex} variant="body2" sx={{ pl: 2 }}>
                                      • {subj.count} subject(s) with minimum grade {subj.min_grade}
                                    </Typography>
                                  ))}
                                </Box>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
                
                {viewCourse.fee_breakdown && Object.keys(viewCourse.fee_breakdown).length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>Fee Breakdown</Typography>
                    <Card variant="outlined">
                      <List>
                        {Object.entries(viewCourse.fee_breakdown).map(([feeType, amount], index) => (
                          <ListItem 
                            key={index}
                            divider={index < Object.keys(viewCourse.fee_breakdown).length - 1}
                          >
                            <ListItemText 
                              primary={feeType.charAt(0).toUpperCase() + feeType.slice(1)} 
                              secondary={`RM ${parseFloat(amount).toLocaleString()}`}
                            />
                          </ListItem>
                        ))}
                        <ListItem sx={{ bgcolor: 'rgba(25, 118, 210, 0.08)' }}>
                          <ListItemText 
                            primary="Total" 
                            secondary={`RM ${viewCourse.total_fee ? viewCourse.total_fee.toLocaleString() : 0}`}
                            primaryTypographyProps={{ fontWeight: 'bold' }}
                            secondaryTypographyProps={{ fontWeight: 'bold' }}
                          />
                        </ListItem>
                      </List>
                    </Card>
                  </Box>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => {
                    setOpenViewDialog(false);
                    handleEdit(viewCourse);
                  }}
                >
                  Edit Course
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Add/Edit Course Dialog */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          fullWidth
          maxWidth="md"
          scroll="paper"
        >
          <DialogTitle>
            {dialogMode === 'add' ? 'Add New Course' : 'Edit Course'}
          </DialogTitle>
          <DialogContent dividers>
            <Box component="form" sx={{ mt: 1 }}>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab label="Basic Information" />
                <Tab label="Subjects" />
                <Tab label="Fees" />
                <Tab label="Entry Requirements" />
              </Tabs>

              {/* Basic Information Tab */}
              {activeTab === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={8}>
                    <TextField
                      fullWidth
                      label="Course Name"
                      name="name"
                      value={currentCourse.name}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel id="level-select-label">Level</InputLabel>
                      <Select
                        labelId="level-select-label"
                        name="level"
                        value={currentCourse.level}
                        label="Level"
                        onChange={handleInputChange}
                      >
                        <MenuItem value="">Select Level</MenuItem>
                        <MenuItem value="Foundation">Foundation</MenuItem>
                        <MenuItem value="Diploma">Diploma</MenuItem>
                        <MenuItem value="Degree">Degree</MenuItem>
                        <MenuItem value="Masters">Masters</MenuItem>
                        <MenuItem value="PhD">PhD</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      name="description"
                      value={currentCourse.description}
                      onChange={handleInputChange}
                      multiline
                      rows={3}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="university-select-label">University</InputLabel>
                      <Select
                        labelId="university-select-label"
                        name="university_id"
                        value={currentCourse.university_id}
                        label="University"
                        onChange={handleInputChange}
                      >
                        <MenuItem value="">Select University</MenuItem>
                        {universities.map((university) => (
                          <MenuItem key={university.id} value={university.id}>
                            {university.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="category-select-label">Category</InputLabel>
                      <Select
                        labelId="category-select-label"
                        name="primary_category"
                        value={currentCourse.primary_category}
                        label="Category"
                        onChange={handleInputChange}
                      >
                        <MenuItem value="">Select Category</MenuItem>
                        {categories.map((category) => (
                          <MenuItem key={category.id} value={category.name}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Duration"
                      name="duration"
                      value={currentCourse.duration}
                      onChange={handleInputChange}
                      placeholder="e.g. 3 years, 2 semesters"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Intake Months (comma separated)"
                      name="intakes"
                      value={currentCourse.intakes?.join(', ') || ''}
                      onChange={handleIntakesChange}
                      placeholder="e.g. Jan, Mar, Sep"
                      helperText="Enter month names separated by commas"
                    />
                  </Grid>
                </Grid>
              )}
              
              {/* Subjects Tab */}
              {activeTab === 1 && (
                <>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1">Course Subjects</Typography>
                    <Button
                      size="small"
                      startIcon={<IconPlus size={16} />}
                      onClick={addSubjectYear}
                    >
                      Add Year
                    </Button>
                  </Box>
                  
                  {currentCourse.subjects && Object.keys(currentCourse.subjects).length > 0 ? (
                    Object.entries(currentCourse.subjects).map(([year, subjects]) => (
                      <Card key={year} variant="outlined" sx={{ mb: 3 }}>
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="subtitle1">{year}</Typography>
                            <Button
                              size="small"
                              startIcon={<IconPlus size={16} />}
                              onClick={() => addSubjectField(year)}
                            >
                              Add Subject
                            </Button>
                          </Box>
                          
                          {subjects.map((subject, index) => (
                            <Box key={index} display="flex" alignItems="center" mb={1}>
                              <TextField
                                fullWidth
                                size="small"
                                label={`Subject ${index + 1}`}
                                value={subject}
                                onChange={(e) => handleSubjectChange(year, index, e.target.value)}
                              />
                              <IconButton 
                                color="error" 
                                onClick={() => removeSubjectField(year, index)}
                                sx={{ ml: 1 }}
                              >
                                <IconTrash size={18} />
                              </IconButton>
                            </Box>
                          ))}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Box textAlign="center" py={4}>
                      <Typography color="textSecondary" mb={2}>No subjects added yet</Typography>
                      <Button
                        variant="outlined"
                        startIcon={<IconPlus size={18} />}
                        onClick={addSubjectYear}
                      >
                        Add Year 1
                      </Button>
                    </Box>
                  )}
                </>
              )}
              
              {/* Fees Tab */}
              {activeTab === 2 && (
                <>
                  <Typography variant="subtitle1" gutterBottom>Total Fee</Typography>
                  <TextField
                    fullWidth
                    label="Total Fee (RM)"
                    name="total_fee"
                    value={currentCourse.total_fee}
                    onChange={handleInputChange}
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">RM</InputAdornment>,
                    }}
                    sx={{ mb: 3 }}
                  />
                  
                  <Typography variant="subtitle1" gutterBottom>Fee Breakdown</Typography>
                  <Typography variant="body2" color="textSecondary" mb={2}>
                    Specify individual fee components (the sum should match the total fee)
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Registration Fee"
                        value={currentCourse.fee_breakdown?.registration || ''}
                        onChange={(e) => handleFeeBreakdownChange('registration', e.target.value)}
                        type="number"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">RM</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Tuition Fee"
                        value={currentCourse.fee_breakdown?.tuition || ''}
                        onChange={(e) => handleFeeBreakdownChange('tuition', e.target.value)}
                        type="number"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">RM</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Resource Fee"
                        value={currentCourse.fee_breakdown?.resources || ''}
                        onChange={(e) => handleFeeBreakdownChange('resources', e.target.value)}
                        type="number"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">RM</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Other Fees"
                        value={currentCourse.fee_breakdown?.other || ''}
                        onChange={(e) => handleFeeBreakdownChange('other', e.target.value)}
                        type="number"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">RM</InputAdornment>,
                        }}
                      />
                    </Grid>
                  </Grid>
                  
                  <Box mt={3} p={2} bgcolor="rgba(25, 118, 210, 0.08)" borderRadius={1}>
                    <Typography variant="subtitle2">Fee Calculation</Typography>
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Typography>Total Fee Components:</Typography>
                      <Typography fontWeight="bold">
                        RM {calculateTotalFeeComponents()}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Typography>Main Total Fee:</Typography>
                      <Typography fontWeight="bold">
                        RM {currentCourse.total_fee ? currentCourse.total_fee.toLocaleString() : 0}
                      </Typography>
                    </Box>
                    {currentCourse.total_fee !== calculateTotalFeeComponents() && (
                      <Typography color="error" variant="caption" mt={1}>
                        Note: The sum of fee components doesn't match the total fee
                      </Typography>
                    )}
                  </Box>
                </>
              )}
              
              {/* Entry Requirements Tab */}
              {activeTab === 3 && (
                <>
                  <Typography variant="subtitle1" gutterBottom>Entry Requirements</Typography>
                  <Typography variant="body2" color="textSecondary" mb={2}>
                    Specify the entry requirements for different education backgrounds
                  </Typography>
                  
                  <Grid container spacing={3}>
                    {/* A-Levels */}
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" mb={2}>A-Levels</Typography>
                          <Box mb={2}>
                            <Typography variant="body2" mb={1}>Required Subjects:</Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Minimum Grade"
                                  value={getRequiredSubjectGrade('A-Levels')}
                                  onChange={(e) => handleEntryRequirementChange('A-Levels', 'required_subjects', {
                                    grade: e.target.value,
                                    count: getRequiredSubjectCount('A-Levels')
                                  })}
                                  placeholder="e.g. C"
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Number of Subjects"
                                  type="number"
                                  value={getRequiredSubjectCount('A-Levels')}
                                  onChange={(e) => handleEntryRequirementChange('A-Levels', 'required_subjects', {
                                    grade: getRequiredSubjectGrade('A-Levels'),
                                    count: e.target.value
                                  })}
                                  placeholder="e.g. 2"
                                />
                              </Grid>
                            </Grid>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    {/* STPM */}
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" mb={2}>STPM</Typography>
                          <TextField
                            fullWidth
                            size="small"
                            label="Minimum CGPA"
                            type="number"
                            value={currentCourse.entry_requirements?.STPM?.min_cgpa || ''}
                            onChange={(e) => handleEntryRequirementChange('STPM', 'min_cgpa', e.target.value)}
                            placeholder="e.g. 2.33"
                            InputProps={{
                              inputProps: { min: 0, max: 4, step: 0.01 }
                            }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    {/* UEC */}
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" mb={2}>UEC</Typography>
                          <Box mb={2}>
                            <Typography variant="body2" mb={1}>Required Subjects:</Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Minimum Grade"
                                  value={getRequiredSubjectGrade('UEC')}
                                  onChange={(e) => handleEntryRequirementChange('UEC', 'required_subjects', {
                                    grade: e.target.value,
                                    count: getRequiredSubjectCount('UEC')
                                  })}
                                  placeholder="e.g. B"
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Number of Subjects"
                                  type="number"
                                  value={getRequiredSubjectCount('UEC')}
                                  onChange={(e) => handleEntryRequirementChange('UEC', 'required_subjects', {
                                    grade: getRequiredSubjectGrade('UEC'),
                                    count: e.target.value
                                  })}
                                  placeholder="e.g. 5"
                                />
                              </Grid>
                            </Grid>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    {/* Diploma */}
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" mb={2}>Diploma</Typography>
                          <TextField
                            fullWidth
                            size="small"
                            label="Minimum CGPA"
                            type="number"
                            value={currentCourse.entry_requirements?.Diploma?.min_cgpa || ''}
                            onChange={(e) => handleEntryRequirementChange('Diploma', 'min_cgpa', e.target.value)}
                            placeholder="e.g. 2.5"
                            InputProps={{
                              inputProps: { min: 0, max: 4, step: 0.01 }
                            }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    {/* Foundation */}
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" mb={2}>Foundation</Typography>
                          <TextField
                            fullWidth
                            size="small"
                            label="Minimum CGPA"
                            type="number"
                            value={currentCourse.entry_requirements?.Foundation?.min_cgpa || ''}
                            onChange={(e) => handleEntryRequirementChange('Foundation', 'min_cgpa', e.target.value)}
                            placeholder="e.g. 2.5"
                            InputProps={{
                              inputProps: { min: 0, max: 4, step: 0.01 }
                            }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              variant="contained"
              color="primary"
              disabled={!currentCourse.name}
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

export default CoursePage;