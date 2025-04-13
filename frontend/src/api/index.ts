import axios from 'axios';
import { UserLoginData, UserRegisterData, TokenResponse, User, Task, TaskStatus, TaskCreate, TaskUpdate } from '../types';

const API_URL = 'http://localhost:8080/api/v1';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to request if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const api = {
  auth: {
    login: async (credentials: UserLoginData): Promise<TokenResponse> => {
      const formData = new URLSearchParams();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);
      
      const response = await apiClient.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response.data;
    },
    register: async (userData: UserRegisterData): Promise<void> => {
      await apiClient.post('/auth/register', userData);
    },
    testToken: async (): Promise<User> => {
      const response = await apiClient.post('/auth/test-token');
      return response.data;
    },
  },
  tasks: {
    getAll: async (): Promise<Task[]> => {
      const response = await apiClient.get('/tasks/');
      return response.data;
    },
    getMyTasks: async (): Promise<Task[]> => {
      const response = await apiClient.get('/tasks/me');
      return response.data;
    },
    getCreatedTasks: async (): Promise<Task[]> => {
      const response = await apiClient.get('/tasks/created');
      return response.data;
    },
    getAssignedTasks: async (): Promise<Task[]> => {
      const response = await apiClient.get('/tasks/assigned');
      return response.data;
    },
    getWatchingTasks: async (): Promise<Task[]> => {
      const response = await apiClient.get('/tasks/watching');
      return response.data;
    },
    getById: async (id: number): Promise<Task> => {
      const response = await apiClient.get(`/tasks/${id}`);
      return response.data;
    },
    create: async (task: TaskCreate): Promise<Task> => {
      const response = await apiClient.post('/tasks/', task);
      return response.data;
    },
    update: async (id: number, task: TaskUpdate): Promise<Task> => {
      const response = await apiClient.put(`/tasks/${id}`, task);
      return response.data;
    },
    delete: async (id: number): Promise<void> => {
      await apiClient.delete(`/tasks/${id}`);
    },
  },
  statuses: {
    getAll: async (): Promise<TaskStatus[]> => {
      const response = await apiClient.get('/statuses/');
      return response.data;
    },
    getById: async (id: number): Promise<TaskStatus> => {
      const response = await apiClient.get(`/statuses/${id}`);
      return response.data;
    },
    create: async (status: any): Promise<TaskStatus> => {
      const response = await apiClient.post('/statuses/', status);
      return response.data;
    },
    update: async (id: number, status: any): Promise<TaskStatus> => {
      const response = await apiClient.put(`/statuses/${id}`, status);
      return response.data;
    },
    delete: async (id: number): Promise<void> => {
      await apiClient.delete(`/statuses/${id}`);
    },
  },
  users: {
    getAll: async (): Promise<User[]> => {
      const response = await apiClient.get('/users/');
      return response.data;
    },
    getMe: async (): Promise<User> => {
      const response = await apiClient.get('/users/me');
      return response.data;
    },
    update: async (userData: any): Promise<User> => {
      const response = await apiClient.put('/users/me', userData);
      return response.data;
    },
  },
};

export default api;
