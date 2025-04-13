import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import api from '../../api';
import { Task, TaskCreate, TaskUpdate, TaskDetail } from '../../types';

interface TaskState {
  tasks: Task[];
  myTasks: Task[];
  createdTasks: Task[];
  assignedTasks: Task[];
  watchingTasks: Task[];
  currentTask: TaskDetail | null;
  loading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  myTasks: [],
  createdTasks: [],
  assignedTasks: [],
  watchingTasks: [],
  currentTask: null,
  loading: false,
  error: null,
};

export const fetchTasks = createAsyncThunk(
  'tasks/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const tasks = await api.tasks.getAll();
      return tasks;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to fetch tasks';
      return rejectWithValue(message);
    }
  }
);

export const fetchMyTasks = createAsyncThunk(
  'tasks/fetchMyTasks',
  async (_, { rejectWithValue }) => {
    try {
      const tasks = await api.tasks.getMyTasks();
      return tasks;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to fetch your tasks';
      return rejectWithValue(message);
    }
  }
);

export const fetchCreatedTasks = createAsyncThunk(
  'tasks/fetchCreatedTasks',
  async (_, { rejectWithValue }) => {
    try {
      const tasks = await api.tasks.getCreatedTasks();
      return tasks;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to fetch created tasks';
      return rejectWithValue(message);
    }
  }
);

export const fetchAssignedTasks = createAsyncThunk(
  'tasks/fetchAssignedTasks',
  async (_, { rejectWithValue }) => {
    try {
      const tasks = await api.tasks.getAssignedTasks();
      return tasks;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to fetch assigned tasks';
      return rejectWithValue(message);
    }
  }
);

export const fetchWatchingTasks = createAsyncThunk(
  'tasks/fetchWatchingTasks',
  async (_, { rejectWithValue }) => {
    try {
      const tasks = await api.tasks.getWatchingTasks();
      return tasks;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to fetch watching tasks';
      return rejectWithValue(message);
    }
  }
);

export const fetchTaskById = createAsyncThunk(
  'tasks/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      const task = await api.tasks.getById(id);
      return task;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to fetch task';
      return rejectWithValue(message);
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/create',
  async (task: TaskCreate, { rejectWithValue }) => {
    try {
      const newTask = await api.tasks.create(task);
      return newTask;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to create task';
      return rejectWithValue(message);
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ id, task }: { id: number; task: TaskUpdate }, { rejectWithValue }) => {
    try {
      const updatedTask = await api.tasks.update(id, task);
      return updatedTask;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to update task';
      return rejectWithValue(message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.tasks.delete(id);
      return id;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to delete task';
      return rejectWithValue(message);
    }
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch All Tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.tasks = action.payload;
        state.loading = false;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      })
      
      // Fetch My Tasks
      .addCase(fetchMyTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyTasks.fulfilled, (state, action) => {
        state.myTasks = action.payload;
        state.loading = false;
      })
      .addCase(fetchMyTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Created Tasks
      .addCase(fetchCreatedTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCreatedTasks.fulfilled, (state, action) => {
        state.createdTasks = action.payload;
        state.loading = false;
      })
      .addCase(fetchCreatedTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Assigned Tasks
      .addCase(fetchAssignedTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignedTasks.fulfilled, (state, action) => {
        state.assignedTasks = action.payload;
        state.loading = false;
      })
      .addCase(fetchAssignedTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Watching Tasks
      .addCase(fetchWatchingTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWatchingTasks.fulfilled, (state, action) => {
        state.watchingTasks = action.payload;
        state.loading = false;
      })
      .addCase(fetchWatchingTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Task by ID
      .addCase(fetchTaskById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.currentTask = action.payload;
        state.loading = false;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      })
      
      // Create Task
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
        state.loading = false;
        toast.success('Task created successfully');
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      })
      
      // Update Task
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.currentTask = action.payload;
        
        // Update task in all lists
        const updateTaskInList = (list: Task[]) => {
          const index = list.findIndex(task => task.id === action.payload.id);
          if (index !== -1) {
            list[index] = action.payload;
          }
        };
        
        updateTaskInList(state.tasks);
        updateTaskInList(state.myTasks);
        updateTaskInList(state.createdTasks);
        updateTaskInList(state.assignedTasks);
        updateTaskInList(state.watchingTasks);
        
        state.loading = false;
        toast.success('Task updated successfully');
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      })
      
      // Delete Task
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        // Remove task from all lists
        const removeTaskFromList = (list: Task[]) => {
          return list.filter(task => task.id !== action.payload);
        };
        
        state.tasks = removeTaskFromList(state.tasks);
        state.myTasks = removeTaskFromList(state.myTasks);
        state.createdTasks = removeTaskFromList(state.createdTasks);
        state.assignedTasks = removeTaskFromList(state.assignedTasks);
        state.watchingTasks = removeTaskFromList(state.watchingTasks);
        
        state.currentTask = null;
        state.loading = false;
        toast.success('Task deleted successfully');
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      });
  },
});

export default taskSlice.reducer;
