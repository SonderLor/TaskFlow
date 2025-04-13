import { Badge } from 'react-bootstrap';
import { TaskStatus } from '../../types';
import { getStatusBadgeVariant } from '../../utils/taskUtils';

interface StatusBadgeProps {
  status: TaskStatus;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  return (
    <Badge bg={getStatusBadgeVariant(status.title)}>
      {status.title}
    </Badge>
  );
};

export default StatusBadge;
