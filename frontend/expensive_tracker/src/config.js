// Application Config - Trigger Vercel redeployment with correct VITE_API_URL baked in
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://budget-ai-backend-zrff.onrender.com';
