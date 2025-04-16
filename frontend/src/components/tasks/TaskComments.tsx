import React, { useState, useRef, useEffect } from 'react';
import { Card, Form, Button, Alert, Spinner, Dropdown } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { FaPaperPlane, FaUserTag, FaArrowDown } from 'react-icons/fa';
import { RootState } from '../../store';
import { useTaskComments } from '../../hooks/useTaskComments';
import CommentItem from './CommentItem';

interface TaskCommentsProps {
  taskId: number;
}

const TaskComments = ({ taskId }: TaskCommentsProps) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { users } = useSelector((state: RootState) => state.users);
  const [newComment, setNewComment] = useState('');
  const [mentionIds, setMentionIds] = useState<number[]>([]);
  const [selectedMentions, setSelectedMentions] = useState<{id: number, username: string}[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  
  const { 
    comments, 
    isConnected, 
    isLoading, 
    error, 
    sendComment, 
    editComment,
    deleteComment,
    typingUsers, 
    sendTypingNotification 
  } = useTaskComments(taskId);
  
  // Скроллим контейнер комментариев только при первой загрузке
  useEffect(() => {
    if (comments.length > 0 && !isLoading && commentsContainerRef.current) {
      // Скроллим вниз при начальной загрузке
      commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
    }
  }, [comments.length, isLoading]);
  
  // Обработчик прокрутки для показа кнопки "scroll to bottom"
  useEffect(() => {
    const handleScroll = () => {
      if (!commentsContainerRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = commentsContainerRef.current;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      
      // Показываем кнопку, если пользователь прокрутил вверх больше чем на 100px от нижней границы
      setShowScrollToBottom(distanceFromBottom > 100);
    };
    
    const container = commentsContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);
  
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    if (!newComment.trim()) return;
    
    try {
      const success = sendComment(newComment, mentionIds);
      
      if (success) {
        setNewComment('');
        setMentionIds([]);
        setSelectedMentions([]);
        
        // Скроллим вниз только когда сами отправляем сообщение
        setTimeout(() => {
          if (commentsContainerRef.current) {
            commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
          }
        }, 100); // Небольшая задержка, чтобы сообщение успело добавиться
      } else {
        setSubmitError('Failed to send comment. Please try again.');
      }
    } catch (err) {
      console.error('Error sending comment:', err);
      setSubmitError('An error occurred while sending your comment.');
    }
  };
  
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(e.target.value);
    sendTypingNotification();
  };
  
  // Функция для добавления упоминаний
  const handleAddMention = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user && !mentionIds.includes(userId)) {
      setMentionIds([...mentionIds, userId]);
      setSelectedMentions([...selectedMentions, { id: user.id, username: user.username }]);
    }
  };

  // Функция для удаления упоминания
  const handleRemoveMention = (userId: number) => {
    setMentionIds(mentionIds.filter(id => id !== userId));
    setSelectedMentions(selectedMentions.filter(user => user.id !== userId));
  };
  
  // Скролл к последним комментариям
  const scrollToBottom = () => {
    if (commentsContainerRef.current) {
      commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
      setShowScrollToBottom(false);
    }
  };
  
  // Обработчики редактирования и удаления комментариев
  const handleEditComment = (id: number, text: string, mentions: number[]) => {
    editComment(id, text, mentions);
  };
  
  const handleDeleteComment = (id: number) => {
    deleteComment(id);
  };
  
  if (!user) {
    return (
      <Card className="shadow-sm">
        <Card.Header>Comments</Card.Header>
        <Card.Body>
          <Alert variant="warning">
            You need to be logged in to view comments.
          </Alert>
        </Card.Body>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <span>Comments</span>
        {isConnected ? (
          <span className="badge bg-success">Connected</span>
        ) : (
          <span className="badge bg-danger">Disconnected</span>
        )}
      </Card.Header>
      
      <Card.Body>
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}
        
        {submitError && (
          <Alert variant="warning" className="mb-3" dismissible onClose={() => setSubmitError(null)}>
            {submitError}
          </Alert>
        )}
        
        <div className="position-relative">
          <div 
            className="comments-container mb-3" 
            style={{ 
              height: '350px', 
              maxHeight: '350px', 
              overflowY: 'auto',
              padding: '10px'
            }}
            ref={commentsContainerRef}
          >
            {isLoading ? (
              <div className="text-center p-3">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            ) : comments.length > 0 ? (
              <>
                {comments.map(comment => (
                  <CommentItem 
                    key={comment.id} 
                    comment={comment} 
                    onEdit={handleEditComment}
                    onDelete={handleDeleteComment}
                  />
                ))}
              </>
            ) : (
              <p className="text-center text-muted">No comments yet. Be the first to comment!</p>
            )}
          </div>
          
          {/* Кнопка прокрутки вниз */}
          {showScrollToBottom && (
            <Button 
              variant="secondary" 
              size="sm" 
              className="scroll-to-bottom-btn"
              onClick={scrollToBottom}
              style={{
                position: 'absolute', 
                bottom: '15px', 
                right: '15px',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}
            >
              <FaArrowDown />
            </Button>
          )}
        </div>
        
        {Object.keys(typingUsers).length > 0 && (
          <div className="typing-indicator mb-2 text-muted">
            <em>
              {Object.values(typingUsers).join(', ')} {Object.keys(typingUsers).length === 1 ? 'is' : 'are'} typing...
            </em>
          </div>
        )}
        
        <Form onSubmit={handleSubmitComment}>
          <div className="d-flex mb-2">
            <Dropdown show={showMentions} onToggle={setShowMentions}>
              <Dropdown.Toggle variant="outline-secondary" id="dropdown-mentions" size="sm">
                <FaUserTag /> Mention
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {users
                  .filter(u => !mentionIds.includes(u.id))
                  .map(user => (
                    <Dropdown.Item 
                      key={user.id} 
                      onClick={() => handleAddMention(user.id)}
                    >
                      {user.username}
                    </Dropdown.Item>
                  ))}
              </Dropdown.Menu>
            </Dropdown>
            
            <div className="ms-2 d-flex flex-wrap">
              {selectedMentions.map(user => (
                <span key={user.id} className="badge bg-secondary me-1 mb-1">
                  @{user.username}
                  <button 
                    type="button" 
                    className="btn-close btn-close-white ms-1" 
                    style={{ fontSize: '0.5rem' }}
                    onClick={() => handleRemoveMention(user.id)}
                  ></button>
                </span>
              ))}
            </div>
          </div>
          
          <Form.Group className="mb-3">
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Write a comment..."
              value={newComment}
              onChange={handleCommentChange}
              disabled={!isConnected}
              className="custom-textarea"
            />
          </Form.Group>
          <div className="d-flex justify-content-end">
            <Button
              type="submit"
              variant="primary"
              disabled={!isConnected || !newComment.trim()}
            >
              <FaPaperPlane className="me-2" />
              {isConnected ? 'Add Comment' : 'Connecting...'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default TaskComments;
