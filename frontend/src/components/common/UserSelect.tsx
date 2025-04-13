import { Form } from 'react-bootstrap';
import { User } from '../../types';

interface UserSelectProps {
  users: User[];
  selectedUserIds: number[];
  onChange: (selectedIds: number[]) => void;
  placeholder?: string;
  isMulti?: boolean;
}

const UserSelect = ({ 
  users, 
  selectedUserIds, 
  onChange, 
  placeholder = 'Select users',
  isMulti = true
}: UserSelectProps) => {
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => Number(option.value));
    onChange(selectedOptions);
  };
  
  return (
    <Form.Select 
      multiple={isMulti}
      value={selectedUserIds.map(String)}
      onChange={handleChange}
    >
      {users.map(user => (
        <option key={user.id} value={user.id}>
          {user.username} ({user.email})
        </option>
      ))}
    </Form.Select>
  );
};

export default UserSelect;
