import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import CreateProjectModal from '../components/CreateProjectModal';
import { Link } from 'react-router-dom';
import {
  Typography, Button, Grid, Card, CardContent, CardActions,
  LinearProgress, Box, Chip, CircularProgress, Avatar, AvatarGroup,
  Skeleton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import PeopleIcon from '@mui/icons-material/People';
import TaskAltIcon from '@mui/icons-material/TaskAlt';

const STATUS_CONFIG = {
  new:        { label: 'Новый',     color: '#2D9C8E', bg: '#F0F9F7' },
  in_progress:{ label: 'В работе',  color: '#F4845F', bg: '#FEF5F1' },
  completed:  { label: 'Завершён',  color: '#52B788', bg: '#F0FAF4' },
  archived:   { label: 'Архивный',  color: '#90A4AE', bg: '#F5F7F6' },
};

const ProjectCard = ({ proj, isManager }) => {
  const status = STATUS_CONFIG[proj.status] || STATUS_CONFIG.new;
  const progress = proj.progress || 0;
  const membersCount = proj.members?.length || 0;

  return (
    <Card
      sx={{
        height: '100%', display: 'flex', flexDirection: 'column',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(28,43,42,0.12)',
        },
      }}
    >
      <CardContent sx={{ flex: 1, p: 3 }}>
        {/* Status + icon */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box
            sx={{
              width: 44, height: 44, borderRadius: '12px',
              background: 'linear-gradient(135deg, #2D9C8E, #52B788)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <FolderOpenIcon sx={{ color: 'white', fontSize: 22 }} />
          </Box>
          <Chip
            label={status.label}
            size="small"
            sx={{ bgcolor: status.bg, color: status.color, fontWeight: 600, fontSize: 12 }}
          />
        </Box>

        {/* Title */}
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5, lineHeight: 1.3 }}>
          {proj.project_name || proj.name}
        </Typography>

        {proj.description && (
          <Typography
            variant="body2" color="text.secondary"
            sx={{ mb: 2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
          >
            {proj.description}
          </Typography>
        )}

        {/* Stats for manager */}
        {isManager && (
          <>
            <Box sx={{ mt: 'auto' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Прогресс
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {Math.round(progress)}%
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={progress} sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <TaskAltIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {proj.completed_tasks || 0}/{proj.total_tasks || 0} задач
                  </Typography>
                </Box>
                {membersCount > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <PeopleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {membersCount} чел.
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Member avatars */}
              {proj.members?.length > 0 && (
                <AvatarGroup max={5} sx={{ mt: 2, justifyContent: 'flex-start', '& .MuiAvatar-root': { width: 28, height: 28, fontSize: 11 } }}>
                  {proj.members.map((m) => (
                    <Avatar key={m.user_id} sx={{ bgcolor: 'primary.main' }}>
                      {m.full_name?.[0] || m.username?.[0] || '?'}
                    </Avatar>
                  ))}
                </AvatarGroup>
              )}
            </Box>
          </>
        )}
      </CardContent>

      <CardActions sx={{ px: 3, pb: 2.5, pt: 0 }}>
        <Button
          size="small"
          variant="outlined"
          component={Link}
          to={`/projects/${proj.project_id || proj.id}`}
          sx={{ borderColor: 'rgba(45,156,142,0.3)', color: 'primary.main', '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(45,156,142,0.04)' } }}
        >
          Открыть
        </Button>
      </CardActions>
    </Card>
  );
};

const SkeletonCard = () => (
  <Card sx={{ p: 3 }}>
    <Skeleton variant="rounded" width={44} height={44} sx={{ mb: 2, borderRadius: '12px' }} />
    <Skeleton variant="text" width="70%" height={28} sx={{ mb: 1 }} />
    <Skeleton variant="text" width="90%" />
    <Skeleton variant="text" width="60%" sx={{ mb: 2 }} />
    <Skeleton variant="rounded" height={6} sx={{ borderRadius: 4 }} />
  </Card>
);

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const { user } = useAuth();

  const isManager = user?.role === 'manager' || user?.role === 'admin';

  const fetchProjects = async () => {
    try {
      const url = isManager ? 'dashboard/' : 'projects/';
      const res = await api.get(url);
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
            Проекты
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {loading ? '...' : `${projects.length} ${projects.length === 1 ? 'проект' : 'проектов'}`}
          </Typography>
        </Box>
        {isManager && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setModalOpen(true)}
            sx={{ flexShrink: 0 }}
          >
            Создать проект
          </Button>
        )}
      </Box>

      {/* Grid */}
      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <SkeletonCard />
            </Grid>
          ))}
        </Grid>
      ) : projects.length === 0 ? (
        <Box
          sx={{
            bgcolor: 'white', borderRadius: '16px', p: 8, textAlign: 'center',
            border: '1px solid rgba(45,156,142,0.12)',
          }}
        >
          <FolderOpenIcon sx={{ fontSize: 56, color: 'rgba(45,156,142,0.3)', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
            Проектов пока нет
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {isManager ? 'Создайте первый проект, чтобы начать работу' : 'Вас ещё не добавили ни в один проект'}
          </Typography>
          {isManager && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setModalOpen(true)}>
              Создать первый проект
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {projects.map((proj) => (
            <Grid item xs={12} sm={6} md={4} key={proj.project_id || proj.id}>
              <ProjectCard proj={proj} isManager={isManager} />
            </Grid>
          ))}
        </Grid>
      )}

      <CreateProjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onProjectCreated={() => { fetchProjects(); setModalOpen(false); }}
      />
    </Box>
  );
};

export default Projects;
