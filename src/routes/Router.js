import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import Loadable from '../layouts/full/shared/loadable/Loadable';
import ProtectedRoute from './ProtectedRoute';

/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

/* ****Pages***** */
const Dashboard = Loadable(lazy(() => import('../views/dashboard/Dashboard')))
const RealtimeMonitor = Loadable(lazy(() => import('../views/dashboard/components/RealtimeMonitor')))
const UniversityPage = Loadable(lazy(() => import('../views/crud/UniversityPage')))
const CoursePage = Loadable(lazy(() => import('../views/crud/CoursePage')))
const ScholarshipPage = Loadable(lazy(() => import('../views/crud/ScholarshipPage')))
const AdminPage = Loadable(lazy(() => import('../views/crud/AdminPage')));
const SamplePage = Loadable(lazy(() => import('../views/sample-page/SamplePage')))
const Icons = Loadable(lazy(() => import('../views/icons/Icons')))
const TypographyPage = Loadable(lazy(() => import('../views/utilities/TypographyPage')))
const Shadow = Loadable(lazy(() => import('../views/utilities/Shadow')))
const Error = Loadable(lazy(() => import('../views/authentication/Error')));
const Register = Loadable(lazy(() => import('../views/authentication/Register')));
const Login = Loadable(lazy(() => import('../views/authentication/Login')));

const Router = [
  {
    path: '/',
    element: <ProtectedRoute />, // Protect all routes under FullLayout
    children: [
      {
        path: '/',
        element: <FullLayout />,
        children: [
          { path: '/', element: <Navigate to="/dashboard" /> },
          { path: '/dashboard', exact: true, element: <Dashboard /> },
          { path: '/dashboard/realtime', element: <RealtimeMonitor /> },

          // CRUD Routes
          { path: '/universities', exact: true, element: <UniversityPage /> },
          { path: '/courses', exact: true, element: <CoursePage /> },
          { path: '/scholarships', exact: true, element: <ScholarshipPage /> },
          { path: '/admin', exact: true, element: <AdminPage /> },


          // Original routes
          { path: '/sample-page', exact: true, element: <SamplePage /> },
          { path: '/icons', exact: true, element: <Icons /> },
          { path: '/ui/typography', exact: true, element: <TypographyPage /> },
          { path: '/ui/shadow', exact: true, element: <Shadow /> },
          { path: '*', element: <Navigate to="/auth/404" /> },
        ],
      }
    ]
  },
  {
    path: '/auth',
    element: <BlankLayout />,
    children: [
      { path: '404', element: <Error /> },
      { path: '/auth/register', element: <Register /> },
      { path: '/auth/login', element: <Login /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
];

export default Router;