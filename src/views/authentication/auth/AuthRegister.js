import React, { useState } from 'react';
import { Box, Typography, Button, Alert, CircularProgress } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';
import { Stack } from '@mui/system';

const AuthRegister = ({ title, subtitle, subtext }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [formError, setFormError] = useState('');
    const { register, error, loading, clearError } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearError();
        setFormError('');

        // Validate password match
        if (password !== confirmPassword) {
            setFormError('Passwords do not match');
            return;
        }

        // Password strength validation
        if (password.length < 6) {
            setFormError('Password must be at least 6 characters');
            return;
        }

        const success = await register(email, password);
        if (success) {
            // After successful registration, redirect to login
            navigate('/auth/login');
        }
    };

    return (
        <>
            {title ? (
                <Typography fontWeight="700" variant="h2" mb={1}>
                    {title}
                </Typography>
            ) : null}

            {subtext}

            {(error || formError) && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {formError || error}
                </Alert>
            )}

            <Box>
                <form onSubmit={handleSubmit}>
                    <Stack mb={3}>
                        <Typography variant="subtitle1"
                            fontWeight={600} component="label" htmlFor='name' mb="5px">Name</Typography>
                        <CustomTextField 
                            id="name" 
                            variant="outlined" 
                            fullWidth 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

                        <Typography variant="subtitle1"
                            fontWeight={600} component="label" htmlFor='email' mb="5px" mt="25px">Email Address</Typography>
                        <CustomTextField 
                            id="email" 
                            variant="outlined" 
                            fullWidth 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            type="email"
                        />

                        <Typography variant="subtitle1"
                            fontWeight={600} component="label" htmlFor='password' mb="5px" mt="25px">Password</Typography>
                        <CustomTextField 
                            id="password" 
                            variant="outlined" 
                            fullWidth 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            type="password"
                        />

                        <Typography variant="subtitle1"
                            fontWeight={600} component="label" htmlFor='confirmPassword' mb="5px" mt="25px">Confirm Password</Typography>
                        <CustomTextField 
                            id="confirmPassword" 
                            variant="outlined" 
                            fullWidth 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            type="password"
                        />
                    </Stack>
                    <Button 
                        color="primary" 
                        variant="contained" 
                        size="large" 
                        fullWidth 
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Sign Up'
                        )}
                    </Button>
                </form>
            </Box>
            {subtitle}
        </>
    );
};

export default AuthRegister;