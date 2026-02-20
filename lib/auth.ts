export const setApiKey = (apiKey: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('api_key', apiKey);
  }
};

export const getApiKey = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('api_key');
  }
  return null;
};

export const removeApiKey = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('api_key');
  }
};

export const isAuthenticated = (): boolean => {
  return !!getApiKey();
};
