// src/views/crud/AdminPage.js
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
  Card,
  CardContent,
  Avatar,
  InputAdornment
} from '@mui/material';
import {
  IconEdit,
  IconTrash,
  IconPlus,
  IconSearch,
  IconFilter,
  IconUsers,
  IconUser,
  IconUserCheck,
  IconUserX,
  IconKey
} from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import { collection, getDocs, doc, setDoc, deleteDoc, addDoc, query, where, getDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Function to get role color for badges
const getRoleColor = (role) => {
  switch (role) {
    case 'admin':
      return 'error';
    case 'moderator':
      return 'warning';
    case 'editor':
      return 'success';
    case 'user':
      return 'info';
    default:
      return 'default';
  }
};

const AdminPage = () => {
  const { currentUser, userRole, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState({
    displayName: '',
    email: '',
    role: 'user', // Default role
    permissions: [],
    lastLogin: null,
    active: true,
    created_at: new Date()
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Check if user is admin, redirect if not
  useEffect(() => {
    // Redirect non-admin users to dashboard
    if (userRole !== null && !isAdmin()) {
      navigate('/dashboard');
    }
  }, [userRole, navigate, isAdmin]);
  
  // Available permissions for different roles
  const availablePermissions = {
    admin: ['manage_users', 'manage_content', 'manage_settings', 'view_reports', 'approve_content'],
    moderator: ['manage_content', 'view_reports', 'approve_content'],
    editor: ['manage_content', 'view_reports'],
    user: ['view_content']
  };

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // Fetch users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersList = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Initialize missing fields with defaults
          role: doc.data().role || 'user',
          permissions: doc.data().permissions || [],
          active: doc.data().active !== undefined ? doc.data().active : true
        }));
        
        setUsers(usersList);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load user data. Please try again.');
        setLoading(false);
      }
    };

    // Only fetch data if user is admin
    if (isAdmin()) {
      fetchUsers();
    }
  }, [isAdmin]);

  // Open dialog for adding new user
  const handleAddNew = () => {
    try {
      setSelectedUser({
        displayName: '',
        email: '',
        role: 'user',
        permissions: ['view_content'],
        lastLogin: null,
        active: true,
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

  // Open dialog for editing user
  const handleEdit = (user) => {
    try {
      if (!user) {
        throw new Error('User data is invalid');
      }
      
      setSelectedUser({
        id: user.id,
        displayName: user.displayName || '',
        email: user.email || '',
        role: user.role || 'user',
        permissions: user.permissions || [],
        lastLogin: user.lastLogin || null,
        active: user.active !== undefined ? user.active : true,
        created_at: user.created_at || new Date()
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'role') {
      // When role changes, update permissions to default for that role
      setSelectedUser({
        ...selectedUser,
        role: value,
        permissions: availablePermissions[value] || []
      });
    } else {
      setSelectedUser({
        ...selectedUser,
        [name]: value
      });
    }
  };

  // Handle toggle for active status
  const handleActiveToggle = () => {
    setSelectedUser({
      ...selectedUser,
      active: !selectedUser.active
    });
  };

  // Handle permission change
  const handlePermissionChange = (permission, checked) => {
    let updatedPermissions = [...selectedUser.permissions];
    
    if (checked) {
      if (!updatedPermissions.includes(permission)) {
        updatedPermissions.push(permission);
      }
    } else {
      updatedPermissions = updatedPermissions.filter(p => p !== permission);
    }
    
    setSelectedUser({
      ...selectedUser,
      permissions: updatedPermissions
    });
  };

  // Save user (add or update)
  const handleSave = async () => {
    try {
      setLoading(true);
      
      const userData = {
        ...selectedUser,
        updated_at: new Date()
      };
      
      if (dialogMode === 'add') {
        // Add new user
        await addDoc(collection(db, 'users'), userData);
        setSnackbar({
          open: true,
          message: 'User added successfully!',
          severity: 'success'
        });
      } else {
        // Update existing user
        const userRef = doc(db, 'users', selectedUser.id);
        const { id, ...userDataWithoutId } = userData;
        await setDoc(userRef, userDataWithoutId, { merge: true });
        setSnackbar({
          open: true,
          message: 'User updated successfully!',
          severity: 'success'
        });
      }
      
      setOpenDialog(false);
      
      // Refresh users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        role: doc.data().role || 'user',
        permissions: doc.data().permissions || [],
        active: doc.data().active !== undefined ? doc.data().active : true
      }));
      setUsers(usersList);
    } catch (err) {
      console.error('Error saving user:', err);
      setSnackbar({
        open: true,
        message: `Error: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setLoading(true);
        await deleteDoc(doc(db, 'users', id));
        setSnackbar({
          open: true,
          message: 'User deleted successfully!',
          severity: 'success'
        });
        
        // Refresh users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersList = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          role: doc.data().role || 'user',
          permissions: doc.data().permissions || [],
          active: doc.data().active !== undefined ? doc.data().active : true
        }));
        setUsers(usersList);
      } catch (err) {
        console.error('Error deleting user:', err);
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

  // Filter users based on search term and role filter
  const filteredUsers = users.filter(user => {
    // Search term filter
    const matchesSearch = 
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Role filter
    const matchesRole = 
      filterRole === 'all' || 
      user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  // Get unique user roles for filter
  const userRoles = [...new Set(users.map(user => user.role).filter(Boolean))];

  // Generate avatar background color
  const getAvatarColor = (name) => {
    if (!name) return '#1976d2';
    
    const colors = ['#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', 
      '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffc107', '#ff9800', '#ff5722'];
    
    const charCode = name.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return '?';
    
    const nameParts = name.split(' ');
    if (nameParts.length === 1) {
      return name.substring(0, 1).toUpperCase();
    }
    
    return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
  };

  // If user is not admin, return access denied message instead of rendering the admin page
  if (userRole !== null && !isAdmin()) {
    return (
      <PageContainer title="Access Denied" description="Admin access required">
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          height="80vh"
        >
          <Typography variant="h4" color="error" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1">
            You don't have permission to access this page. This page requires admin privileges.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 3 }}
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </Button>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="User Role Management" description="Manage user roles and permissions">
      <DashboardCard title="User Administration">
        <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <TextField
              size="small"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: 300 }}
              InputProps={{
                startAdornment: <IconSearch size="20" style={{ marginRight: '8px' }} />,
              }}
            />
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="role-filter-label">Role</InputLabel>
              <Select
                labelId="role-filter-label"
                value={filterRole}
                label="Role"
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <MenuItem value="all">All Roles</MenuItem>
                {userRoles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<IconPlus size="18" />}
            onClick={handleAddNew}
          >
            Add User
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table sx={{ minWidth: 650 }} aria-label="users table">
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Permissions</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar 
                            sx={{ 
                              bgcolor: getAvatarColor(user.displayName),
                              width: 36,
                              height: 36,
                              mr: 1.5
                            }}
                          >
                            {getUserInitials(user.displayName)}
                          </Avatar>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {user.displayName || 'Unnamed User'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          size="small"
                          color={getRoleColor(user.role)}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.active ? 'Active' : 'Inactive'}
                          size="small"
                          color={user.active ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {user.permissions && user.permissions.length > 0 ? (
                            user.permissions.slice(0, 2).map((permission, index) => (
                              <Chip
                                key={index}
                                label={permission.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            ))
                          ) : (
                            <Typography variant="caption" color="textSecondary">
                              No special permissions
                            </Typography>
                          )}
                          {user.permissions && user.permissions.length > 2 && (
                            <Chip
                              label={`+${user.permissions.length - 2}`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleEdit(user)}
                        >
                          <IconEdit size="18" />
                        </IconButton>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDelete(user.id)}
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
                        No users found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Add/Edit User Dialog */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            {dialogMode === 'add' ? 'Add New User' : 'Edit User'}
          </DialogTitle>
          <DialogContent dividers>
            <Box component="form" sx={{ mt: 1 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Display Name"
                    name="displayName"
                    value={selectedUser.displayName}
                    onChange={handleInputChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <IconUser size={20} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={selectedUser.email}
                    onChange={handleInputChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <IconSearch size={20} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="role-select-label">Role</InputLabel>
                    <Select
                      labelId="role-select-label"
                      name="role"
                      value={selectedUser.role}
                      label="Role"
                      onChange={handleInputChange}
                      startAdornment={
                        <InputAdornment position="start">
                          <IconKey size={20} style={{ marginRight: '8px' }} />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="moderator">Moderator</MenuItem>
                      <MenuItem value="editor">Editor</MenuItem>
                      <MenuItem value="user">User</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="status-select-label">Status</InputLabel>
                    <Select
                      labelId="status-select-label"
                      name="active"
                      value={selectedUser.active}
                      label="Status"
                      onChange={(e) => setSelectedUser({ ...selectedUser, active: e.target.value })}
                      startAdornment={
                        <InputAdornment position="start">
                          {selectedUser.active ? (
                            <IconUserCheck size={20} style={{ marginRight: '8px' }} />
                          ) : (
                            <IconUserX size={20} style={{ marginRight: '8px' }} />
                          )}
                        </InputAdornment>
                      }
                    >
                      <MenuItem value={true}>Active</MenuItem>
                      <MenuItem value={false}>Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Permissions
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Configure specific permissions for this user. Default permissions are based on their role.
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom>
                            Content Management
                          </Typography>
                          <Box mt={1}>
                            <FormControl component="fieldset" variant="standard">
                              <Grid container spacing={1}>
                                <Grid item xs={12}>
                                  <Box display="flex" alignItems="center">
                                    <FormControl>
                                      <Select
                                        size="small"
                                        value={selectedUser.permissions.includes('manage_content')}
                                        onChange={(e) => handlePermissionChange('manage_content', e.target.value)}
                                      >
                                        <MenuItem value={true}>Enabled</MenuItem>
                                        <MenuItem value={false}>Disabled</MenuItem>
                                      </Select>
                                    </FormControl>
                                    <Typography variant="body2" sx={{ ml: 2 }}>
                                      Manage Content
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12}>
                                  <Box display="flex" alignItems="center">
                                    <FormControl>
                                      <Select
                                        size="small"
                                        value={selectedUser.permissions.includes('approve_content')}
                                        onChange={(e) => handlePermissionChange('approve_content', e.target.value)}
                                      >
                                        <MenuItem value={true}>Enabled</MenuItem>
                                        <MenuItem value={false}>Disabled</MenuItem>
                                      </Select>
                                    </FormControl>
                                    <Typography variant="body2" sx={{ ml: 2 }}>
                                      Approve Content
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12}>
                                  <Box display="flex" alignItems="center">
                                    <FormControl>
                                      <Select
                                        size="small"
                                        value={selectedUser.permissions.includes('view_content')}
                                        onChange={(e) => handlePermissionChange('view_content', e.target.value)}
                                      >
                                        <MenuItem value={true}>Enabled</MenuItem>
                                        <MenuItem value={false}>Disabled</MenuItem>
                                      </Select>
                                    </FormControl>
                                    <Typography variant="body2" sx={{ ml: 2 }}>
                                      View Content
                                    </Typography>
                                  </Box>
                                </Grid>
                              </Grid>
                            </FormControl>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom>
                            Administration
                          </Typography>
                          <Box mt={1}>
                            <FormControl component="fieldset" variant="standard">
                              <Grid container spacing={1}>
                                <Grid item xs={12}>
                                  <Box display="flex" alignItems="center">
                                    <FormControl>
                                      <Select
                                        size="small"
                                        value={selectedUser.permissions.includes('manage_users')}
                                        onChange={(e) => handlePermissionChange('manage_users', e.target.value)}
                                      >
                                        <MenuItem value={true}>Enabled</MenuItem>
                                        <MenuItem value={false}>Disabled</MenuItem>
                                      </Select>
                                    </FormControl>
                                    <Typography variant="body2" sx={{ ml: 2 }}>
                                      Manage Users
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12}>
                                  <Box display="flex" alignItems="center">
                                    <FormControl>
                                      <Select
                                        size="small"
                                        value={selectedUser.permissions.includes('manage_settings')}
                                        onChange={(e) => handlePermissionChange('manage_settings', e.target.value)}
                                      >
                                        <MenuItem value={true}>Enabled</MenuItem>
                                        <MenuItem value={false}>Disabled</MenuItem>
                                      </Select>
                                    </FormControl>
                                    <Typography variant="body2" sx={{ ml: 2 }}>
                                      Manage Settings
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12}>
                                  <Box display="flex" alignItems="center">
                                    <FormControl>
                                      <Select
                                        size="small"
                                        value={selectedUser.permissions.includes('view_reports')}
                                        onChange={(e) => handlePermissionChange('view_reports', e.target.value)}
                                      >
                                        <MenuItem value={true}>Enabled</MenuItem>
                                        <MenuItem value={false}>Disabled</MenuItem>
                                      </Select>
                                    </FormControl>
                                    <Typography variant="body2" sx={{ ml: 2 }}>
                                      View Reports
                                    </Typography>
                                  </Box>
                                </Grid>
                              </Grid>
                            </FormControl>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              variant="contained"
              color="primary"
              disabled={!selectedUser.displayName || !selectedUser.email}
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

export default AdminPage;