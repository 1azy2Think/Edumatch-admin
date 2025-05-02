import React from 'react';
import Chart from 'react-apexcharts';
import { useTheme } from '@mui/material/styles';
import { Grid, Stack, Typography, Avatar } from '@mui/material';
import { IconArrowUpLeft } from '@tabler/icons-react';

import DashboardCard from '../../../components/shared/DashboardCard';

const CategoryBreakdown = ({ categories }) => {
  if (!categories || categories.length === 0) {
    return (
      <DashboardCard title="Category Breakdown">
        <Typography variant="body2" color="textSecondary" align="center">
          No category data available
        </Typography>
      </DashboardCard>
    );
  }

  // Get the top categories based on their importance or count property
  const sortedCategories = [...categories].sort((a, b) => {
    // First try to sort by count
    if (a.count !== undefined && b.count !== undefined) {
      return b.count - a.count;
    }
    // If count is not available, try to sort by importance
    if (a.importance !== undefined && b.importance !== undefined) {
      return b.importance - a.importance;
    }
    // Default to 0 if neither property exists
    return 0;
  });

  const topCategories = sortedCategories.slice(0, 3);
  const othersCount = sortedCategories.slice(3).reduce((acc, cat) => {
    // Use count if available, otherwise use importance or default to 1
    const value = cat.count !== undefined ? cat.count : (cat.importance || 1);
    return acc + value;
  }, 0);
  
  // Calculate total courses - use count or importance property
  const totalCategories = categories.reduce((acc, cat) => {
    const value = cat.count !== undefined ? cat.count : (cat.importance || 1);
    return acc + value;
  }, 0);
  
  // Prepare data for the chart
  const chartData = [
    ...topCategories.map(cat => cat.count !== undefined ? cat.count : (cat.importance || 1)),
    othersCount
  ];
  
  const chartLabels = [
    ...topCategories.map(cat => cat.name),
    'Others'
  ];

  // chart color
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const success = theme.palette.success.main;
  const warning = theme.palette.warning.main;
  const successlight = theme.palette.success.light;

  // chart
  const optionsDonutChart = {
    chart: {
      type: 'donut',
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: '#adb0bb',
      toolbar: {
        show: false,
      },
      height: 155,
    },
    colors: [primary, secondary, success, warning],
    plotOptions: {
      pie: {
        startAngle: 0,
        endAngle: 360,
        donut: {
          size: '75%',
          background: 'transparent',
        },
      },
    },
    tooltip: {
      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
      fillSeriesColor: false,
    },
    stroke: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    responsive: [
      {
        breakpoint: 991,
        options: {
          chart: {
            width: 120,
          },
        },
      },
    ],
  };

  // Get top category percentage - use either count or importance
  const topCategoryValue = topCategories.length > 0 
    ? (topCategories[0].count !== undefined ? topCategories[0].count : (topCategories[0].importance || 1))
    : 0;
  
  const topCategoryPercentage = totalCategories > 0 
    ? Math.round((topCategoryValue / totalCategories) * 100)
    : 0;

  return (
    <DashboardCard title="Category Breakdown">
      <Grid container spacing={3}>
        {/* column */}
        <Grid item xs={7} sm={7}>
          <Typography variant="h3" fontWeight="700">
            {categories.length} Categories
          </Typography>
          <Stack direction="row" spacing={1} mt={1} alignItems="center">
            <Avatar sx={{ bgcolor: successlight, width: 27, height: 27 }}>
              <IconArrowUpLeft width={20} color="#39B69A" />
            </Avatar>
            <Typography variant="subtitle2" fontWeight="600">
              {topCategoryPercentage}%
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              in top category
            </Typography>
          </Stack>
          <Stack spacing={3} mt={5} direction="column">
            {chartLabels.map((label, index) => (
              <Stack key={index} direction="row" spacing={1} alignItems="center">
                <Avatar
                  sx={{ 
                    width: 9, 
                    height: 9, 
                    bgcolor: [primary, secondary, success, warning][index], 
                    svg: { display: 'none' } 
                  }}
                ></Avatar>
                <Typography variant="subtitle2" color="textSecondary">
                  {label}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Grid>
        {/* column */}
        <Grid item xs={5} sm={5}>
          <Chart
            options={optionsDonutChart}
            series={chartData}
            type="donut"
            height="150px"
          />
        </Grid>
      </Grid>
    </DashboardCard>
  );
};

export default CategoryBreakdown;