import { useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { FaSave, FaUserCircle } from 'react-icons/fa';

import { AppDispatch, RootState } from '../store';
import { updateUserProfile } from '../store/slices/userSlice';

const profileSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  first_name: Yup.string(),
  last_name: Yup.string(),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .test('empty-or-min-length', 'Password must be at least 8 characters', function(value) {
      return !value || value.length >= 8;
    }),
  password_confirm: Yup.string()
    .test('passwords-match', 'Passwords must match', function(value) {
      return this.parent.password === value;
    }),
});

const ProfilePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { loading, error } = useSelector((state: RootState) => state.users);

  if (!user) {
    return (
      <Container>
        <Alert variant="danger">
          User not found. Please login again.
        </Alert>
      </Container>
    );
  }

  const initialValues = {
    username: user.username || '',
    email: user.email || '',
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    password: '',
    password_confirm: '',
  };

  const handleSubmit = async (values: any) => {
    // Remove password_confirm and empty password from submission
    const userData = { ...values };
    delete userData.password_confirm;
    
    if (!userData.password) {
      delete userData.password;
    }
    
    dispatch(updateUserProfile(userData));
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0"><FaUserCircle className="me-2" /> Profile Settings</h4>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger">{error}</Alert>
              )}
              
              <Formik
                initialValues={initialValues}
                validationSchema={profileSchema}
                onSubmit={handleSubmit}
                enableReinitialize
              >
                {({ handleSubmit, isSubmitting }) => (
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Username</Form.Label>
                          <Field
                            name="username"
                            as={Form.Control}
                            placeholder="Enter username"
                          />
                          <ErrorMessage
                            name="username"
                            component={Form.Text}
                            className="text-danger"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Email</Form.Label>
                          <Field
                            name="email"
                            type="email"
                            as={Form.Control}
                            placeholder="Enter email"
                          />
                          <ErrorMessage
                            name="email"
                            component={Form.Text}
                            className="text-danger"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>First Name</Form.Label>
                          <Field
                            name="first_name"
                            as={Form.Control}
                            placeholder="Enter first name"
                          />
                          <ErrorMessage
                            name="first_name"
                            component={Form.Text}
                            className="text-danger"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Last Name</Form.Label>
                          <Field
                            name="last_name"
                            as={Form.Control}
                            placeholder="Enter last name"
                          />
                          <ErrorMessage
                            name="last_name"
                            component={Form.Text}
                            className="text-danger"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Password</Form.Label>
                          <Field
                            name="password"
                            type="password"
                            as={Form.Control}
                            placeholder="Change password (optional)"
                          />
                          <Form.Text className="text-muted">
                            Leave blank to keep your current password
                            <br />
                          </Form.Text>
                          <ErrorMessage
                            name="password"
                            component={Form.Text}
                            className="text-danger"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Confirm Password</Form.Label>
                          <Field
                            name="password_confirm"
                            type="password"
                            as={Form.Control}
                            placeholder="Confirm new password"
                          />
                          <ErrorMessage
                            name="password_confirm"
                            component={Form.Text}
                            className="text-danger"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="d-grid gap-2 mt-4">
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={isSubmitting || loading}
                      >
                        <FaSave className="me-2" />
                        {isSubmitting || loading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;
