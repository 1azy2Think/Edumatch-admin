import React, { useState, useEffect } from 'react';
import { Select, MenuItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardCard from '../../../components/shared/DashboardCard';
import Chart from 'react-apexcharts';

const CourseOverview = ({ data }) => {
    const [viewOption, setViewOption] = useState('enrollments');
    const [levelData, setLevelData] = useState({
        labels: [],
        values: []
    });
    const [categoryData, setCategoryData] = useState({
        labels: [],
        values: []
    });

    // Process the course data when the component mounts or data changes
    useEffect(() => {
        if (!data || !data.courses || data.courses.length === 0) {
            return;
        }

        // Get course levels distribution
        const courseLevelsMap = data.courses.reduce((acc, course) => {
            if (course.level) {
                acc[course.level] = (acc[course.level] || 0) + 1;
            }
            return acc;
        }, {});

        // Convert to arrays for the chart
        const levelLabels = Object.keys(courseLevelsMap);
        const levelValues = Object.values(courseLevelsMap);

        setLevelData({
            labels: levelLabels,
            values: levelValues
        });

        // Get course categories distribution
        const courseCategoriesMap = data.courses.reduce((acc, course) => {
            if (course.primary_category) {
                acc[course.primary_category] = (acc[course.primary_category] || 0) + 1;
            }
            return acc;
        }, {});

        // Sort categories by count and get top 5
        const sortedCategories = Object.entries(courseCategoriesMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        // Convert to arrays for the chart
        const categoryLabels = sortedCategories.map(item => item[0]);
        const categoryValues = sortedCategories.map(item => item[1]);

        setCategoryData({
            labels: categoryLabels,
            values: categoryValues
        });
    }, [data]);

    // Get monthly intake distribution from the actual course data
    const getMonthlyIntakeData = () => {
        if (!data || !data.courses || data.courses.length === 0) {
            return {
                labels: [],
                series: [[], []]
            };
        }
        
        // Map of month abbreviations to full names
        const monthMap = {
            'Jan': 'January',
            'Feb': 'February',
            'Mar': 'March',
            'Apr': 'April',
            'May': 'May',
            'Jun': 'June',
            'Jul': 'July',
            'Aug': 'August',
            'Sep': 'September',
            'Oct': 'October',
            'Nov': 'November',
            'Dec': 'December'
        };
        
        // Count courses by intake month
        const intakeMonths = {};
        const coursesPerUniversity = {};
        
        data.courses.forEach(course => {
            if (course.intakes && Array.isArray(course.intakes)) {
                course.intakes.forEach(month => {
                    // Standardize month format (some might be 'Mar', others 'March')
                    let standardMonth = month;
                    Object.entries(monthMap).forEach(([abbr, full]) => {
                        if (month.toLowerCase() === full.toLowerCase() || month.toLowerCase() === abbr.toLowerCase()) {
                            standardMonth = abbr;
                        }
                    });
                    
                    intakeMonths[standardMonth] = (intakeMonths[standardMonth] || 0) + 1;
                    
                    // Also count by university
                    if (course.university_name) {
                        if (!coursesPerUniversity[standardMonth]) {
                            coursesPerUniversity[standardMonth] = {};
                        }
                        coursesPerUniversity[standardMonth][course.university_name] = 
                            (coursesPerUniversity[standardMonth][course.university_name] || 0) + 1;
                    }
                });
            }
        });
        
        // Sort months in calendar order
        const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const sortedMonths = Object.keys(intakeMonths).sort((a, b) => {
            return monthOrder.indexOf(a) - monthOrder.indexOf(b);
        });
        
        // Get the number of unique universities with intakes in each month
        const universityCount = sortedMonths.map(month => {
            return coursesPerUniversity[month] ? Object.keys(coursesPerUniversity[month]).length : 0;
        });
        
        return {
            labels: sortedMonths,
            series: [
                {
                    name: 'Courses with Intakes',
                    data: sortedMonths.map(month => intakeMonths[month])
                },
                {
                    name: 'Universities with Intakes',
                    data: universityCount
                }
            ]
        };
    };

    const handleChange = (event) => {
        setViewOption(event.target.value);
    };

    // chart color
    const theme = useTheme();
    const primary = theme.palette.primary.main;
    const secondary = theme.palette.secondary.main;
    const success = theme.palette.success.main;
    const warning = theme.palette.warning.main;

    // Get the actual intake data
    const intakeData = getMonthlyIntakeData();

    // Enrollments/Intakes Chart
    const intakesChartOptions = {
        chart: {
            type: 'bar',
            fontFamily: "'Plus Jakarta Sans', sans-serif;",
            foreColor: '#adb0bb',
            toolbar: {
                show: true,
            },
            height: 370,
        },
        colors: [primary, secondary],
        plotOptions: {
            bar: {
                horizontal: false,
                barHeight: '80%',
                columnWidth: '42%',
                borderRadius: [6],
                borderRadiusApplication: 'end',
                borderRadiusWhenStacked: 'all',
            },
        },
        stroke: {
            show: true,
            width: 5,
            lineCap: "butt",
            colors: ["transparent"],
        },
        dataLabels: {
            enabled: false,
        },
        legend: {
            show: true,
            position: 'top',
        },
        grid: {
            borderColor: 'rgba(0,0,0,0.1)',
            strokeDashArray: 3,
            xaxis: {
                lines: {
                    show: false,
                },
            },
        },
        yaxis: {
            tickAmount: 4,
        },
        xaxis: {
            categories: intakeData.labels,
            axisBorder: {
                show: false,
            },
        },
        tooltip: {
            theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
            fillSeriesColor: false,
        },
    };

    // Level Distribution Chart
    const levelChartOptions = {
        chart: {
            type: 'pie',
            fontFamily: "'Plus Jakarta Sans', sans-serif;",
            foreColor: '#adb0bb',
            toolbar: {
                show: true,
            },
            height: 370,
        },
        colors: [primary, secondary, warning, success, theme.palette.error.main],
        dataLabels: {
            enabled: true,
        },
        legend: {
            show: true,
            position: 'bottom',
        },
        tooltip: {
            theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
            fillSeriesColor: false,
        },
        labels: levelData.labels,
    };

    // Category Distribution Chart
    const categoryChartOptions = {
        chart: {
            type: 'bar',
            fontFamily: "'Plus Jakarta Sans', sans-serif;",
            foreColor: '#adb0bb',
            toolbar: {
                show: true,
            },
            height: 370,
        },
        colors: [secondary],
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: '50%',
                borderRadius: [6],
                borderRadiusApplication: 'end',
                borderRadiusWhenStacked: 'all',
            },
        },
        dataLabels: {
            enabled: false,
        },
        xaxis: {
            categories: categoryData.labels,
        },
        yaxis: {
            title: {
                text: 'Number of Courses'
            }
        },
        tooltip: {
            theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
            fillSeriesColor: false,
        },
    };

    const categoryChartSeries = [
        {
            name: 'Courses',
            data: categoryData.values
        }
    ];

    // Render loading state or empty state if no data
    if (!data || !data.courses || data.courses.length === 0) {
        return (
            <DashboardCard title="Courses Overview">
                <div style={{ height: '370px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    No course data available
                </div>
            </DashboardCard>
        );
    }

    return (
        <DashboardCard 
            title="Courses Overview" 
            action={
                <Select
                    labelId="view-option-dd"
                    id="view-option-dd"
                    value={viewOption}
                    size="small"
                    onChange={handleChange}
                >
                    <MenuItem value="enrollments">Monthly Intakes</MenuItem>
                    <MenuItem value="levels">Course Levels</MenuItem>
                    <MenuItem value="categories">Top Categories</MenuItem>
                </Select>
            }
        >
            {viewOption === 'enrollments' && (
                <Chart
                    options={intakesChartOptions}
                    series={intakeData.series}
                    type="bar"
                    height="370px"
                />
            )}

            {viewOption === 'levels' && (
                <Chart
                    options={levelChartOptions}
                    series={levelData.values}
                    type="pie"
                    height="370px"
                />
            )}

            {viewOption === 'categories' && (
                <Chart
                    options={categoryChartOptions}
                    series={categoryChartSeries}
                    type="bar"
                    height="370px"
                />
            )}
        </DashboardCard>
    );
};

export default CourseOverview;