export type Role = "USER" | "ADMIN";

export type PlanTier = "BASIC" | "PRO" | "PREMIUM";

export type SubscriptionStatus = "ACTIVE" | "CANCELLED" | "EXPIRED" | "PAST_DUE";

export type TrialStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";

export type ToolCategory =
  | "AI"
  | "IMAGE"
  | "VIDEO"
  | "PDF"
  | "DEVELOPER"
  | "PRODUCTIVITY"
  | "UTILITIES";

export type JobStatus =
  | "PENDING"
  | "QUEUED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export interface PlanConfig {
  id: PlanTier;
  title: string;
  price: number; // In INR
  currency: string;
  interval: "monthly" | "yearly";
  description: string;
  aiLimit: number; // requests/month
  fileUploadLimitMb: number; // Max file size MB
  videoLimitMin: number; // minutes or count
  storageLimitMb: number; // total storage MB
  features: string[];
  popular?: boolean;
}

export interface ToolDefinition {
  slug: string;
  name: string;
  category: ToolCategory;
  description: string;
  planRequired: PlanTier;
  icon: string;
  isFeatured?: boolean;
  tags: string[];
  apiEndpoint?: string;
  restrictedToAdmin?: boolean;
}

export interface TrialInfo {
  isActive: boolean;
  daysRemaining: number;
  startDate: Date;
  endDate: Date;
  status: TrialStatus;
}
