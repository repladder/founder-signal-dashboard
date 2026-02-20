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
  funding: [
    'raised',
    'seed round',
    'series a',
    'series b',
    'series c',
    'funding',
    'backed by',
    'venture',
    'investors',
    'investment',
    'closing our'
  ],
  hiring_sales: [
    'hiring sdr',
    'hiring ae',
    'building sales team',
    'first sales hire',
    'business development',
    'account executive',
    'sales development',
    'looking for sales',
    'join our sales team',
    'sales manager',
    'head of sales'
  ],
  hiring: [
    'we are hiring',
    'we\'re hiring',
    'join our team',
    'looking for',
    'open positions',
    'now hiring',
    'come work',
    'join us',
    'hiring for',
    'seeking',
    'recruiting',
    'job opening',
    'career opportunity',
    'grow our team',
    'expanding our team'
  ],
  new_role: [
    'excited to announce',
    'thrilled to share',
    'happy to share',
    'pleased to announce',
    'starting my new',
    'joined',
    'joining',
    'new role',
    'new position',
    'new chapter',
    'accepted a position',
    'accepted an offer',
    'stepping into',
    'transition to',
    'moving to'
  ],
  launch: [
    'launching',
    'now live',
    'beta',
    'new product',
    'introducing',
    'excited to announce',
    'just launched',
    'available now',
    'officially live',
    'proud to announce'
  ],
  expansion: [
    'expanding to',
    'entering market',
    'scaling operations',
    'growing team',
    'new office',
    'international expansion',
    'opening office',
    'global expansion',
    'new market'
  ],
  track_all: [
    // Funding
    'raised',
    'seed round',
    'series a',
    'series b',
    'series c',
    'funding',
    'backed by',
    'venture',
    'investors',
    // Sales Hiring
    'hiring sdr',
    'hiring ae',
    'building sales team',
    'first sales hire',
    'account executive',
    // General Hiring
    'we\'re hiring',
    'join our team',
    'open positions',
    'now hiring',
    'recruiting',
    // New Role
    'excited to announce',
    'starting my new',
    'joined',
    'joining',
    'new role',
    'new position',
    // Launch
    'launching',
    'just launched',
    'now live',
    'introducing',
    // Expansion
    'expanding to',
    'new office',
    'entering market',
    'global expansion'
  ],
};

export type SignalTemplate = keyof typeof SIGNAL_TEMPLATES;
