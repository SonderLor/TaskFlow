import { useState, useEffect } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { FaPaperPlane } from 'react-icons/fa';
import { format } from 'date-fns';
import { RootState } from '../../store';

interface TaskCommentsProps {
  taskId: number;
}

// Mock comment structure for now - to be replaced with WebSocket integration
interface Comment {
  id: number;
  content: string;
  created_at: string;
  user: {
    id: number;
    username: string;
  };
}

const TaskComments = ({ taskId }: TaskCommentsProps) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Placeholder for WebSocket connection
  useEffect(() => {
    // This will be replaced with WebSocket code
    // For now, let's use mock data
    const mockComments: Comment[] = [
      {
        id: 1,
        content: 'This is a placeholder comment. WebSocket integration is coming soon!',
        created_at: new Date().toISOString(),
        user: {
          id: 1,
          username: 'demo_user',
        },
      },
    ];
    
    setComments(mockComments);
    
    // WebSocket cleanup will go here
    return () => {
      // Close WebSocket connection
    };
  }, [taskId]);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    // Mock adding a comment (to be replaced with WebSocket)
    const comment: Comment = {
      id: Date.now(), // temporary id
      content: newComment,
      created_at: new Date().toISOString(),
      user: {
        id: user?.id || 0,
        username: user?.username || 'Unknown',
      },
    };
    
    setComments([...comments, comment]);
    setNewComment('');
  };

  return (
    <Card className="shadow-sm">
      <Card.Header>Comments</Card.Header>
      <Card.Body>
        {error && (
          <Alert variant="danger">
            {error}
          </Alert>
        )}
        
        <div className="comments-list mb-4">
          {comments.length > 0 ? (
            comments.map(comment => (
              <div key={comment.id} className="comment mb-3">
                <div className="d-flex align-items-start">
                  <div className="avatar-placeholder me-2">
                    {comment.user.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="comment-content">
                    <div className="d-flex align-items-center mb-1">
                      <strong className="me-2">{comment.user.username}</strong>
                      <small className="text-muted">
                        {format(new Date(comment.created_at), 'MMM dd, yyyy HH:mm')}
                      </small>
                    </div>
                    <div>{comment.content}</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted">No comments yet. Be the first to comment!</p>
          )}
        </div>
        
        <Form onSubmit={handleSubmitComment}>
          <Form.Group className="mb-3">
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={loading}
            />
          </Form.Group>
          <div className="d-flex justify-content-end">
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !newComment.trim()}
            >
              <FaPaperPlane className="me-2" />
              {loading ? 'Sending...' : 'Add Comment'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default TaskComments;
