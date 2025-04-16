import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { format } from 'date-fns';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import { CommentData } from '../../hooks/useTaskComments';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface CommentItemProps {
  comment: CommentData;
  onEdit: (id: number, text: string, mentions: number[]) => void;
  onDelete: (id: number) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onEdit, onDelete }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  
  // Проверяем, может ли пользователь редактировать/удалять комментарий
  const canModify = user && (user.id === comment.author_id || user.is_superuser);
  
  const handleSaveEdit = () => {
    if (editText.trim()) {
      onEdit(comment.id, editText, comment.mentions.map(m => m.id));
      setIsEditing(false);
    }
  };
  
  const handleCancelEdit = () => {
    setEditText(comment.text);
    setIsEditing(false);
  };
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      onDelete(comment.id);
    }
  };
  
  return (
    <div className="comment-item mb-3">
      <div className="d-flex">
        <div className="user-avatar me-2">
          {comment.author.username.substring(0, 2).toUpperCase()}
        </div>
        <div className="comment-content w-100">
          <div className="comment-header d-flex justify-content-between align-items-center">
            <strong>{comment.author.username}</strong>
            <div className="d-flex align-items-center">
              <small className="text-muted me-2">
                {format(new Date(comment.created_at), 'MMM dd, yyyy HH:mm')}
              </small>
              
              {canModify && !isEditing && (
                <div className="comment-actions">
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="text-secondary p-0 me-2"
                    onClick={() => setIsEditing(true)} 
                    title="Edit comment"
                  >
                    <FaEdit />
                  </Button>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="text-danger p-0"
                    onClick={handleDelete}
                    title="Delete comment"
                  >
                    <FaTrash />
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {isEditing ? (
            <>
              <Form.Group className="mt-2 mb-2">
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="comment-edit-textarea"
                />
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="me-2"
                  onClick={handleCancelEdit}
                >
                  <FaTimes className="me-1" /> Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={!editText.trim()}
                >
                  <FaSave className="me-1" /> Save
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="comment-text mt-1">{comment.text}</div>
              
              {comment.mentions && comment.mentions.length > 0 && (
                <div className="comment-mentions mt-1">
                  <small className="text-muted">
                    Mentions:{' '}
                    {comment.mentions.map(user => (
                      <span key={user.id} className="badge bg-secondary me-1">
                        @{user.username}
                      </span>
                    ))}
                  </small>
                </div>
              )}
              
              {comment.is_edited && (
                <small className="text-muted d-block mt-1 fst-italic">
                  (edited {format(new Date(comment.updated_at), 'MMM dd, yyyy HH:mm')})
                </small>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
