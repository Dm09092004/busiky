import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Register = () => {
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    position: '',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('users/register/', formData);
      toast.success('Регистрация успешна! Теперь войдите.');
      navigate('/login');
    } catch (error) {
      if (error.response && error.response.data) {
        // Показываем ошибки с сервера
        const errors = error.response.data;
        Object.keys(errors).forEach(key => {
          toast.error(`${key}: ${errors[key]}`);
        });
      } else {
        toast.error('Ошибка регистрации');
      }
    }
  };

  return (
    <div style={styles.container}>
      <h2>Регистрация</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div>
          <label>Имя пользователя*</label>
          <input name="username" value={formData.username} onChange={handleChange} required />
        </div>
        <div>
          <label>Email*</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div>
          <label>Пароль*</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <div>
          <label>Подтверждение пароля*</label>
          <input type="password" name="password2" value={formData.password2} onChange={handleChange} required />
        </div>
        <div>
          <label>Имя</label>
          <input name="first_name" value={formData.first_name} onChange={handleChange} />
        </div>
        <div>
          <label>Фамилия</label>
          <input name="last_name" value={formData.last_name} onChange={handleChange} />
        </div>
        <div>
          <label>Должность</label>
          <input name="position" value={formData.position} onChange={handleChange} />
        </div>
        <button type="submit">Зарегистрироваться</button>
      </form>
      <p>Уже есть аккаунт? <Link to="/login">Войти</Link></p>
    </div>
  );
};

const styles = {
  container: { maxWidth: 400, margin: '50px auto', padding: 20, border: '1px solid #ccc', borderRadius: 5 },
  form: { display: 'flex', flexDirection: 'column', gap: 15 },
};

export default Register;