import { Form, Button, Alert } from 'react-bootstrap';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaUserPlus } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { register } from '../../store/slices/authSlice';

const RegisterSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  username: Yup.string().required('Username is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm Password is required'),
  first_name: Yup.string(),
  last_name: Yup.string(),
});

interface RegisterFormProps {
  error: string | null;
  loading: boolean;
}

const RegisterForm = ({ error, loading }: RegisterFormProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = (values: any) => {
    // Remove confirm password before dispatching
    const { confirmPassword, ...userData } = values;
    dispatch(register(userData));
  };

  return (
    <Formik
      initialValues={{
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: '',
      }}
      validationSchema={RegisterSchema}
      onSubmit={handleSubmit}
    >
      {({ handleSubmit, touched, errors }) => (
        <Form onSubmit={handleSubmit}>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Field
              name="email"
              type="email"
              as={Form.Control}
              placeholder="Enter your email"
              isInvalid={touched.email && !!errors.email}
            />
            <ErrorMessage
              name="email"
              component={Form.Control.Feedback}
              type="invalid"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formUsername">
            <Form.Label>Username</Form.Label>
            <Field
              name="username"
              as={Form.Control}
              placeholder="Choose a username"
              isInvalid={touched.username && !!errors.username}
            />
            <ErrorMessage
              name="username"
              component={Form.Control.Feedback}
              type="invalid"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formFirstName">
            <Form.Label>First Name (Optional)</Form.Label>
            <Field
              name="first_name"
              as={Form.Control}
              placeholder="Enter your first name"
              isInvalid={touched.first_name && !!errors.first_name}
            />
            <ErrorMessage
              name="first_name"
              component={Form.Control.Feedback}
              type="invalid"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formLastName">
            <Form.Label>Last Name (Optional)</Form.Label>
            <Field
              name="last_name"
              as={Form.Control}
              placeholder="Enter your last name"
              isInvalid={touched.last_name && !!errors.last_name}
            />
            <ErrorMessage
              name="last_name"
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
              placeholder="Create a password"
              isInvalid={touched.password && !!errors.password}
            />
            <ErrorMessage
              name="password"
              component={Form.Control.Feedback}
              type="invalid"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formConfirmPassword">
            <Form.Label>Confirm Password</Form.Label>
            <Field
              name="confirmPassword"
              type="password"
              as={Form.Control}
              placeholder="Confirm your password"
              isInvalid={touched.confirmPassword && !!errors.confirmPassword}
            />
            <ErrorMessage
              name="confirmPassword"
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
            <FaUserPlus className="me-2" />
            {loading ? 'Registering...' : 'Create Account'}
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default RegisterForm;