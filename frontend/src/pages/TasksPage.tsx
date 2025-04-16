import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Tab, Nav, Button, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlus, FaSearch } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';

import { RootState, AppDispatch } from '../store';
import { fetchTasks, fetchMyTasks, fetchCreatedTasks, fetchAssignedTasks, fetchWatchingTasks } from '../store/slices/taskSlice';
import { fetchStatuses } from '../store/slices/statusSlice';
import TaskItem from '../components/tasks/TaskItem';
import TaskFilter from '../components/tasks/TaskFilter';

const TasksPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { tasks, myTasks, createdTasks, assignedTasks, watchingTasks, loading } = useSelector((state: RootState) => state.tasks);
  const { statuses } = useSelector((state: RootState) => state.statuses);
  const { user } = useSelector((state: RootState) => state.auth);
  const isSuperuser = user?.is_superuser === true;
  const [activeTab, setActiveTab] = useState(isSuperuser ? 'all' : 'my');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | null>(null);

  useEffect(() => {
    if (isSuperuser) {
      dispatch(fetchTasks());
    }
    
    dispatch(fetchMyTasks());
    dispatch(fetchCreatedTasks());
    dispatch(fetchAssignedTasks());
    dispatch(fetchWatchingTasks());
    dispatch(fetchStatuses());
  }, [dispatch, isSuperuser]);

  useEffect(() => {
    if (!isSuperuser && activeTab === 'all') {
      setActiveTab('my');
    }
  }, [isSuperuser, activeTab]);

  const filteredTasks = (taskList: any[]) => {
    return taskList.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === null || task.status_id === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Tasks</h2>
        <Button 
          variant="primary" 
          onClick={() => navigate('/tasks/create')}
        >
          <FaPlus className="me-2" /> New Task
        </Button>
      </div>

      <Row className="mb-4">
        <Col>
          <TaskFilter 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            statuses={statuses}
          />
        </Col>
      </Row>

      <Tab.Container id="tasks-tabs" activeKey={activeTab} onSelect={(k) => k && setActiveTab(k)}>
        <Row>
          <Col>
            <Nav variant="tabs" className="mb-3">
              {isSuperuser && (
                <Nav.Item>
                  <Nav.Link eventKey="all">All Tasks ({tasks.length})</Nav.Link>
                </Nav.Item>
              )}
              <Nav.Item>
                <Nav.Link eventKey="my">My Tasks ({myTasks.length})</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="created">Created ({createdTasks.length})</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="assigned">Assigned ({assignedTasks.length})</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="watching">Watching ({watchingTasks.length})</Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              {isSuperuser && (
                <Tab.Pane eventKey="all">
                  {loading ? (
                    <div className="text-center p-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : filteredTasks(tasks).length > 0 ? (
                    <div className="task-list">
                      {filteredTasks(tasks).map(task => (
                        <TaskItem key={task.id} task={task} />
                      ))}
                    </div>
                  ) : (
                    <Card className="text-center p-5">
                      <Card.Body>
                        <h4>No tasks found</h4>
                        <p>No tasks match your search criteria.</p>
                      </Card.Body>
                    </Card>
                  )}
                </Tab.Pane>
              )}

              <Tab.Pane eventKey="my">
                {loading ? (
                  <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : filteredTasks(myTasks).length > 0 ? (
                  <div className="task-list">
                    {filteredTasks(myTasks).map(task => (
                      <TaskItem key={task.id} task={task} />
                    ))}
                  </div>
                ) : (
                  <Card className="text-center p-5">
                    <Card.Body>
                      <h4>No tasks found</h4>
                      <p>You don't have any tasks associated with you.</p>
                      <Button 
                        variant="primary" 
                        onClick={() => navigate('/tasks/create')}
                      >
                        <FaPlus className="me-2" /> Create a new task
                      </Button>
                    </Card.Body>
                  </Card>
                )}
              </Tab.Pane>

              <Tab.Pane eventKey="created">
                {loading ? (
                  <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : filteredTasks(createdTasks).length > 0 ? (
                  <div className="task-list">
                    {filteredTasks(createdTasks).map(task => (
                      <TaskItem key={task.id} task={task} />
                    ))}
                  </div>
                ) : (
                  <Card className="text-center p-5">
                    <Card.Body>
                      <h4>No tasks created by you</h4>
                      <p>You haven't created any tasks yet.</p>
                      <Button 
                        variant="primary" 
                        onClick={() => navigate('/tasks/create')}
                      >
                        <FaPlus className="me-2" /> Create a new task
                      </Button>
                    </Card.Body>
                  </Card>
                )}
              </Tab.Pane>

              <Tab.Pane eventKey="assigned">
                {loading ? (
                  <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : filteredTasks(assignedTasks).length > 0 ? (
                  <div className="task-list">
                    {filteredTasks(assignedTasks).map(task => (
                      <TaskItem key={task.id} task={task} />
                    ))}
                  </div>
                ) : (
                  <Card className="text-center p-5">
                    <Card.Body>
                      <h4>No tasks assigned to you</h4>
                      <p>You haven't been assigned any tasks yet.</p>
                    </Card.Body>
                  </Card>
                )}
              </Tab.Pane>

              <Tab.Pane eventKey="watching">
                {loading ? (
                  <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : filteredTasks(watchingTasks).length > 0 ? (
                  <div className="task-list">
                    {filteredTasks(watchingTasks).map(task => (
                      <TaskItem key={task.id} task={task} />
                    ))}
                  </div>
                ) : (
                  <Card className="text-center p-5">
                    <Card.Body>
                      <h4>You are not watching any tasks</h4>
                      <p>You haven't started watching any tasks yet.</p>
                    </Card.Body>
                  </Card>
                )}
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
};

export default TasksPage;
