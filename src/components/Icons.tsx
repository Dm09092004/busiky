// =====================================================
//  SVG-иконки (без эмодзи!)
//  Заменяют эмодзи на стилизованные векторные символы
// =====================================================
import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (size = 20): SVGProps<SVGSVGElement> => ({
  width: size, height: size, viewBox: '0 0 24 24',
  fill: 'none', stroke: 'currentColor', strokeWidth: 1.8,
  strokeLinecap: 'round', strokeLinejoin: 'round',
});

export const Icon = {
  Dashboard: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>
  ),
  Projects: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M3 7h18M3 12h18M3 17h18"/><path d="M3 7l2-3h4l2 3M3 12l2-3h4l2 3M3 17l2-3h4l2 3"/></svg>
  ),
  MyDay: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
  ),
  Analytics: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M3 3v18h18"/><path d="M7 15l3-4 4 3 5-7"/></svg>
  ),
  Profile: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>
  ),
  Plus: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M12 5v14M5 12h14"/></svg>
  ),
  Play: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p} fill="currentColor" stroke="none"><path d="M6 4l14 8-14 8z"/></svg>
  ),
  Pause: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p} fill="currentColor" stroke="none"><rect x="5" y="4" width="5" height="16"/><rect x="14" y="4" width="5" height="16"/></svg>
  ),
  Stop: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p} fill="currentColor" stroke="none"><rect x="5" y="5" width="14" height="14" rx="1"/></svg>
  ),
  Edit: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M4 20h4l11-11-4-4L4 16v4z"/><path d="M14 6l4 4"/></svg>
  ),
  Delete: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/><path d="M10 11v6M14 11v6"/></svg>
  ),
  Check: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M5 13l4 4L19 7"/></svg>
  ),
  Close: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M6 6l12 12M18 6L6 18"/></svg>
  ),
  Sparkle: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/><circle cx="12" cy="12" r="3"/></svg>
  ),
  Lightning: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg>
  ),
  Coffee: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M17 8h1a3 3 0 010 6h-1"/><path d="M3 8h14v8a4 4 0 01-4 4H7a4 4 0 01-4-4V8z"/><path d="M7 4v2M11 4v2M15 4v2"/></svg>
  ),
  Target: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>
  ),
  Team: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M15 20c0-2.2 1.5-4 4-4"/></svg>
  ),
  Calendar: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>
  ),
  Log: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>
  ),
  Settings: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1A2 2 0 113.3 17l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H2a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1A2 2 0 116 3.3l.1.1a1.7 1.7 0 001.8.3H8a1.7 1.7 0 001-1.5V2a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V8a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg>
  ),
  Logout: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
  ),
  Search: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
  ),
  Filter: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M3 5h18M6 12h12M10 19h4"/></svg>
  ),
  Bell: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M14 21a2 2 0 01-4 0"/></svg>
  ),
  Flame: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M12 2c0 4-4 6-4 10a4 4 0 008 0c0-1.5-1-2-1-3 0 0 2 1 2 4a6 6 0 11-12 0c0-5 7-7 7-11z"/></svg>
  ),
  Clock: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
  ),
  CheckSquare: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M9 11l3 3 8-8"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
  ),
  Square: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
  ),
  ChevronRight: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M9 6l6 6-6 6"/></svg>
  ),
  Refresh: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M3 12a9 9 0 0115-6.7L21 8M21 3v5h-5M21 12a9 9 0 01-15 6.7L3 16M3 21v-5h5"/></svg>
  ),
  Trending: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>
  ),
  ArrowUp: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M12 19V5M5 12l7-7 7 7"/></svg>
  ),
  ArrowDown: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
  ),
  Star: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p} fill="currentColor" stroke="none"><path d="M12 2l3 7 7 .5-5.5 4.5L18 21l-6-4-6 4 1.5-7L2 9.5 9 9z"/></svg>
  ),
  Fire: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M12 2c0 4-4 6-4 10a4 4 0 008 0c0-1.5-1-2-1-3 0 0 2 1 2 4a6 6 0 11-12 0c0-5 7-7 7-11z"/></svg>
  ),
  Briefcase: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
  ),
  Sun: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
  ),
  Moon: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>
  ),
  Trophy: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M6 4h12v3a6 6 0 11-12 0V4z"/><path d="M6 5H3a3 3 0 003 3M18 5h3a3 3 0 01-3 3"/><path d="M9 17h6M10 20h4M12 14v3"/></svg>
  ),
  Drag: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><circle cx="9" cy="6" r="1" fill="currentColor"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="9" cy="18" r="1" fill="currentColor"/><circle cx="15" cy="6" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="18" r="1" fill="currentColor"/></svg>
  ),
  PlusCircle: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>
  ),
  MoreVertical: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><circle cx="12" cy="5" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="19" r="1.5" fill="currentColor"/></svg>
  ),
  ChartBar: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="8" width="3" height="10"/><rect x="17" y="5" width="3" height="13"/></svg>
  ),
  ChartPie: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M21 12A9 9 0 1112 3v9z"/><path d="M21 12a9 9 0 00-9-9v9z"/></svg>
  ),
  Folder: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>
  ),
  Heart: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M12 21s-7-4.5-9-9.5C1.5 7 4 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 3 0 5.5 3 5.5 7.5-2 5-9 9.5-9 9.5z"/></svg>
  ),
  Zap: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg>
  ),
  User: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>
  ),
  Layers: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
  ),
  Trash: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
  ),
  Wand: ({ size, ...p }: IconProps) => (
    <svg {...base(size)} {...p}><path d="M15 4l5 5L9 20l-5 1 1-5z"/><path d="M14 5l5 5"/><path d="M20 3v3M22 5h-4"/></svg>
  ),
};
