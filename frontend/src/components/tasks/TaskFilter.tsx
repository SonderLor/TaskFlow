import { Form, InputGroup, Row, Col } from 'react-bootstrap';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { TaskStatus } from '../../types';

interface TaskFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: number | null;
  onStatusChange: (status: number | null) => void;
  statuses: TaskStatus[];
}

const TaskFilter = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  statuses,
}: TaskFilterProps) => {
  return (
    <Row>
      <Col md={8}>
        <InputGroup className="mb-3">
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>
          <Form.Control
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </InputGroup>
      </Col>
      <Col md={4}>
        <InputGroup className="mb-3">
          <InputGroup.Text>
            <FaFilter />
          </InputGroup.Text>
          <Form.Select
            value={statusFilter || ''}
            onChange={(e) => onStatusChange(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">All Statuses</option>
            {statuses.map((status) => (
              <option key={status.id} value={status.id}>
                {status.title}
              </option>
            ))}
          </Form.Select>
        </InputGroup>
      </Col>
    </Row>
  );
};

export default TaskFilter;
