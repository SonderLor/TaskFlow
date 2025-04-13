import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaTasks, FaUserFriends, FaComments, FaChartLine } from 'react-icons/fa';
import { RootState } from '../store';

const HomePage = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section bg-primary text-white py-5">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h1 className="display-4 fw-bold mb-3">Manage Tasks with Ease</h1>
              <p className="lead mb-4">
                TaskFlow helps your team collaborate effectively, track progress, and get work done.
              </p>
              {isAuthenticated ? (
                <Button as={Link} to="/tasks" size="lg" variant="light">
                  Go to Tasks
                </Button>
              ) : (
                <div className="d-flex gap-3">
                  <Button as={Link} to="/register" size="lg" variant="light">
                    Sign Up Free
                  </Button>
                  <Button as={Link} to="/login" size="lg" variant="outline-light">
                    Login
                  </Button>
                </div>
              )}
            </Col>
            <Col md={6} className="text-center">
              <img 
                src="/images/hero-task.svg" 
                alt="Task Management" 
                className="img-fluid" 
                style={{ maxHeight: '300px' }}
                onError={(e) => {
                  // Fallback if image doesn't exist
                  e.currentTarget.style.display = 'none';
                }}
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section py-5">
        <Container>
          <h2 className="text-center mb-5">Key Features</h2>
          <Row>
            <Col md={3} className="mb-4">
              <Card className="h-100 shadow-sm text-center">
                <Card.Body>
                  <div className="feature-icon mb-3">
                    <FaTasks className="text-primary" size={40} />
                  </div>
                  <Card.Title>Task Management</Card.Title>
                  <Card.Text>
                    Create, assign, and track tasks to ensure project progress.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-4">
              <Card className="h-100 shadow-sm text-center">
                <Card.Body>
                  <div className="feature-icon mb-3">
                    <FaUserFriends className="text-primary" size={40} />
                  </div>
                  <Card.Title>Team Collaboration</Card.Title>
                  <Card.Text>
                    Work together seamlessly with assignees and watchers.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-4">
              <Card className="h-100 shadow-sm text-center">
                <Card.Body>
                  <div className="feature-icon mb-3">
                    <FaComments className="text-primary" size={40} />
                  </div>
                  <Card.Title>Real-time Comments</Card.Title>
                  <Card.Text>
                    Discuss tasks with your team in real-time via WebSockets.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-4">
              <Card className="h-100 shadow-sm text-center">
                <Card.Body>
                  <div className="feature-icon mb-3">
                    <FaChartLine className="text-primary" size={40} />
                  </div>
                  <Card.Title>Status Tracking</Card.Title>
                  <Card.Text>
                    Monitor progress with customizable task statuses.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Call to Action */}
      <section className="cta-section bg-light py-5">
        <Container className="text-center">
          <h2 className="mb-4">Ready to streamline your team's workflow?</h2>
          <p className="lead mb-4">
            Join thousands of teams using TaskFlow to manage projects efficiently.
          </p>
          {isAuthenticated ? (
            <Button as={Link} to="/tasks/create" size="lg" variant="primary">
              Create Your First Task
            </Button>
          ) : (
            <Button as={Link} to="/register" size="lg" variant="primary">
              Get Started Free
            </Button>
          )}
        </Container>
      </section>
    </div>
  );
};

export default HomePage;
