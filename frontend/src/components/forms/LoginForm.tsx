import { Form, Button, Alert } from 'react-bootstrap';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaSignInAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { login } from '../../store/slices/authSlice';

const LoginSchema = Yup.object().shape({
  username: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

interface LoginFormProps {
  error: string | null;
  loading: boolean;
}

const LoginForm = ({ error, loading }: LoginFormProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = (values: { username: string; password: string }) => {
    dispatch(login(values));
  };

  return (
    <Formik
      initialValues={{ username: '', password: '' }}
      validationSchema={LoginSchema}
      onSubmit={handleSubmit}
    >
      {({ handleSubmit, touched, errors }) => (
        <Form onSubmit={handleSubmit}>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Field
              name="username"
              type="email"
              as={Form.Control}
              placeholder="Enter your email"
              isInvalid={touched.username && !!errors.username}
            />
            <ErrorMessage
              name="username"
              component={Form.Control.Feedback}
              type="invalid"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Field
              name="password"
              type="password"
              as={Form.Control}
              placeholder="Enter your password"
              isInvalid={touched.password && !!errors.password}
            />
            <ErrorMessage
              name="password"
              component={Form.Control.Feedback}
              type="invalid"
            />
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            className="w-100 mt-3"
            disabled={loading}
          >
            <FaSignInAlt className="me-2" />
            {loading ? 'Logging in...' : 'Log In'}
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default LoginForm;
