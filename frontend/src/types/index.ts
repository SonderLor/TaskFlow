// Auth types
export interface UserLoginData {
    username: string;  // actually email
    password: string;
  }
  
  export interface UserRegisterData {
    email: string;
    username: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }
  
  export interface TokenResponse {
    access_token: string;
    token_type: string;
  }
  
  // User types
  export interface User {
    id: number;
    email: string;
    username: string;
    first_name?: string;
    last_name?: string;
    is_active: boolean;
    is_superuser: boolean;
    created_at: string;
    updated_at?: string;
  }
  
  // Task types
  export interface Task {
    id: number;
    title: string;
    description?: string;
    status_id?: number;
    creator_id?: number;
    created_at: string;
    updated_at?: string;
    creator?: User;
    status?: TaskStatus;
  }
  
  export interface TaskDetail extends Task {
    assignees: User[];
    watchers: User[];
  }
  
  export interface TaskCreate {
    title: string;
    description?: string;
    status_id?: number;
    assignee_ids?: number[];
    watcher_ids?: number[];
  }
  
  export interface TaskUpdate {
    title?: string;
    description?: string;
    status_id?: number;
    assignee_ids?: number[];
    watcher_ids?: number[];
  }
  
  // Status types
  export interface TaskStatus {
    id: number;
    title: string;
    description?: string;
    created_at: string;
    updated_at?: string;
  }
  
  export interface TaskStatusCreate {
    title: string;
    description?: string;
  }
  
  export interface TaskStatusUpdate {
    title?: string;
    description?: string;
  }
  