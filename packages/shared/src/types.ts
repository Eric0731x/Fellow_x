import type {
  UserRole,
  UserStatus,
  Gender,
  ActivityState,
  RegistrationState,
  ApplicationStatus,
  PointsType,
  RewardStatus,
  OrderState,
  NotificationType,
  ActivityCategory,
  RewardCategory,
  BadgeConditionType,
} from './enums';

// API response envelope
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Auth
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// User
export interface User {
  id: string;
  memberNo: string;
  phone: string;
  name: string;
  avatarUrl: string | null;
  gender: Gender;
  birthday: string | null;
  email: string | null;
  role: UserRole;
  status: UserStatus;
  levelId: number;
  growthPoints: number;
  exchangePoints: number;
  participationDays: number;
  streakDays: number;
  profileCompleted: boolean;
  profilePromptSkipped: boolean;
  deactivateAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Level
export interface Level {
  id: number;
  name: string;
  minGrowthPoints: number;
  privileges: string | null;
  canApplyLauncher: boolean;
}

// Activity
export interface Activity {
  id: string;
  launcherId: string;
  title: string;
  category: ActivityCategory;
  summary: string;
  content: string | null;
  location: string;
  coverImageUrl: string | null;
  state: ActivityState;
  minLevelId: number | null;
  maxParticipants: number;
  approvedCount: number;
  startTime: string | null;
  endTime: string | null;
  registrationDeadline: string | null;
  rejectReason: string | null;
  reviewedBy: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Registration
export interface Registration {
  id: string;
  activityId: string;
  userId: string;
  state: RegistrationState;
  contact: string | null;
  note: string | null;
  rejectReason: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Point Rule
export interface PointRule {
  code: string;
  description: string;
  pointsType: PointsType;
  amount: number | null;
  enabled: boolean;
  isSystem: boolean;
}

// Point Log
export interface PointLog {
  id: string;
  userId: string;
  pointsType: PointsType;
  amount: number;
  balanceAfter: number;
  ruleCode: string | null;
  title: string;
  refType: string | null;
  refId: string | null;
  operatorId: string | null;
  reason: string | null;
  createdAt: string;
}

// Reward
export interface Reward {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  category: RewardCategory;
  cost: number;
  stock: number;
  redeemedCount: number;
  status: RewardStatus;
  createdAt: string;
  updatedAt: string;
}

// Reward Order
export interface RewardOrder {
  id: string;
  userId: string;
  rewardId: string;
  cost: number;
  state: OrderState;
  pointLogId: string | null;
  fulfillmentNote: string | null;
  createdAt: string;
  updatedAt: string;
}

// Launcher Application
export interface LauncherApplication {
  id: string;
  userId: string;
  description: string;
  status: ApplicationStatus;
  rejectReason: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Notification
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string | null;
  refType: string | null;
  refId: string | null;
  isRead: boolean;
  createdAt: string;
}

// Badge
export interface Badge {
  id: string;
  code: string;
  name: string;
  icon: string;
  hint: string;
  conditionType: BadgeConditionType;
  threshold: number | null;
}

// Points Summary
export interface PointsSummary {
  growthPoints: number;
  exchangePoints: number;
  level: Level;
  nextLevel: Level | null;
  progress: number;
}
