import React from 'react';
import {
    Typography, Box,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Chip,
    Avatar
} from '@mui/material';
import DashboardCard from '../../../components/shared/DashboardCard';

const CoursePerformance = ({ courses, popularCourses }) => {
    // Map popular courses with their scores
    const popularCoursesMap = popularCourses.reduce((acc, item) => {
        acc[item.courseId] = item.score;
        return acc;
    }, {});

    // Get top 5 courses based on popularity score
    const topCourses = courses
        .filter(course => popularCoursesMap[course.id])
        .sort((a, b) => popularCoursesMap[b.id] - popularCoursesMap[a.id])
        .slice(0, 5);

    // Function to determine performance based on score
    const getPerformanceLevel = (score) => {
        if (score >= 80) return { level: 'High', color: 'success.main' };
        if (score >= 60) return { level: 'Medium', color: 'warning.main' };
        if (score >= 40) return { level: 'Low', color: 'error.main' };
        return { level: 'Critical', color: 'primary.main' };
    };

    return (
        <DashboardCard title="Course Performance">
            <Box sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' } }}>
                <Table
                    aria-label="course performance table"
                    sx={{
                        whiteSpace: "nowrap",
                        mt: 2
                    }}
                >
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Course Id
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    University
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Course Name
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Performance
                                </Typography>
                            </TableCell>
                            <TableCell align="right">
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Score
                                </Typography>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {topCourses.map((course) => {
                            const score = popularCoursesMap[course.id];
                            const performance = getPerformanceLevel(score);
                            
                            return (
                                <TableRow key={course.id}>
                                    <TableCell>
                                        <Typography
                                            sx={{
                                                fontSize: "15px",
                                                fontWeight: "500",
                                            }}
                                        >
                                            {course.id.substring(0, 6)}...
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                            }}
                                        >
                                            {course.university_imageUrl ? (
                                                <Avatar 
                                                    src={course.university_imageUrl}
                                                    alt={course.university_name}
                                                    sx={{ 
                                                        width: 30,
                                                        height: 30
                                                    }}
                                                />
                                            ) : (
                                                <Avatar 
                                                    sx={{ 
                                                        backgroundColor: 'primary.main',
                                                        width: 30,
                                                        height: 30,
                                                        fontSize: '14px'
                                                    }}
                                                >
                                                    {course.university_name.charAt(0)}
                                                </Avatar>
                                            )}
                                            <Box sx={{ ml: 2 }}>
                                                <Typography variant="subtitle2" fontWeight={600}>
                                                    {course.university_name.length > 20 
                                                        ? `${course.university_name.substring(0, 20)}...` 
                                                        : course.university_name}
                                                </Typography>
                                                <Typography
                                                    color="textSecondary"
                                                    sx={{
                                                        fontSize: "13px",
                                                    }}
                                                >
                                                    {course.level}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                                            {course.name.length > 30 
                                                ? `${course.name.substring(0, 30)}...` 
                                                : course.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            sx={{
                                                px: "4px",
                                                backgroundColor: performance.color,
                                                color: "#fff",
                                            }}
                                            size="small"
                                            label={performance.level}
                                        ></Chip>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography variant="h6">{score}</Typography>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Box>
        </DashboardCard>
    );
};

export default CoursePerformance;