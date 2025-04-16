import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TasksPage from './pages/TasksPage';
import TaskDetailPage from './pages/TaskDetailPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import { checkAuthStatus } from './store/slices/authSlice';
import { RootState, AppDispatch } from './store';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  // Сохраняем текущий путь в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('lastPath', location.pathname);
  }, [location]);

  // Восстанавливаем последний путь при загрузке приложения
  useEffect(() => {
    const savedPath = localStorage.getItem('lastPath');
    if (savedPath && window.location.pathname === '/') {
      navigate(savedPath);
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/tasks" />} />
        <Route path="register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/tasks" />} />

        <Route path="tasks" element={<ProtectedRoute />}>
          <Route index element={<TasksPage />} />
          <Route path=":taskId" element={<TaskDetailPage />} />
          <Route path="create" element={<TaskDetailPage isCreating />} />
        </Route>

        <Route path="profile" element={<ProtectedRoute />}>
          <Route index element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
