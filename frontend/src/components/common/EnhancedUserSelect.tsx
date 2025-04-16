// src/components/common/EnhancedUserSelect.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Form, ListGroup, Badge } from 'react-bootstrap';
import { User } from '../../types';
import { FaTimes, FaSearch, FaUser } from 'react-icons/fa';

interface EnhancedUserSelectProps {
  users: User[];
  selectedUserIds: number[];
  onChange: (selectedIds: number[]) => void;
  placeholder?: string;
  maxHeight?: number;
}

const EnhancedUserSelect: React.FC<EnhancedUserSelectProps> = ({
  users,
  selectedUserIds,
  onChange,
  placeholder = 'Search users...',
  maxHeight = 300
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Закрывать выпадающий список при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Фильтр пользователей по поисковому запросу
  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;

    const search = searchTerm.toLowerCase();
    return (
      user.username.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      (user.first_name && user.first_name.toLowerCase().includes(search)) ||
      (user.last_name && user.last_name.toLowerCase().includes(search))
    );
  });

  // Пользователи, которые уже выбраны
  const selectedUsers = users.filter(user => selectedUserIds.includes(user.id));

  // Обработчик выбора пользователя
  const handleUserSelect = (event: React.MouseEvent, userId: number) => {
    // Предотвращаем отправку формы
    event.preventDefault();
    event.stopPropagation();
    
    const isSelected = selectedUserIds.includes(userId);
    
    // Если пользователь уже выбран, удаляем его из списка, иначе добавляем
    if (isSelected) {
      onChange(selectedUserIds.filter(id => id !== userId));
    } else {
      onChange([...selectedUserIds, userId]);
    }
  };

  // Удаление выбранного пользователя
  const handleRemoveUser = (event: React.MouseEvent, userId: number) => {
    // Предотвращаем отправку формы
    event.preventDefault();
    event.stopPropagation();
    
    onChange(selectedUserIds.filter(id => id !== userId));
  };

  return (
    <div className="enhanced-user-select" ref={dropdownRef}>
      {/* Отображение выбранных пользователей */}
      <div className="selected-users mb-2">
        {selectedUsers.map(user => (
          <Badge
            key={user.id}
            bg="primary"
            className="d-inline-flex align-items-center me-2 mb-2 py-2 px-3"
          >
            <span className="me-2">{user.username}</span>
            <FaTimes
              style={{ cursor: 'pointer' }}
              onClick={(e) => handleRemoveUser(e, user.id)}
            />
          </Badge>
        ))}
      </div>

      {/* Поле поиска */}
      <div className="position-relative">
        <Form.Control
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsDropdownOpen(true)}
          className="mb-0"
          onClick={(e) => e.stopPropagation()} // Предотвращаем отправку формы при клике на поле ввода
        />
        <FaSearch className="position-absolute" style={{ right: "10px", top: "10px", color: "#aaa" }} />

        {/* Выпадающий список пользователей */}
        {isDropdownOpen && (
          <ListGroup
            className="position-absolute w-100 mt-1 shadow-sm overflow-auto"
            style={{ maxHeight: `${maxHeight}px`, zIndex: 1000 }}
          >
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <ListGroup.Item
                  key={user.id}
                  action
                  active={selectedUserIds.includes(user.id)}
                  onClick={(e) => handleUserSelect(e, user.id)}
                  className="d-flex align-items-center"
                >
                  <div className="me-2 bg-light rounded-circle text-center" style={{ width: '30px', height: '30px', lineHeight: '30px' }}>
                    {user.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div><strong>{user.username}</strong></div>
                    <div className="small text-muted">{user.email}</div>
                  </div>
                </ListGroup.Item>
              ))
            ) : (
              <ListGroup.Item className="text-center text-muted">
                No users found
              </ListGroup.Item>
            )}
          </ListGroup>
        )}
      </div>
    </div>
  );
};

export default EnhancedUserSelect;
