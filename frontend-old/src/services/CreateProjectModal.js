// src/components/CreateProjectModal.js
import React, { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const CreateProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    technical_spec: '',
  });
  const [complexity, setComplexity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const analyzeComplexity = async () => {
    if (!form.technical_spec.trim()) {
      toast.error('Введите техническое задание для анализа');
      return;
    }
    setAnalyzing(true);
    try {
      // Предполагаем, что у вас есть эндпоинт /api/projects/analyze/ 
      // Если нет, можно сделать простой скоринг на фронте или временно игнорировать
      const response = await api.post('projects/analyze/', { text: form.technical_spec });
      setComplexity(response.data.complexity);
      toast.success(`Сложность проекта: ${response.data.complexity}/10`);
    } catch (error) {
      console.error(error);
      toast.error('Ошибка анализа сложности');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...form };
      if (complexity) data.complexity = complexity;
      const response = await api.post('projects/', data);
      toast.success('Проект создан');
      if (onProjectCreated) onProjectCreated(response.data);
      onClose();
    } catch (error) {
      toast.error('Ошибка создания проекта');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>Создать проект</h3>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Название*</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div>
            <label>Описание</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
          </div>
          <div>
            <label>Техническое задание</label>
            <textarea name="technical_spec" value={form.technical_spec} onChange={handleChange} rows={5} />
            <button type="button" onClick={analyzeComplexity} disabled={analyzing}>
              {analyzing ? 'Анализ...' : 'Анализировать сложность'}
            </button>
            {complexity && <span>Сложность: {complexity}</span>}
          </div>
          <div style={styles.buttons}>
            <button type="submit" disabled={loading}>Создать</button>
            <button type="button" onClick={onClose}>Отмена</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '500px', maxWidth: '90%' },
  buttons: { display: 'flex', gap: '10px', marginTop: '15px', justifyContent: 'flex-end' },
};

export default CreateProjectModal;