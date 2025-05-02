import {
  IconAperture, IconCopy, IconLayoutDashboard, IconLogin, IconMoodHappy, IconTypography, IconUserPlus
} from '@tabler/icons-react';

import { uniqueId } from 'lodash';

const Menuitems = [
  {
    navlabel: true,
    subheader: 'Home',
  },

  {
    id: uniqueId(),
    title: 'Dashboard',
    icon: IconLayoutDashboard,
    href: '/dashboard',
  },
  {
    navlabel: true,
    subheader: 'CRUD',
  },
  {
    id: uniqueId(),
    title: 'University',
    icon: IconTypography,
    href: '/universities',
  },
  {
    id: uniqueId(),
    title: 'Course',
    icon: IconCopy,
    href: '/courses',
  },
  {
    id: uniqueId(),
    title: 'Scholarship',
    icon: IconCopy,
    href: '/scholarships',
  },
];

export default Menuitems;
