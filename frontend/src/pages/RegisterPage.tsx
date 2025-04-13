import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import RegisterForm from '../components/forms/RegisterForm';

const RegisterPage = () => {
  const { loading, error } = useSelector((state: RootState) => state.auth);

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Create an Account</h2>
              
              <RegisterForm error={error} loading={loading} />
              
              <div className="text-center mt-3">
                <p>
                  Already have an account? <Link to="/login">Login here</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;
