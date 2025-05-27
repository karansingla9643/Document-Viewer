
export interface Document {
  id: string;
  name: string;
  type: 'SOP' | 'Policy';
  department_id: string;
  last_review: Date | null;
  next_review: Date;
  status: 'Current' | 'Overdue' | 'Under Review' | 'Draft';
  description?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface Department {
  id: string;
  name: string;
  color: string;
  created_at: Date;
}

export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface DashboardStats {
  totalPolicies: number;
  totalSOPs: number;
  upcomingReviews: number;
  overdueReviews: number;
}
