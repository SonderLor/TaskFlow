import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner, Badge, Dropdown } from 'react-bootstrap';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaSave, FaTrash, FaArrowLeft, FaUser, FaCaretDown } from 'react-icons/fa';
import { format } from 'date-fns';

import { RootState, AppDispatch } from '../store';
import { fetchTaskById, createTask, updateTask, deleteTask } from '../store/slices/taskSlice';
import { fetchStatuses } from '../store/slices/statusSlice';
import { fetchUsers } from '../store/slices/userSlice';
import { TaskCreate, TaskUpdate } from '../types';
import TaskComments from '../components/tasks/TaskComments';
import EnhancedUserSelect from '../components/common/EnhancedUserSelect';
import StatusBadge from '../components/common/StatusBadge';
import { getStatusBadgeVariant } from '../utils/taskUtils';
import MarkdownEditor from '../components/common/MarkdownEditor';
import MarkdownRenderer from '../components/common/MarkdownRenderer';

// Отдельная схема для создания задачи с обязательным статусом
const taskCreateSchema = Yup.object().shape({
  title: Yup.string().required('Title is required').max(100, 'Title is too long'),
  description: Yup.string(),
  status_id: Yup.number().required('Status is required'),
  assignee_ids: Yup.array().of(Yup.number()),
  watcher_ids: Yup.array().of(Yup.number()),
});

// Схема для обновления задачи без статуса
const taskUpdateSchema = Yup.object().shape({
  title: Yup.string().required('Title is required').max(100, 'Title is too long'),
  description: Yup.string(),
  assignee_ids: Yup.array().of(Yup.number()),
  watcher_ids: Yup.array().of(Yup.number()),
});

interface TaskDetailPageProps {
  isCreating?: boolean;
}

const TaskDetailPage = ({ isCreating = false }: TaskDetailPageProps) => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { currentTask, loading, error } = useSelector((state: RootState) => state.tasks);
  const { statuses } = useSelector((state: RootState) => state.statuses);
  const { users } = useSelector((state: RootState) => state.users);
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  
  const [isEditing, setIsEditing] = useState(isCreating);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const canEdit = currentUser && (
    currentUser.is_superuser ||
    (currentTask && (currentTask.creator?.id === currentUser.id || currentTask.assignees?.some(assignee => assignee.id === currentUser.id)))
  );

  const canDelete = currentUser && (
    currentUser.is_superuser ||
    (currentTask && (currentTask.creator?.id === currentUser.id))
  );

  useEffect(() => {
    dispatch(fetchStatuses());
    dispatch(fetchUsers());
    
    if (!isCreating && taskId) {
      dispatch(fetchTaskById(Number(taskId)));
    }
  }, [dispatch, taskId, isCreating]);

  const handleSubmit = async (values: TaskCreate | TaskUpdate) => {
    try {
      if (isCreating) {
        await dispatch(createTask(values as TaskCreate)).unwrap();
        navigate('/tasks');
      } else if (taskId) {
        await dispatch(updateTask({ id: Number(taskId), task: values as TaskUpdate })).unwrap();
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?') && taskId) {
      try {
        await dispatch(deleteTask(Number(taskId))).unwrap();
        navigate('/tasks');
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const handleStatusChange = async (statusId: number) => {
    if (taskId && currentTask && statusId !== currentTask.status_id) {
      try {
        setIsChangingStatus(true);
        await dispatch(updateTask({ 
          id: Number(taskId), 
          task: { status_id: statusId } 
        })).unwrap();
      } catch (error) {
        console.error('Failed to update status:', error);
      } finally {
        setIsChangingStatus(false);
      }
    }
  };

  if (loading && !isCreating) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error && !isCreating) {
    return (
      <Container>
        <Alert variant="danger">
          Error: {error}
        </Alert>
        <Button variant="secondary" onClick={() => navigate('/tasks')}>
          <FaArrowLeft className="me-2" /> Back to Tasks
        </Button>
      </Container>
    );
  }

  const initialValues: TaskCreate | TaskUpdate = isCreating
    ? {
        title: '',
        description: '',
        status_id: statuses.length > 0 ? statuses[0].id : undefined,
        assignee_ids: [],
        watcher_ids: [],
      }
    : {
        title: currentTask?.title || '',
        description: currentTask?.description || '',
        assignee_ids: currentTask?.assignees?.map(a => a.id) || [],
        watcher_ids: currentTask?.watchers?.map(w => w.id) || [],
      };

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <Button variant="outline-secondary" onClick={() => navigate('/tasks')} className="me-2">
            <FaArrowLeft className="me-2" /> Back to Tasks
          </Button>
          
          {!isCreating && !isEditing && (
            <>
              {canEdit && (
                <Button 
                  variant="primary" 
                  onClick={() => setIsEditing(true)} 
                  className="me-2"
                  disabled={loading}
                >
                  Edit Task
                </Button>
              )}
              
              {canDelete && (
                <Button 
                  variant="danger" 
                  onClick={handleDelete}
                  disabled={loading}
                >
                  <FaTrash className="me-2" /> Delete
                </Button>
              )}
            </>
          )}
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              {isEditing ? (
                <Formik
                  initialValues={initialValues}
                  validationSchema={isCreating ? taskCreateSchema : taskUpdateSchema}
                  onSubmit={handleSubmit}
                  enableReinitialize
                >
                  {({ handleSubmit, isSubmitting, setFieldValue, values }) => (
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label>Title</Form.Label>
                        <Field
                          name="title"
                          as={Form.Control}
                          placeholder="Enter task title"
                        />
                        <ErrorMessage
                          name="title"
                          component={Form.Text}
                          className="text-danger"
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Description (Markdown supported)</Form.Label>
                        {/* Заменяем стандартный textarea на MarkdownEditor */}
                        <div className="markdown-editor-container">
                          <MarkdownEditor
                            value={values.description}
                            onChange={(value) => setFieldValue('description', value)}
                            placeholder="Enter task description using Markdown"
                          />
                        </div>
                        <ErrorMessage
                          name="description"
                          component={Form.Text}
                          className="text-danger"
                        />
                      </Form.Group>

                      {/* Показываем выбор статуса только при создании */}
                      {isCreating && (
                        <Form.Group className="mb-3">
                          <Form.Label>Status</Form.Label>
                          <Field
                            name="status_id"
                            as={Form.Select}
                          >
                            <option value="">Select Status</option>
                            {statuses.map(status => (
                              <option key={status.id} value={status.id}>
                                {status.title}
                              </option>
                            ))}
                          </Field>
                          <ErrorMessage
                            name="status_id"
                            component={Form.Text}
                            className="text-danger"
                          />
                        </Form.Group>
                      )}

                      <Form.Group className="mb-3">
                        <Form.Label>Assignees</Form.Label>
                        <EnhancedUserSelect
                          users={users}
                          selectedUserIds={values.assignee_ids || []}
                          onChange={(selectedIds) => setFieldValue('assignee_ids', selectedIds)}
                          placeholder="Search for assignees..."
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Watchers</Form.Label>
                        <EnhancedUserSelect
                          users={users}
                          selectedUserIds={values.watcher_ids || []}
                          onChange={(selectedIds) => setFieldValue('watcher_ids', selectedIds)}
                          placeholder="Search for watchers..."
                        />
                      </Form.Group>

                      <div className="d-flex justify-content-end mt-4">
                        {!isCreating && (
                          <Button
                            variant="outline-secondary"
                            onClick={() => setIsEditing(false)}
                            className="me-2"
                            disabled={isSubmitting}
                          >
                            Cancel
                          </Button>
                        )}
                        <Button
                          type="submit"
                          variant="primary"
                          disabled={isSubmitting}
                        >
                          <FaSave className="me-2" />
                          {isSubmitting ? 'Saving...' : 'Save Task'}
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>
              ) : (
                <>
                  <div className="task-header mb-4 d-flex justify-content-between align-items-start">
                  <div>
                    <h2 className="mb-2">{currentTask?.title}</h2>
                    <div className="task-meta">
                      <div className="d-flex align-items-center mb-1">
                        <FaUser className="me-1 text-muted" />
                        <small className="text-muted">
                          Created by {currentTask?.creator?.username} on {currentTask && format(new Date(currentTask.created_at), 'MMM dd, yyyy HH:mm')}
                        </small>
                      </div>
                      {currentTask?.updated_at && (
                        <div>
                          <small className="text-muted">
                            Last updated: {format(new Date(currentTask.updated_at), 'MMM dd, yyyy HH:mm')}
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    {currentTask?.status && canEdit ? (
                      <Dropdown>
                        <Dropdown.Toggle as="div" id="dropdown-status" className="pointer-cursor" bsPrefix="dropdown-toggle-no-caret">
                          <Badge 
                            bg={getStatusBadgeVariant(currentTask.status.title)}
                            className="d-flex align-items-center px-3 py-2"
                            style={{ cursor: 'pointer' }}
                          >
                            {isChangingStatus ? (
                              <Spinner animation="border" size="sm" className="me-1" style={{ height: '0.75rem', width: '0.75rem' }} />
                            ) : null}
                            {currentTask.status.title}
                            <FaCaretDown className="ms-2" />
                          </Badge>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          {statuses.map(status => (
                            <Dropdown.Item 
                              key={status.id}
                              onClick={() => handleStatusChange(status.id)}
                              active={status.id === currentTask.status_id}
                            >
                              <Badge bg={getStatusBadgeVariant(status.title)} className="me-2">&nbsp;</Badge>
                              {status.title}
                            </Dropdown.Item>
                          ))}
                        </Dropdown.Menu>
                      </Dropdown>
                    ) : currentTask?.status ? (
                      <StatusBadge status={currentTask.status} />
                    ) : null}
                  </div>
                </div>

                <div className="task-content">
                  <h5 className="mb-3">Description:</h5>
                  <div className="task-description-container">
                    {currentTask?.description ? (
                      <MarkdownRenderer content={currentTask.description} className="task-description" />
                    ) : (
                      <p className="text-muted fst-italic">No description provided</p>
                    )}
                  </div>
                </div>
                </>
              )}
            </Card.Body>
          </Card>

          {!isCreating && !isEditing && currentTask && (
            <TaskComments taskId={currentTask.id} />
          )}
        </Col>

        <Col md={4}>
          {!isCreating && !isEditing && currentTask && (
            <>
              <Card className="shadow-sm mb-4">
                <Card.Header>Assignees</Card.Header>
                <Card.Body>
                  {currentTask.assignees && currentTask.assignees.length > 0 ? (
                    <ul className="list-unstyled">
                      {currentTask.assignees.map(user => (
                        <li key={user.id} className="d-flex align-items-center mb-2">
                          <div className="user-avatar me-2">
                            {user.username.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <strong>{user.username}</strong>
                            <div className="small text-muted">{user.email}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted mb-0">No assignees</p>
                  )}
                </Card.Body>
              </Card>

              <Card className="shadow-sm">
                <Card.Header>Watchers</Card.Header>
                <Card.Body>
                  {currentTask.watchers && currentTask.watchers.length > 0 ? (
                    <ul className="list-unstyled">
                      {currentTask.watchers.map(user => (
                        <li key={user.id} className="d-flex align-items-center mb-2">
                          <div className="user-avatar me-2">
                            {user.username.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <strong>{user.username}</strong>
                            <div className="small text-muted">{user.email}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted mb-0">No watchers</p>
                  )}
                </Card.Body>
              </Card>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default TaskDetailPage;
