import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://linkedin-signal-monitor-egerrg.up.railway.app';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const apiKey = localStorage.getItem('api_key');
    if (apiKey) {
      config.headers.Authorization = `Bearer ${apiKey}`;
    }
  }
  return config;
});

// Handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('api_key');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Profile APIs
export const fetchProfiles = async () => {
  const response = await apiClient.get('/profiles');
  return response.data;
};

export const addProfile = async (data: { linkedin_url: string; keywords: string[] }) => {
  const response = await apiClient.post('/profiles', data);
  return response.data;
};

export const updateProfile = async (id: string, data: { keywords: string[] }) => {
  const response = await apiClient.patch(`/profiles/${id}`, data);
  return response.data;
};

export const deleteProfile = async (id: string) => {
  const response = await apiClient.delete(`/profiles/${id}`);
  return response.data;
};

export const testScan = async (data: { linkedin_url: string; keywords: string[] }) => {
  const response = await apiClient.post('/profiles/test-scan', data);
  return response.data;
};

// Event APIs
export const fetchEvents = async (params?: { limit?: number; since?: string }) => {
  const response = await apiClient.get('/events', { params });
  return response.data;
};

export const fetchEventStats = async () => {
  const response = await apiClient.get('/events/stats');
  return response.data;
};

// Billing APIs
export const createSubscription = async (plan: 'basic' | 'business') => {
  const response = await apiClient.post('/billing/create-subscription', { plan });
  return response.data;
};

export const configureWebhook = async (webhook_url: string) => {
  const response = await apiClient.post('/webhook', { webhook_url });
  return response.data;
};

export const removeWebhook = async () => {
  const response = await apiClient.delete('/webhook');
  return response.data;
};

export const triggerScan = async () => {
  const response = await apiClient.post('/scan-now');
  return response.data;
};

// Campaign APIs
export const fetchCampaigns = async () => {
  const response = await apiClient.get('/campaigns');
  return response.data;
};

export const fetchCampaign = async (id: string) => {
  const response = await apiClient.get(`/campaigns/${id}`);
  return response.data;
};

export const createCampaign = async (data: { name: string; description?: string; signal_types: string[] }) => {
  const response = await apiClient.post('/campaigns', data);
  return response.data;
};

export const updateCampaign = async (id: string, data: { name?: string; description?: string; signal_types?: string[]; status?: string }) => {
  const response = await apiClient.patch(`/campaigns/${id}`, data);
  return response.data;
};

export const deleteCampaign = async (id: string) => {
  const response = await apiClient.delete(`/campaigns/${id}`);
  return response.data;
};

export const fetchCampaignSignals = async (id: string, params?: { limit?: number; offset?: number }) => {
  const response = await apiClient.get(`/campaigns/${id}/signals`, { params });
  return response.data;
};

export const addProfilesToCampaign = async (id: string, linkedin_urls: string[]) => {
  const response = await apiClient.post(`/campaigns/${id}/profiles`, { linkedin_urls });
  return response.data;
};

export default apiClient;
