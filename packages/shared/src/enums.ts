// Enums from DATABASE_SCHEMA.md §13 — single source of truth

export const UserRole = {
  MEMBER: 'MEMBER',
  LAUNCHER: 'LAUNCHER',
  ADMIN: 'ADMIN',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  DEACTIVATING: 'DEACTIVATING',
  DELETED: 'DELETED',
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  UNKNOWN: 'UNKNOWN',
} as const;
export type Gender = (typeof Gender)[keyof typeof Gender];

export const ActivityState = {
  DRAFT: 'DRAFT',
  PENDING_REVIEW: 'PENDING_REVIEW',
  PUBLISHED: 'PUBLISHED',
  REGISTRATION_OPEN: 'REGISTRATION_OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  ENDED: 'ENDED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
} as const;
export type ActivityState = (typeof ActivityState)[keyof typeof ActivityState];

export const RegistrationState = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
} as const;
export type RegistrationState = (typeof RegistrationState)[keyof typeof RegistrationState];

export const ApplicationStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;
export type ApplicationStatus = (typeof ApplicationStatus)[keyof typeof ApplicationStatus];

export const PointsType = {
  GROWTH: 'GROWTH',
  EXCHANGE: 'EXCHANGE',
  BOTH: 'BOTH',
} as const;
export type PointsType = (typeof PointsType)[keyof typeof PointsType];

export const RewardStatus = {
  ON_SHELF: 'ON_SHELF',
  OFF_SHELF: 'OFF_SHELF',
} as const;
export type RewardStatus = (typeof RewardStatus)[keyof typeof RewardStatus];

export const OrderState = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  FULFILLED: 'FULFILLED',
} as const;
export type OrderState = (typeof OrderState)[keyof typeof OrderState];

export const NotificationType = {
  ACTIVITY_REVIEW: 'ACTIVITY_REVIEW',
  LAUNCHER_REVIEW: 'LAUNCHER_REVIEW',
  REGISTRATION_REVIEW: 'REGISTRATION_REVIEW',
  ACTIVITY_CANCELLED: 'ACTIVITY_CANCELLED',
  POINTS: 'POINTS',
  SYSTEM: 'SYSTEM',
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

// Additional enums from table definitions

export const ActivityCategory = {
  CO_LEARNING: 'CO_LEARNING',
  READING: 'READING',
  SHARING: 'SHARING',
  TRAINING: 'TRAINING',
  OFFLINE: 'OFFLINE',
  CO_BUILDING: 'CO_BUILDING',
  SUBMISSION: 'SUBMISSION',
} as const;
export type ActivityCategory = (typeof ActivityCategory)[keyof typeof ActivityCategory];

export const RewardCategory = {
  TOOL: 'TOOL',
  MERCHANDISE: 'MERCHANDISE',
  SERVICE: 'SERVICE',
  MEMBER_PRIVILEGE: 'MEMBER_PRIVILEGE',
} as const;
export type RewardCategory = (typeof RewardCategory)[keyof typeof RewardCategory];

export const BadgeConditionType = {
  COUNT: 'COUNT',
  STREAK: 'STREAK',
  LEVEL: 'LEVEL',
  MANUAL: 'MANUAL',
} as const;
export type BadgeConditionType = (typeof BadgeConditionType)[keyof typeof BadgeConditionType];
