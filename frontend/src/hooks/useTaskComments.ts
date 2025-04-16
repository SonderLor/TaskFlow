import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

// Типы для комментариев
export interface CommentUser {
  id: number;
  username: string;
}

export interface CommentData {
  id: number;
  task_id: number;
  author_id: number;
  author: CommentUser;
  text: string;
  attachment_path?: string;
  created_at: string;
  updated_at: string;
  mentions: CommentUser[];
  is_edited?: boolean;
}

// Типы для WebSocket сообщений
interface WebSocketMessage {
  type: 'history' | 'new_comment' | 'edit_comment' | 'delete_comment' | 'error' | 'typing';
  data?: any;
  message?: string;
  user_id?: number;
  username?: string;
}

/**
 * Хук для работы с WebSocket комментариями к задаче
 */
export const useTaskComments = (taskId: number) => {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<{[key: number]: string}>({});
  
  const socketRef = useRef<WebSocket | null>(null);
  const typingTimeoutsRef = useRef<{[key: number]: NodeJS.Timeout}>({});
  
  // Получение URL для WebSocket
  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Используем правильный адрес бэкенда
    const apiBaseUrl = 'localhost:8080'; // Замените на ваш реальный адрес бэкенда
    return `${protocol}//${apiBaseUrl}/api/v1/tasks/${taskId}/comments?token=${token}`;
  }, [taskId, token]);
  
  // Создание и управление WebSocket соединением
  useEffect(() => {
    if (!taskId || !token) return;
    
    setIsLoading(true);
    
    const socketUrl = getWebSocketUrl();
    console.log("Connecting to WebSocket:", socketUrl);
    
    const socket = new WebSocket(socketUrl);
    socketRef.current = socket;
    
    socket.onopen = () => {
      console.log("WebSocket connection established");
      setIsConnected(true);
      setError(null);
    };
    
    socket.onclose = (event) => {
      console.log("WebSocket connection closed", event);
      setIsConnected(false);
      if (event.code !== 1000) {
        setError('WebSocket connection closed unexpectedly');
      }
    };
    
    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError('WebSocket connection error');
      setIsConnected(false);
    };
    
    socket.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        
        switch (message.type) {
          case 'history':
            setComments(message.data);
            setIsLoading(false);
            break;
            
          case 'new_comment':
            setComments(prev => [...prev, { ...message.data, is_edited: false }]);
            break;
            
          case 'edit_comment':
            setComments(prev => prev.map(comment => 
              comment.id === message.data.id 
                ? { ...message.data, is_edited: true }
                : comment
            ));
            break;
            
          case 'delete_comment':
            setComments(prev => prev.filter(comment => 
              comment.id !== message.data.comment_id
            ));
            break;
            
          case 'error':
            setError(message.message || 'Unknown error');
            break;
            
          case 'typing':
            if (message.user_id && message.username) {
              setTypingUsers(prev => ({
                ...prev,
                [message.user_id!]: message.username!
              }));
              
              // Очищаем предыдущий таймаут
              if (typingTimeoutsRef.current[message.user_id]) {
                clearTimeout(typingTimeoutsRef.current[message.user_id]);
              }
              
              // Устанавливаем новый таймаут
              typingTimeoutsRef.current[message.user_id] = setTimeout(() => {
                setTypingUsers(prev => {
                  const newState = { ...prev };
                  delete newState[message.user_id!];
                  return newState;
                });
              }, 3000);
            }
            break;
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
        setError('Failed to process message from server');
      }
    };
    
    return () => {
      console.log("Cleaning up WebSocket connection");
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [taskId, token, getWebSocketUrl]);
  
  // Функция для отправки нового комментария
  const sendComment = useCallback((text: string, mention_ids: number[] = []) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      setError('WebSocket connection not available');
      return false;
    }
    
    try {
      socketRef.current.send(JSON.stringify({
        text,
        mention_ids
      }));
      return true;
    } catch (err) {
      console.error('Failed to send comment:', err);
      setError('Failed to send comment');
      return false;
    }
  }, []);
  
  // Функция для редактирования комментария
  const editComment = useCallback((comment_id: number, text: string, mention_ids: number[] = []) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      setError('WebSocket connection not available');
      return false;
    }
    
    try {
      socketRef.current.send(JSON.stringify({
        type: "edit_comment",
        comment_id,
        text,
        mention_ids
      }));
      return true;
    } catch (err) {
      console.error('Failed to edit comment:', err);
      setError('Failed to edit comment');
      return false;
    }
  }, []);
  
  // Функция для удаления комментария
  const deleteComment = useCallback((comment_id: number) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      setError('WebSocket connection not available');
      return false;
    }
    
    try {
      socketRef.current.send(JSON.stringify({
        type: "delete_comment",
        comment_id
      }));
      return true;
    } catch (err) {
      console.error('Failed to delete comment:', err);
      setError('Failed to delete comment');
      return false;
    }
  }, []);
  
  // Функция для отправки уведомления о печати
  const sendTypingNotification = useCallback(() => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    
    try {
      socketRef.current.send(JSON.stringify({
        type: "typing"
      }));
    } catch (err) {
      console.error('Failed to send typing notification:', err);
    }
  }, []);
  
  return {
    comments,
    isConnected,
    isLoading,
    error,
    sendComment,
    editComment,
    deleteComment,
    typingUsers,
    sendTypingNotification
  };
};
