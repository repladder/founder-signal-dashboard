export interface User {
  id: string;
  email: string;
  api_key: string;
  plan: 'free' | 'basic' | 'business';
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  linkedin_url: string;
  keywords: string[];
  last_post_timestamp: string | null;
  next_scan_at: string;
  created_at: string;
}

export interface Event {
  id: string;
  profile_id: string;
  keyword: string;
  post_url: string;
  post_date: string;
  snippet: string;
  detected_at: string;
  profile: {
    id: string;
    linkedin_url: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DashboardStats {
  profiles: number;
  profileLimit: number;
  signalsLast7Days: number;
  plan: string;
}

export interface TestScanResult {
  success: boolean;
  message: string;
  linkedin_url: string;
  keywords: string[];
  posts_found: number;
  matches_found: number;
  matches: Array<{
    post_url: string;
    post_date: string;
    post_text: string;
    snippet: string;
    matched_keywords: string[];
  }>;
  all_posts: Array<{
    post_url: string;
    post_date: string;
    snippet: string;
  }>;
}

export const SIGNAL_TEMPLATES = {
  funding: ['funding', 'raised', 'series', 'investment', 'investors'],
  hiring: ['hiring', 'job opening', 'join our team', 'looking for', 'career'],
  launch: ['launched', 'announcing', 'introducing', 'release', 'available now'],
  expansion: ['expansion', 'new office', 'scaling', 'growing team', 'international'],
} ;

export type SignalTemplate = keyof typeof SIGNAL_TEMPLATES;
