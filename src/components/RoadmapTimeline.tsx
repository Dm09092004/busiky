// =====================================================
//  Визуализация roadmap в виде временной шкалы (Gantt-style)
// =====================================================
import { Box, Typography, Paper, Tooltip } from '@mui/material';
import type { RoadmapStage } from '../types';

interface Props {
  stages: RoadmapStage[];
}

const STAGE_COLORS: Record<string, string> = {
  done: '#27AE60',
  in_progress: '#4DB6AC',
  pending: '#7F8C8D',
};

export function RoadmapTimeline({ stages }: Props) {
  if (stages.length === 0) return null;

  // Общая временная шкала
  const dates = stages.flatMap((s) => [s.planned_start, s.planned_end]);
  const minDate = new Date(dates.sort()[0]).getTime();
  const maxDate = new Date(dates.sort().reverse()[0]).getTime();
  const totalMs = maxDate - minDate;
  if (totalMs === 0) return null;

  const positionFor = (date: string) => ((new Date(date).getTime() - minDate) / totalMs) * 100;

  return (
    <Paper sx={{ p: 3, overflow: 'auto' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Временная шкала проекта</Typography>

      {/* Шкала месяцев */}
      <Box sx={{ position: 'relative', height: 24, mb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        {(() => {
          const months: { x: number; label: string }[] = [];
          const cur = new Date(minDate);
          cur.setDate(1);
          while (cur.getTime() <= maxDate) {
            const x = positionFor(cur.toISOString().split('T')[0]);
            months.push({ x, label: cur.toLocaleDateString('ru-RU', { month: 'short' }) });
            cur.setMonth(cur.getMonth() + 1);
          }
          return months.map((m, i) => (
            <Box key={i} sx={{
              position: 'absolute', left: `${m.x}%`, top: 0, transform: 'translateX(-50%)',
              fontSize: 11, color: 'text.secondary', fontWeight: 500,
            }}>
              {m.label}
            </Box>
          ));
        })()}
      </Box>

      {/* Полосы этапов */}
      <Box sx={{ position: 'relative', py: 1 }}>
        {stages.map((stage, i) => {
          const left = positionFor(stage.planned_start);
          const width = positionFor(stage.planned_end) - left;
          const color = STAGE_COLORS[stage.status] ?? STAGE_COLORS.pending;
          return (
            <Tooltip
              key={stage.id}
              title={`${stage.name}: ${stage.planned_start} → ${stage.planned_end} (${stage.estimated_hours}ч)`}
            >
              <Box sx={{
                position: 'relative', height: 36, mb: 0.5,
                bgcolor: 'rgba(77, 182, 172, 0.04)', borderRadius: 1,
              }}>
                <Box sx={{
                  position: 'absolute',
                  left: `${left}%`, width: `${Math.max(width, 2)}%`,
                  top: 4, bottom: 4, borderRadius: 1.5,
                  bgcolor: color, opacity: stage.status === 'pending' ? 0.5 : 0.85,
                  display: 'flex', alignItems: 'center', px: 1.5,
                  color: '#fff', fontSize: 12, fontWeight: 500,
                  overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                  cursor: 'pointer', transition: 'all 0.2s',
                  '&:hover': { opacity: 1, transform: 'scaleY(1.05)' },
                }}>
                  <Box sx={{ minWidth: 22, height: 22, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, mr: 1 }}>
                    {i + 1}
                  </Box>
                  {stage.name}
                </Box>
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Paper>
  );
}
