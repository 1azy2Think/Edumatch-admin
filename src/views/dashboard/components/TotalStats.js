import React from 'react';
import Chart from 'react-apexcharts';
import { useTheme } from '@mui/material/styles';
import { Stack, Typography, Avatar, Box } from '@mui/material';
import { 
  IconArrowUpRight, 
  IconSchool, 
  IconBuilding, 
  IconUsers 
} from '@tabler/icons-react';
import DashboardCard from '../../../components/shared/DashboardCard';

const TotalStats = ({ courseCount, universityCount, userCount }) => {
  // chart color
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const primarylight = '#ecf2ff';
  const successlight = theme.palette.success.light;

  // Generate random growth percentages for demo
  const courseGrowth = Math.floor(Math.random() * 15) + 5;
  const universityGrowth = Math.floor(Math.random() * 10) + 2;
  const userGrowth = Math.floor(Math.random() * 20) + 10;

  // chart for monthly growth trend (simulated data)
  const optionsColumnChart = {
    chart: {
      type: 'area',
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: '#adb0bb',
      toolbar: {
        show: false,
      },
      height: 60,
      sparkline: {
        enabled: true,
      },
      group: 'sparklines',
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    fill: {
      colors: [primarylight],
      type: 'solid',
      opacity: 0.05,
    },
    markers: {
      size: 0,
    },
    tooltip: {
      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
    },
  };
  
  const seriesColumnChart = [
    {
      name: 'Monthly growth',
      color: primary,
      data: [25, 35, 20, 25, 40, 30, 25, 35],
    },
  ];

  return (
    <DashboardCard title="Platform Statistics">
      <Stack spacing={3}>
        {/* Course Stats */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              sx={{ bgcolor: primary, width: 42, height: 42 }}
            >
              <IconSchool size="24" />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Total Courses
              </Typography>
              <Typography variant="h3" fontWeight="700">
                {courseCount}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} mt={1} alignItems="center">
            <Avatar sx={{ bgcolor: successlight, width: 22, height: 22 }}>
              <IconArrowUpRight width={16} color="#39B69A" />
            </Avatar>
            <Typography variant="subtitle2" fontWeight="600">
              +{courseGrowth}%
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              this month
            </Typography>
          </Stack>
        </Box>

        {/* University Stats */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              sx={{ bgcolor: theme.palette.secondary.main, width: 42, height: 42 }}
            >
              <IconBuilding size="24" />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Universities
              </Typography>
              <Typography variant="h3" fontWeight="700">
                {universityCount}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} mt={1} alignItems="center">
            <Avatar sx={{ bgcolor: successlight, width: 22, height: 22 }}>
              <IconArrowUpRight width={16} color="#39B69A" />
            </Avatar>
            <Typography variant="subtitle2" fontWeight="600">
              +{universityGrowth}%
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              this month
            </Typography>
          </Stack>
        </Box>

        {/* User Stats */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              sx={{ bgcolor: theme.palette.error.main, width: 42, height: 42 }}
            >
              <IconUsers size="24" />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Active Users
              </Typography>
              <Typography variant="h3" fontWeight="700">
                {userCount}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} mt={1} alignItems="center">
            <Avatar sx={{ bgcolor: successlight, width: 22, height: 22 }}>
              <IconArrowUpRight width={16} color="#39B69A" />
            </Avatar>
            <Typography variant="subtitle2" fontWeight="600">
              +{userGrowth}%
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              this month
            </Typography>
          </Stack>
        </Box>
      </Stack>
      
      <Chart options={optionsColumnChart} series={seriesColumnChart} type="area" height="60px" style={{ marginTop: '16px' }} />
    </DashboardCard>
  );
};

export default TotalStats;