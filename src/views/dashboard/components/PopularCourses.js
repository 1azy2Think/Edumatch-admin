import React, { useState } from 'react';
import { 
  Grid, 
  CardContent, 
  Typography, 
  Rating, 
  Chip, 
  Tooltip, 
  Fab,
  Box,
  Tabs,
  Tab,
  Avatar
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { IconBookmark, IconTrendingUp, IconStar } from '@tabler/icons-react';
import BlankCard from '../../../components/shared/BlankCard';
import DashboardCard from '../../../components/shared/DashboardCard';

const PopularCourses = ({ courses, trending, popular }) => {
  const theme = useTheme();
  const [value, setValue] = useState(0);

  // Handle tab change
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Function to get course data by ID
  const getCourseById = (courseId) => {
    return courses.find(course => course.id === courseId);
  };

  // Create course display list based on selected tab
  const getDisplayCourses = () => {
    if (value === 0) { // Popular
      return popular.slice(0, 4).map(item => {
        const course = getCourseById(item.courseId);
        return course ? { ...course, score: item.score } : null;
      }).filter(Boolean);
    } else { // Trending
      return trending.slice(0, 4).map(item => {
        const course = getCourseById(item.courseId);
        return course ? { ...course, score: item.score } : null;
      }).filter(Boolean);
    }
  };

  // Function to get level color
  const getLevelColor = (level) => {
    const levelColors = {
      'Foundation': theme.palette.primary.main,
      'Diploma': theme.palette.secondary.main,
      'Degree': theme.palette.warning.main
    };
    return levelColors[level] || theme.palette.info.main;
  };

  const displayCourses = getDisplayCourses();

  return (
    <DashboardCard 
      title="Featured Courses"
      action={
        <Tabs
          value={value}
          onChange={handleChange}
          textColor="primary"
          indicatorColor="primary"
          aria-label="course tabs"
        >
          <Tab 
            icon={<IconStar size="1rem" />} 
            iconPosition="start" 
            label="Popular" 
          />
          <Tab 
            icon={<IconTrendingUp size="1rem" />} 
            iconPosition="start" 
            label="Trending" 
          />
        </Tabs>
      }
    >
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {displayCourses.length > 0 ? (
          displayCourses.map((course, index) => (
            <Grid item xs={12} sm={6} md={3} key={course.id}>
              <BlankCard>
                <Box sx={{ position: 'relative' }}>
                  {course.university_imageUrl ? (
                    <Box 
                      component="img"
                      src={course.university_imageUrl}
                      alt={course.university_name}
                      sx={{
                        width: '100%',
                        height: '160px',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    // Fallback to colored box if no image
                    <Box 
                      sx={{
                        width: '100%',
                        height: '160px',
                        backgroundColor: theme.palette.primary.light,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: '#ffffff',
                        fontWeight: 'bold'
                      }}
                    >
                      {course.university_name.charAt(0)}
                    </Box>
                  )}
                  <Chip
                    label={course.level}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      backgroundColor: getLevelColor(course.level),
                      color: '#fff',
                    }}
                  />
                </Box>
                <Tooltip title="Add to favorites">
                  <Fab
                    size="small"
                    color={value === 0 ? "primary" : "warning"}
                    sx={{ bottom: '60px', right: '15px', position: 'absolute' }}
                  >
                    <IconBookmark size="16" />
                  </Fab>
                </Tooltip>
                <CardContent sx={{ p: 3, pt: 2 }}>
                  <Typography variant="h6" noWrap gutterBottom>
                    {course.name && course.name.length > 30 
                      ? `${course.name.substring(0, 30)}...` 
                      : course.name || 'Unnamed Course'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" noWrap gutterBottom>
                    {course.university_name || 'Unknown University'}
                  </Typography>
                  <Grid container spacing={1} alignItems="center" sx={{ mt: 1 }}>
                    <Grid item>
                      <Typography variant="h6">
                        RM{(course.total_fee || 0).toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Typography 
                        color="textSecondary" 
                        sx={{ fontSize: '0.75rem' }}
                      >
                        {course.duration || 'Unknown duration'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sx={{ mt: 1 }}>
                      <Rating 
                        name="read-only" 
                        size="small" 
                        value={(course.score || 0) / 20} 
                        precision={0.5}
                        readOnly 
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </BlankCard>
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
    </DashboardCard>
  );
};

export default PopularCourses;