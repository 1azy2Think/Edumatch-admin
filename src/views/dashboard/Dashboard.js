import React, { useState, useEffect } from 'react';
import { Grid, Box, CircularProgress, Typography, Alert } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import { db } from 'src/utils/firebase'; // Adjust this path as needed
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

// components
import CourseOverview from './components/CourseOverview';
import CategoryBreakdown from './components/CategoryBreakdown';
import RecentChats from './components/RecentChats';
import CoursePerformance from './components/CoursePerformance';
import PopularCourses from './components/PopularCourses';
import TotalStats from './components/TotalStats';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    courses: [],
    categories: [],
    chatSessions: [],
    universities: [],
    users: [],
    popularCourses: [],
    trendingCourses: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFirestoreData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch courses
        let courses = [];
        try {
          const coursesSnapshot = await getDocs(collection(db, 'courses'));
          courses = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
          console.error('Error fetching courses:', e);
        }

        // Fetch categories
        let categories = [];
        try {
          const categoriesSnapshot = await getDocs(collection(db, 'categories'));
          categories = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
          console.error('Error fetching categories:', e);
        }

        // Fetch chat sessions - limit to most recent 10
        let chatSessions = [];
        try {
          const chatSessionsQuery = query(
            collection(db, 'chatSessions'),
            orderBy('updatedAt', 'desc'),
            limit(10)
          );
          const chatSessionsSnapshot = await getDocs(chatSessionsQuery);
          chatSessions = chatSessionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
          console.error('Error fetching chat sessions:', e);
        }

        // Fetch universities
        let universities = [];
        try {
          const universitiesSnapshot = await getDocs(collection(db, 'universities'));
          universities = universitiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
          console.error('Error fetching universities:', e);
        }

        // Fetch users
        let users = [];
        try {
          const usersSnapshot = await getDocs(collection(db, 'users'));
          users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
          console.error('Error fetching users:', e);
        }

        // Fetch system data for popular and trending courses
        let popularCoursesData = [];
        let trendingCoursesData = [];

        try {
          const systemSnapshot = await getDocs(collection(db, 'system'));
          const systemData = systemSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          const popularCoursesItem = systemData.find(item => item.id === 'popularCourses');
          if (popularCoursesItem && popularCoursesItem.courses) {
            popularCoursesData = popularCoursesItem.courses;
          }

          const trendingCoursesItem = systemData.find(item => item.id === 'trendingCourses');
          if (trendingCoursesItem && trendingCoursesItem.daily) {
            trendingCoursesData = trendingCoursesItem.daily;
          }
        } catch (e) {
          console.error('Error fetching system data:', e);
        }

        // Link courses with their university data
        const processedCourses = courses.map(course => {
          // Find the university this course belongs to
          const university = universities.find(uni => 
            uni.courses && uni.courses.includes(course.id)
          );
          
          // Add university data to course object
          return {
            ...course,
            university_name: university?.name || course.university_name || 'Unknown University',
            university_imageUrl: university?.imageurl || '', // Note lowercase 'imageurl' from the university object
            university_id: university?.id || null
          };
        });

        setDashboardData({
          courses: processedCourses, // Use the enhanced courses with university info
          categories,
          chatSessions,
          universities,
          users,
          popularCourses: popularCoursesData,
          trendingCourses: trendingCoursesData
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchFirestoreData();
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="80vh"
      >
        <CircularProgress size={60} />
        <Typography variant="h6" mt={2}>
          Loading dashboard data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Check if we have any data at all
  const hasData = dashboardData.courses.length > 0 ||
    dashboardData.categories.length > 0 ||
    dashboardData.chatSessions.length > 0;

  if (!hasData) {
    return (
      <Box p={3}>
        <Alert severity="info">
          No data available. Please make sure your database is populated with courses, categories, and other information.
        </Alert>
      </Box>
    );
  }

  return (
    <PageContainer title="Course Admin Dashboard" description="Educational Courses Management Dashboard">
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <CourseOverview data={dashboardData} />
          </Grid>
          <Grid item xs={12} lg={4}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <CategoryBreakdown categories={dashboardData.categories} />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} lg={8}>
            <CoursePerformance
              courses={dashboardData.courses}
              popularCourses={dashboardData.popularCourses}
            />
          </Grid>
          <Grid item xs={12} lg={4}>
            <TotalStats
              courseCount={dashboardData.courses.length}
              universityCount={dashboardData.universities.length}
              userCount={dashboardData.users.length}
            />
          </Grid>
          <Grid item xs={12}>
            <PopularCourses
              courses={dashboardData.courses}
              trending={dashboardData.trendingCourses}
              popular={dashboardData.popularCourses}
            />
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default Dashboard;