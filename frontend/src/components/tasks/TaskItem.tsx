import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { FaUser } from 'react-icons/fa';
import MarkdownRenderer from '../common/MarkdownRenderer';
import StatusBadge from '../common/StatusBadge';

interface User {
  id: number;
  username: string;
  email?: string;
}

interface Status {
  id: number;
  title: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: Status;
  status_id: number;
  creator: User;
  assignees: User[];
  watchers: User[];
  created_at: string;
  updated_at: string;
}

interface TaskItemProps {
  task: Task;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  return (
    <Card className="mb-3 shadow-sm task-item">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Link to={`/tasks/${task.id}`} className="h5 mb-0 task-title">
            {task.title}
          </Link>
          {task.status && <StatusBadge status={task.status} />}
        </div>
        
        <div className="task-description mb-3">
          {task.description ? (
            <MarkdownRenderer 
              content={task.description} 
              truncate={true} 
              maxLength={200} 
            />
          ) : (
            <p className="text-muted fst-italic">No description provided</p>
          )}
        </div>
        
        <div className="d-flex justify-content-between align-items-center task-meta">
          <div className="task-assignees">
            {task.assignees && task.assignees.length > 0 ? (
              <div className="d-flex align-items-center">
                <small className="text-muted me-2">Assigned to:</small>
                <div className="d-flex">
                  {task.assignees.slice(0, 3).map(assignee => (
                    <div 
                      key={assignee.id} 
                      className="user-avatar-small me-1"
                      title={assignee.username}
                    >
                      {assignee.username.substring(0, 2).toUpperCase()}
                    </div>
                  ))}
                  {task.assignees.length > 3 && (
                    <div className="user-avatar-small bg-secondary">
                      +{task.assignees.length - 3}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <small className="text-muted">Unassigned</small>
            )}
          </div>
          
          <div className="task-info text-end">
            <div className="creator mb-1">
              <small className="text-muted">
                <FaUser className="me-1" size={12} />
                Created by {task.creator?.username}
              </small>
            </div>
            <div className="dates">
              <small className="text-muted">
                {format(new Date(task.created_at), 'MMM dd, yyyy')}
                {task.updated_at && task.updated_at !== task.created_at && (
                  <span> · Updated {format(new Date(task.updated_at), 'MMM dd, yyyy')}</span>
                )}
              </small>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default TaskItem;
