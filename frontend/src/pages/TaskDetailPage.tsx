import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner, Badge } from 'react-bootstrap';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaSave, FaTrash, FaArrowLeft, FaUser } from 'react-icons/fa';
import { format } from 'date-fns';

import { RootState, AppDispatch } from '../store';
import { fetchTaskById, createTask, updateTask, deleteTask } from '../store/slices/taskSlice';
import { fetchStatuses } from '../store/slices/statusSlice';
import { fetchUsers } from '../store/slices/userSlice';
import { TaskCreate, TaskUpdate } from '../types';
import TaskComments from '../components/tasks/TaskComments';
import UserSelect from '../components/common/UserSelect';
import StatusBadge from '../components/common/StatusBadge';

const taskSchema = Yup.object().shape({
  title: Yup.string().required('Title is required').max(100, 'Title is too long'),
  description: Yup.string(),
  status_id: Yup.number().nullable(),
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

  const canEditOrDelete = currentUser && (
    currentUser.is_superuser ||
    (currentTask && (currentTask.creator?.id === currentUser.id || currentTask.assignees.some(assignee => assignee.id === currentUser.id)))
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
        status_id: statuses.length > 0 ? statuses[0].id : null,
        assignee_ids: [],
        watcher_ids: [],
      }
    : {
        title: currentTask?.title || '',
        description: currentTask?.description || '',
        status_id: currentTask?.status_id || null,
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
          
          {!isCreating && !isEditing && canEditOrDelete && (
            <>
              <Button 
                variant="primary" 
                onClick={() => setIsEditing(true)} 
                className="me-2"
                disabled={loading}
              >
                Edit Task
              </Button>
              
              <Button 
                variant="danger" 
                onClick={handleDelete}
                disabled={loading}
              >
                <FaTrash className="me-2" /> Delete
              </Button>
            </>
          )}
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              {isEditing ? (
                <Formik
                  initialValues={initialValues}
                  validationSchema={taskSchema}
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
                        <Form.Label>Description</Form.Label>
                        <Field
                          name="description"
                          as={Form.Control}
                          component="textarea"
                          rows={5}
                          placeholder="Enter task description"
                          className="custom-textarea"
                        />
                        <ErrorMessage
                          name="description"
                          component={Form.Text}
                          className="text-danger"
                        />
                      </Form.Group>

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
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Assignees</Form.Label>
                        <UserSelect
                          users={users}
                          selectedUserIds={values.assignee_ids || []}
                          onChange={(selectedIds) => setFieldValue('assignee_ids', selectedIds)}
                          placeholder="Select assignees"
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Watchers</Form.Label>
                        <UserSelect
                          users={users}
                          selectedUserIds={values.watcher_ids || []}
                          onChange={(selectedIds) => setFieldValue('watcher_ids', selectedIds)}
                          placeholder="Select watchers"
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
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h2 className="mb-0">{currentTask?.title}</h2>
                    {currentTask?.status && (
                      <StatusBadge status={currentTask.status} />
                    )}
                  </div>

                  <div className="task-meta mb-4">
                    <div className="text-muted mb-2">
                      <FaUser className="me-1" />
                      Created by {currentTask?.creator?.username} on {currentTask && format(new Date(currentTask.created_at), 'MMM dd, yyyy HH:mm')}
                    </div>
                    {currentTask?.updated_at && (
                      <div className="text-muted small">
                        Last updated: {format(new Date(currentTask.updated_at), 'MMM dd, yyyy HH:mm')}
                      </div>
                    )}
                  </div>

                  <h5>Description:</h5>
                  <div className="task-description mb-4">
                    {currentTask?.description ? (
                      <p>{currentTask.description}</p>
                    ) : (
                      <p className="text-muted fst-italic">No description provided</p>
                    )}
                  </div>
                </>
              )}
            </Card.Body>
          </Card>

          {!isCreating && !isEditing && currentTask && (
            <TaskComments taskId={currentTask.id} />
          )}
        </Col>

        <Col lg={4}>
          {!isCreating && !isEditing && currentTask && (
            <>
              <Card className="shadow-sm mb-4">
                <Card.Header>Assignees</Card.Header>
                <Card.Body>
                  {currentTask.assignees && currentTask.assignees.length > 0 ? (
                    <ul className="list-unstyled">
                      {currentTask.assignees.map(user => (
                        <li key={user.id} className="mb-2 d-flex align-items-center">
                          <div className="avatar-placeholder me-2">
                            {user.username.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <strong>{user.username}</strong>
                            <div className="text-muted small">{user.email}</div>
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
                        <li key={user.id} className="mb-2 d-flex align-items-center">
                          <div className="avatar-placeholder me-2">
                            {user.username.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <strong>{user.username}</strong>
                            <div className="text-muted small">{user.email}</div>
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
