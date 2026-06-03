import React, { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, Typography, Chip, CircularProgress,
  Stepper, Step, StepLabel, LinearProgress,
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

const STEPS = ['Основное', 'Техническое задание', 'Сроки и бюджет'];

const ComplexityBadge = ({ value }) => {
  if (!value) return null;
  const color = value <= 3 ? '#52B788' : value <= 6 ? '#F4A261' : '#E76F51';
  const label = value <= 3 ? 'Простой' : value <= 6 ? 'Средний' : 'Сложный';
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
      <Box sx={{ flex: 1, bgcolor: 'rgba(0,0,0,0.06)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
        <Box sx={{ width: `${value * 10}%`, height: '100%', bgcolor: color, borderRadius: 4, transition: 'width 0.4s ease' }} />
      </Box>
      <Chip label={`${label} · ${value}/10`} size="small" sx={{ bgcolor: `${color}20`, color, fontWeight: 600, fontSize: 11 }} />
    </Box>
  );
};

const CreateProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    technical_spec: '',
    complexity: null,
    planned_start: '',
    planned_end: '',
    budget: '',
  });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const analyzeSpec = async () => {
    if (!form.technical_spec.trim()) return;
    setAnalyzing(true);
    try {
      const res = await api.post('projects/analyze/', { text: form.technical_spec });
      setForm((f) => ({ ...f, complexity: res.data.complexity }));
      toast.success(`Сложность определена: ${res.data.complexity}/10`);
    } catch {
      toast.error('Не удалось проанализировать ТЗ');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error('Укажите название проекта'); return; }
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        technical_spec: form.technical_spec,
        complexity: form.complexity,
        planned_start: form.planned_start || null,
        planned_end: form.planned_end || null,
        budget: form.budget ? parseFloat(form.budget) : null,
      };
      await api.post('projects/', payload);
      toast.success('Проект создан!');
      onProjectCreated?.();
      handleClose();
    } catch {
      toast.error('Ошибка при создании проекта');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(0);
    setForm({ name: '', description: '', technical_spec: '', complexity: null, planned_start: '', planned_end: '', budget: '' });
    onClose();
  };

  const canNext = () => {
    if (step === 0) return form.name.trim().length > 0;
    return true;
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden' } }}
    >
      {/* Header */}
      <DialogTitle sx={{ px: 3, pt: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Новый проект</Typography>
          <IconButton onClick={handleClose} size="small" sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Stepper activeStep={step} sx={{ mt: 2 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel sx={{ '& .MuiStepLabel-label': { fontSize: 12 } }}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pb: 1 }}>
        {/* Step 0: Основное */}
        {step === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.75 }}>
                Название проекта <span style={{ color: '#E76F51' }}>*</span>
              </Typography>
              <TextField
                fullWidth size="small" placeholder="Например: Редизайн сайта клиента"
                value={form.name} onChange={set('name')} autoFocus
              />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.75 }}>Описание</Typography>
              <TextField
                fullWidth size="small" multiline rows={3}
                placeholder="Краткое описание проекта..."
                value={form.description} onChange={set('description')}
              />
            </Box>
          </Box>
        )}

        {/* Step 1: ТЗ */}
        {step === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Техническое задание</Typography>
                <Button
                  size="small" startIcon={analyzing ? <CircularProgress size={14} /> : <AutoFixHighIcon fontSize="small" />}
                  onClick={analyzeSpec} disabled={!form.technical_spec.trim() || analyzing}
                  sx={{ fontSize: 12 }}
                >
                  Определить сложность
                </Button>
              </Box>
              <TextField
                fullWidth size="small" multiline rows={6}
                placeholder="Опишите, что нужно разработать: фронтенд, бэкенд, дизайн, API, интеграции..."
                value={form.technical_spec} onChange={set('technical_spec')}
              />
              <ComplexityBadge value={form.complexity} />
            </Box>
          </Box>
        )}

        {/* Step 2: Сроки */}
        {step === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.75 }}>Начало</Typography>
                <TextField fullWidth size="small" type="date" value={form.planned_start} onChange={set('planned_start')} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.75 }}>Окончание</Typography>
                <TextField fullWidth size="small" type="date" value={form.planned_end} onChange={set('planned_end')} />
              </Box>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.75 }}>Бюджет (₽)</Typography>
              <TextField
                fullWidth size="small" type="number" placeholder="0"
                value={form.budget} onChange={set('budget')}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
        <Button onClick={step === 0 ? handleClose : () => setStep((s) => s - 1)} color="inherit" sx={{ color: 'text.secondary' }}>
          {step === 0 ? 'Отмена' : 'Назад'}
        </Button>
        <Box sx={{ flex: 1 }} />
        {step < STEPS.length - 1 ? (
          <Button variant="contained" onClick={() => setStep((s) => s + 1)} disabled={!canNext()}>
            Далее
          </Button>
        ) : (
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {loading ? <CircularProgress size={18} color="inherit" /> : 'Создать проект'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CreateProjectModal;
