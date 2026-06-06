// Route path constants

export const ROUTES = {
  // Public
  HOME: '/',
  ACTIVITIES: '/activities',
  ACTIVITY_DETAIL: '/activities/:id',
  REWARDS: '/rewards',
  LOGIN: '/login',
  REGISTER: '/register',

  // Member
  MEMBER_HOME: '/me',
  MEMBER_EDIT: '/me/edit',
  MEMBER_REGISTRATIONS: '/me/registrations',
  MEMBER_LAUNCHER_APPLY: '/me/launcher-apply',
  POINTS: '/points',
  ORDERS: '/orders',

  // Launcher
  LAUNCHER_ACTIVITIES: '/launcher/activities',
  LAUNCHER_CREATE_ACTIVITY: '/launcher/activities/create',
  LAUNCHER_EDIT_ACTIVITY: '/launcher/activities/:id/edit',
  LAUNCHER_REGISTRATIONS: '/launcher/activities/:id/registrations',

  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_REVIEW: '/admin/review',
  ADMIN_MEMBERS: '/admin/members',
  ADMIN_MEMBER_DETAIL: '/admin/members/:id',
  ADMIN_REWARDS: '/admin/rewards',
  ADMIN_POINTS_RULES: '/admin/points/rules',
  ADMIN_POINTS_TRANSACTIONS: '/admin/points/transactions',
  ADMIN_LEVELS: '/admin/levels',
} as const;
