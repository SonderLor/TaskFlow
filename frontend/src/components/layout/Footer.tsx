import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-white py-4 mt-5">
      <Container>
        <Row>
          <Col md={4} className="mb-4 mb-md-0">
            <h5>TaskFlow</h5>
            <p className="text-muted">
              A simple and effective task management tool for teams.
            </p>
            <div className="social-icons d-flex gap-3">
              <a href="#" className="text-light">
                <FaGithub size={24} />
              </a>
              <a href="#" className="text-light">
                <FaTwitter size={24} />
              </a>
              <a href="#" className="text-light">
                <FaLinkedin size={24} />
              </a>
            </div>
          </Col>
          
          <Col md={4} className="mb-4 mb-md-0">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li>
                <Link to="/" className="text-decoration-none text-muted">Home</Link>
              </li>
              <li>
                <Link to="/tasks" className="text-decoration-none text-muted">Tasks</Link>
              </li>
              <li>
                <Link to="/login" className="text-decoration-none text-muted">Login</Link>
              </li>
              <li>
                <Link to="/register" className="text-decoration-none text-muted">Register</Link>
              </li>
            </ul>
          </Col>
          
          <Col md={4}>
            <h5>Contact</h5>
            <address className="text-muted">
              <p>123 Task Street</p>
              <p>Workflow City, WF 12345</p>
              <p>Email: info@taskflow.com</p>
            </address>
          </Col>
        </Row>
        
        <hr className="my-3 bg-secondary" />
        
        <Row>
          <Col className="text-center text-muted">
            <small>© {currentYear} TaskFlow. All rights reserved.</small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
