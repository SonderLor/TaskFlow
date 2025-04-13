import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import LoginForm from '../components/forms/LoginForm';

const LoginPage = () => {
  const { loading, error } = useSelector((state: RootState) => state.auth);

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Login to TaskFlow</h2>
              
              <LoginForm error={error} loading={loading} />
              
              <div className="text-center mt-3">
                <p>
                  Don't have an account? <Link to="/register">Register</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;
