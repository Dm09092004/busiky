import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Grid, Typography, Alert,
  Avatar, Divider, Chip, CircularProgress, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const API_BASE = 'http://localhost:8000/api';

const Profile = () => {
 const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    position: '',
    hourly_rate: '',
    work_start_time: '',
    work_end_time: '',
    lunch_start: '',
    lunch_end: '',
  });
  const [skills, setSkills] = useState([]);
  const [openSkillDialog, setOpenSkillDialog] = useState(false);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [newSkill, setNewSkill] = useState({ skill: '', level: 3 });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        position: user.position || '',
        hourly_rate: user.hourly_rate || '',
        work_start_time: user.work_start_time || '',
        work_end_time: user.work_end_time || '',
        lunch_start: user.lunch_start || '',
        lunch_end: user.lunch_end || '',
      });
      fetchSkills();
      fetchAvailableSkills();
    }
  }, [user]);

  const fetchSkills = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE}/users/${user.id}/skills/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSkills(data);
      }
    } catch (err) {
      console.error('Ошиб��а загрузки навыков:', err);
    }
  };

  const fetchAvailableSkills = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE}/skills/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAvailableSkills(data);
      }
    } catch (err) {
      console.error('Ошибка загрузки доступных навыков:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE}/users/${user.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
  setEditing(false);
  toast.success('Профиль обновлен!');
  window.location.reload();
      } else {
        toast.error('Ошибка при сохранении профиля');
      }
    } catch (err) {
      console.error('Ошибка:', err);
      toast.error('Ошибка при сохранении профиля');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.skill) {
      toast.error('Выберите навык');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE}/users/${user.id}/skills/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skill_id: newSkill.skill,
          level: newSkill.level,
          years_experience: 0,
        }),
      });

      if (res.ok) {
        toast.success('Навык добавлен!');
        setOpenSkillDialog(false);
        setNewSkill({ skill: '', level: 3 });
        fetchSkills();
      } else {
        toast.error('Ошибка при добавлении навыка');
      }
    } catch (err) {
      console.error('Ошибка:', err);
      toast.error('Ошибка при добавлении навыка');
    }
  };

  const handleDeleteSkill = async (skillId) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE}/users/${user.id}/skills/${skillId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success('Навык удален!');
        fetchSkills();
      } else {
        toast.error('Ошибка при удалении навыка');
      }
    } catch (err) {
      console.error('Ошибка:', err);
      toast.error('Ошибка при удалении навыка');
    }
  };

  if (!user) return <CircularProgress />;

  const initials = user.first_name
    ? `${user.first_name[0]}${user.last_name?.[0] || ''}`.toUpperCase()
    : user.username[0].toUpperCase();

  const levelLabels = {
    1: 'Новичок',
    2: 'Базовый',
    3: 'Средний',
    4: 'Продвинутый',
    5: 'Эксперт',
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      {/* Заголовок профиля */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                fontSize: 40,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #2D9C8E 0%, #52B788 100%)',
              }}
            >
              {initials}
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.username}
              </Typography>
              <Chip
                label={user.role === 'employee' ? 'Сотрудник' : user.role === 'manager' ? 'Менеджер' : 'Администратор'}
                color={user.role === 'admin' ? 'error' : user.role === 'manager' ? 'secondary' : 'primary'}
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
            {!editing && (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => setEditing(true)}
                sx={{ ml: 'auto' }}
              >
                Редактировать
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Форма профиля */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            Информация профиля
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Имя"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                disabled={!editing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Фамилия"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                disabled={!editing}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!editing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Должность"
                name="position"
                value={formData.position}
                onChange={handleChange}
                disabled={!editing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Почасовая ставка"
                name="hourly_rate"
                type="number"
                value={formData.hourly_rate}
                onChange={handleChange}
                disabled={!editing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Начало рабочего дня"
                name="work_start_time"
                type="time"
                value={formData.work_start_time}
                onChange={handleChange}
                disabled={!editing}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Конец рабочего дня"
                name="work_end_time"
                type="time"
                value={formData.work_end_time}
                onChange={handleChange}
                disabled={!editing}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Начало обеда"
                name="lunch_start"
                type="time"
                value={formData.lunch_start}
                onChange={handleChange}
                disabled={!editing}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Конец обеда"
                name="lunch_end"
                type="time"
                value={formData.lunch_end}
                onChange={handleChange}
                disabled={!editing}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          {editing && (
            <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Сохранить'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => setEditing(false)}
                disabled={loading}
              >
                Отмена
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Навыки */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Навыки
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              size="small"
              onClick={() => setOpenSkillDialog(true)}
            >
              Добавить
            </Button>
          </Box>

          {skills.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'background.paper' }}>
                    <TableCell>Навык</TableCell>
                    <TableCell align="center">Уровень</TableCell>
                    <TableCell align="center">Опыт (лет)</TableCell>
                    <TableCell align="center">Действие</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {skills.map((skill) => (
                    <TableRow key={skill.id}>
                      <TableCell>{skill.skill_name}</TableCell>
                      <TableCell align="center">
                        <Chip label={levelLabels[skill.level]} size="small" />
                      </TableCell>
                      <TableCell align="center">{skill.years_experience}</TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteSkill(skill.id)}
                        >
                          Удалить
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">Навыки не добавлены</Alert>
          )}
        </CardContent>
      </Card>

      {/* Диалог добавления навыка */}
      <Dialog open={openSkillDialog} onClose={() => setOpenSkillDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Добавить навык</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Навык</InputLabel>
            <Select
              value={newSkill.skill}
              label="Навык"
              onChange={(e) => setNewSkill(prev => ({ ...prev, skill: e.target.value }))}
            >
              {availableSkills.map((skill) => (
                <MenuItem key={skill.id} value={skill.id}>
                  {skill.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Уровень</InputLabel>
            <Select
              value={newSkill.level}
              label="Уровень"
              onChange={(e) => setNewSkill(prev => ({ ...prev, level: e.target.value }))}
            >
              {Object.entries(levelLabels).map(([key, value]) => (
                <MenuItem key={key} value={parseInt(key)}>
                  {value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSkillDialog(false)}>Отмена</Button>
          <Button onClick={handleAddSkill} variant="contained">
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
