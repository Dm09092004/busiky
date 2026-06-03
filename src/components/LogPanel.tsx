// =====================================================
//  Панель системных логов (правый нижний угол)
// =====================================================
import { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, IconButton, Chip,
} from '@mui/material';
import { Icon } from './Icons';
import { logger, type LogEntry } from '../utils/logger';
import { useApp } from '../context/AppContext';

const LEVEL_COLORS: Record<string, string> = {
  info:    '#5C6BC0',
  success: '#27AE60',
  warn:    '#F39C12',
  error:   '#E74C3C',
  debug:   '#7F8C8D',
};

const LEVEL_LABELS: Record<string, string> = {
  info: 'INFO', success: 'OK ', warn: 'WARN', error: 'ERR ', debug: 'DBG',
};

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function LogPanel() {
  const { showLogs, setShowLogs } = useApp();
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    return logger.subscribe(setLogs);
  }, []);

  if (!showLogs) {
    return (
      <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1300 }}>
        <IconButton
          onClick={() => setShowLogs(true)}
          sx={{
            bgcolor: 'primary.main', color: '#fff',
            '&:hover': { bgcolor: 'primary.dark' },
            boxShadow: '0 4px 20px rgba(77, 182, 172, 0.4)',
          }}
          size="large"
          title="Открыть системные логи"
        >
          <Icon.Log size={22} />
        </IconButton>
      </Box>
    );
  }

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed', bottom: 24, right: 24, width: 460, maxHeight: 540,
        zIndex: 1300, display: 'flex', flexDirection: 'column',
        border: '1px solid', borderColor: 'primary.light',
      }}
    >
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        p: 1.5, borderBottom: '1px solid', borderColor: 'divider',
        bgcolor: 'primary.main', color: '#fff',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Icon.Log size={18} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Системные логи</Typography>
          <Chip size="small" label={logs.length} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 11 }} />
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton size="small" sx={{ color: '#fff' }} onClick={() => { logger.clear(); }} title="Очистить">
            <Icon.Trash size={16} />
          </IconButton>
          <IconButton size="small" sx={{ color: '#fff' }} onClick={() => setShowLogs(false)} title="Закрыть">
            <Icon.Close size={18} />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ overflow: 'auto', flex: 1, p: 1, fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>
        {logs.length === 0 && (
          <Typography variant="caption" sx={{ color: 'text.secondary', p: 2, display: 'block', textAlign: 'center' }}>
            Логи пока пусты. Войдите или выполните действие.
          </Typography>
        )}
        {logs.slice().reverse().map((l) => (
          <Box key={l.id} sx={{ py: 0.4, borderBottom: '1px dashed', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'baseline' }}>
              <Typography component="span" sx={{ color: 'text.secondary', fontSize: 11 }}>{formatTime(l.ts)}</Typography>
              <Typography component="span" sx={{ color: LEVEL_COLORS[l.level], fontWeight: 700, fontSize: 11 }}>
                [{LEVEL_LABELS[l.level]}]
              </Typography>
              <Typography component="span" sx={{ color: 'primary.dark', fontSize: 11 }}>
                {l.scope}:
              </Typography>
              <Typography component="span" sx={{ color: 'text.primary', fontSize: 12 }}>{l.message}</Typography>
            </Box>
            {l.data !== undefined && (
              <Typography component="pre" sx={{
                m: 0, ml: 2, color: 'text.secondary', fontSize: 10,
                whiteSpace: 'pre-wrap', wordBreak: 'break-all',
              }}>
                {typeof l.data === 'string' ? l.data : JSON.stringify(l.data, null, 2)}
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
