import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://web-production-800b5.up.railway.app/api',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(new RegExp('(^| )admin_token=([^;]+)'));
    if (match) {
      config.headers.Authorization = `Bearer ${match[2]}`;
    }
  }
  return config;
});

export interface Donation {
  id: string;
  donorName: string;
  amount: string;
  type: 'in' | 'out';
  category: string;
  description: string;
  createdAt: string;
}

export interface Summary {
  totalIn: number;
  totalOut: number;
  balance: number;
  transactions: number;
}

export interface Block {
  id: string;
  blockIndex: number;
  previousHash: string;
  hash: string;
  data: object;
  action: string;
  actor: string;
  createdAt: string;
}

export const donationsApi = {
  getAll: (filters?: any) => api.get<Donation[]>('/donations', { params: filters }),
  getById: (id: string) => api.get<{ donation: Donation; block: Block | null }>(`/donations/${id}`),
  getSummary: () => api.get<Summary>('/donations/summary'),
  getAudit: () => api.get<Block[]>('/donations/audit'),
  getVerify: () => api.get<{ valid: boolean; brokenAt?: number }>('/donations/verify'),
  create: (data: {
    donorName: string;
    amount: number;
    type: 'in' | 'out';
    category: string;
    description: string;
  }) => api.post<Donation>('/donations', data),
};