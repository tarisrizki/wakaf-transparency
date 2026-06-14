import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://web-production-800b5.up.railway.app/api',
  timeout: 10000,
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
  getAll: () => api.get<Donation[]>('/donations'),
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