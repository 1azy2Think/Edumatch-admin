import {
  IconCopy, IconLayoutDashboard, IconSchool, IconAward,
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
    icon: IconSchool,
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
    icon: IconAward,
    href: '/scholarships',
  },
];

export default Menuitems;
