import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaHome } from 'react-icons/fa';

const NotFoundPage = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center text-center">
        <Col md={6}>
          <h1 className="display-1 fw-bold text-primary">404</h1>
          <h2 className="mb-4">Page Not Found</h2>
          <p className="lead mb-5">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Button as={Link} to="/" variant="primary">
              <FaHome className="me-2" /> Go Home
            </Button>
            <Button as={Link} to="/tasks" variant="outline-secondary">
              <FaArrowLeft className="me-2" /> My Tasks
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFoundPage;
