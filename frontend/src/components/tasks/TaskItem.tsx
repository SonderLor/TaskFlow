import { Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { FaUser, FaClock } from 'react-icons/fa';
import { Task } from '../../types';
import { getStatusBadgeVariant } from '../../utils/taskUtils';

interface TaskItemProps {
  task: Task;
}

const TaskItem = ({ task }: TaskItemProps) => {
  return (
    <Card className="mb-3 shadow-sm task-card">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start">
          <Link to={`/tasks/${task.id}`} className="task-title text-decoration-none">
            <h5 className="mb-1">{task.title}</h5>
          </Link>
          {task.status && (
            <Badge bg={getStatusBadgeVariant(task.status.title)}>
              {task.status.title}
            </Badge>
          )}
        </div>
        <div className="task-description text-muted mb-3">
          {task.description ? (
            task.description.length > 150 
              ? `${task.description.substring(0, 150)}...` 
              : task.description
          ) : (
            <span className="text-muted fst-italic">No description</span>
          )}
        </div>
        <div className="task-meta d-flex align-items-center">
          {task.creator && (
            <span className="me-3 text-muted small">
              <FaUser className="me-1" />
              {task.creator.username}
            </span>
          )}
          <span className="me-3 text-muted small">
            <FaClock className="me-1" />
            {format(new Date(task.created_at), 'MMM dd, yyyy')}
          </span>
        </div>
      </Card.Body>
    </Card>
  );
};

export default TaskItem;
