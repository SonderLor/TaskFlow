import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import api from '../../api';
import { UserLoginData, UserRegisterData, TokenResponse, User } from '../../types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: UserLoginData, { rejectWithValue }) => {
    try {
      const response = await api.auth.login(credentials);
      localStorage.setItem('token', response.access_token);
      const userResponse = await api.auth.testToken();
      return { token: response.access_token, user: userResponse };
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to login';
      return rejectWithValue(message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: UserRegisterData, { rejectWithValue }) => {
    try {
      await api.auth.register(userData);
      const loginResponse = await api.auth.login({
        username: userData.email,
        password: userData.password,
      });
      localStorage.setItem('token', loginResponse.access_token);
      const userResponse = await api.auth.testToken();
      return { token: loginResponse.access_token, user: userResponse };
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to register';
      return rejectWithValue(message);
    }
  }
);

export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      if (!localStorage.getItem('token')) {
        return rejectWithValue('No token');
      }
      const userResponse = await api.auth.testToken();
      return { user: userResponse };
    } catch (error: any) {
      localStorage.removeItem('token');
      return rejectWithValue('Authentication failed');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('token');
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<{ token: string; user: User }>) => {
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.loading = false;
        toast.success('Login successful!');
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<{ token: string; user: User }>) => {
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.loading = false;
        toast.success('Registration successful!');
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      })
      // Check Auth Status
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action: PayloadAction<{ user: User }>) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.loading = false;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.loading = false;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        toast.info('You have been logged out');
      });
  },
});

export default authSlice.reducer;
