import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import api from '../../api';
import { TaskStatus, TaskStatusCreate, TaskStatusUpdate } from '../../types';

interface StatusState {
  statuses: TaskStatus[];
  loading: boolean;
  error: string | null;
}

const initialState: StatusState = {
  statuses: [],
  loading: false,
  error: null,
};

export const fetchStatuses = createAsyncThunk(
  'statuses/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const statuses = await api.statuses.getAll();
      return statuses;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to fetch statuses';
      return rejectWithValue(message);
    }
  }
);

export const createStatus = createAsyncThunk(
  'statuses/create',
  async (status: TaskStatusCreate, { rejectWithValue }) => {
    try {
      const newStatus = await api.statuses.create(status);
      return newStatus;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to create status';
      return rejectWithValue(message);
    }
  }
);

export const updateStatus = createAsyncThunk(
  'statuses/update',
  async ({ id, status }: { id: number; status: TaskStatusUpdate }, { rejectWithValue }) => {
    try {
      const updatedStatus = await api.statuses.update(id, status);
      return updatedStatus;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to update status';
      return rejectWithValue(message);
    }
  }
);

export const deleteStatus = createAsyncThunk(
  'statuses/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.statuses.delete(id);
      return id;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to delete status';
      return rejectWithValue(message);
    }
  }
);

const statusSlice = createSlice({
  name: 'statuses',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStatuses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStatuses.fulfilled, (state, action) => {
        state.statuses = action.payload;
        state.loading = false;
      })
      .addCase(fetchStatuses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      .addCase(createStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStatus.fulfilled, (state, action) => {
        state.statuses.push(action.payload);
        state.loading = false;
        toast.success('Status created successfully');
      })
      .addCase(createStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      })
      
      .addCase(updateStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStatus.fulfilled, (state, action) => {
        const index = state.statuses.findIndex(status => status.id === action.payload.id);
        if (index !== -1) {
          state.statuses[index] = action.payload;
        }
        state.loading = false;
        toast.success('Status updated successfully');
      })
      .addCase(updateStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      })
      
      .addCase(deleteStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStatus.fulfilled, (state, action) => {
        state.statuses = state.statuses.filter(status => status.id !== action.payload);
        state.loading = false;
        toast.success('Status deleted successfully');
      })
      .addCase(deleteStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      });
  },
});

export default statusSlice.reducer;
