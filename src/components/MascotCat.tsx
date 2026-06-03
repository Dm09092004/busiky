import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

interface MascotCatProps {
  mood: 'happy' | 'working' | 'tired' | 'celebrating' | 'sleeping' | 'encouraging';
  message: string;
  progress?: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function MascotCat({ mood, message, progress = 0, size = 'md' }: MascotCatProps) {
  const { colors } = useTheme();
  const [blink, setBlink] = useState(false);
  const [bounce, setBounce] = useState(false);

  // Blinking animation
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  // Bounce on celebration
  useEffect(() => {
    if (mood === 'celebrating') {
      setBounce(true);
      const timer = setTimeout(() => setBounce(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [mood]);

  const sizes = {
    sm: { width: 60, height: 60 },
    md: { width: 100, height: 100 },
    lg: { width: 140, height: 140 },
  };

  const { width, height } = sizes[size];

  // Eyes based on mood
  const renderEyes = () => {
    const eyeY = 42;
    const leftX = 38;
    const rightX = 62;

    if (blink || mood === 'sleeping') {
      return (
        <g>
          <path d={`M${leftX-5} ${eyeY} Q${leftX} ${eyeY-4}, ${leftX+5} ${eyeY}`} 
            stroke="#374151" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d={`M${rightX-5} ${eyeY} Q${rightX} ${eyeY-4}, ${rightX+5} ${eyeY}`} 
            stroke="#374151" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      );
    }

    if (mood === 'happy' || mood === 'celebrating') {
      return (
        <g>
          <path d={`M${leftX-5} ${eyeY-2} Q${leftX} ${eyeY+5}, ${leftX+5} ${eyeY-2}`} 
            stroke="#374151" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d={`M${rightX-5} ${eyeY-2} Q${rightX} ${eyeY+5}, ${rightX+5} ${eyeY-2}`} 
            stroke="#374151" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      );
    }

    if (mood === 'tired') {
      return (
        <g>
          <ellipse cx={leftX} cy={eyeY} rx="5" ry="4" fill="#374151" />
          <ellipse cx={rightX} cy={eyeY} rx="5" ry="4" fill="#374151" />
          <line x1={leftX-6} y1={eyeY-5} x2={leftX+4} y2={eyeY-2} stroke="#374151" strokeWidth="2" strokeLinecap="round" />
          <line x1={rightX+6} y1={eyeY-5} x2={rightX-4} y2={eyeY-2} stroke="#374151" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    }

    // Default/working eyes
    return (
      <g>
        <ellipse cx={leftX} cy={eyeY} rx="6" ry="7" fill="#374151" />
        <ellipse cx={rightX} cy={eyeY} rx="6" ry="7" fill="#374151" />
        <circle cx={leftX+2} cy={eyeY-2} r="2.5" fill="white" />
        <circle cx={rightX+2} cy={eyeY-2} r="2.5" fill="white" />
        {mood === 'working' && (
          <>
            <ellipse cx={leftX} cy={eyeY} rx="6" ry="7" fill="#374151">
              <animate attributeName="ry" values="7;5;7" dur="2s" repeatCount="indefinite" />
            </ellipse>
          </>
        )}
      </g>
    );
  };

  // Mouth based on mood
  const renderMouth = () => {
    const mouthY = 56;
    
    if (mood === 'sleeping') {
      return <ellipse cx="50" cy={mouthY} rx="3" ry="2" fill="#374151" />;
    }
    
    if (mood === 'happy' || mood === 'celebrating') {
      return (
        <g>
          <path d="M43 54 Q50 64, 57 54" stroke="#374151" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {mood === 'celebrating' && (
            <path d="M46 58 Q50 63, 54 58" fill="#f472b6" />
          )}
        </g>
      );
    }
    
    if (mood === 'tired') {
      return <path d="M44 58 Q50 53, 56 58" stroke="#374151" strokeWidth="2" fill="none" strokeLinecap="round" />;
    }
    
    if (mood === 'encouraging') {
      return (
        <g>
          <path d="M44 54 Q50 61, 56 54" stroke="#374151" strokeWidth="2" fill="none" strokeLinecap="round" />
          <ellipse cx="50" cy="57" rx="4" ry="3" fill="#374151" />
        </g>
      );
    }
    
    // Default
    return <path d="M46 56 Q50 60, 54 56" stroke="#374151" strokeWidth="2" fill="none" strokeLinecap="round" />;
  };

  return (
    <div className="flex flex-col items-center">
      {/* Cat SVG */}
      <div 
        className={`relative transition-transform duration-300 ${
          bounce ? 'animate-bounce' : ''
        } ${mood === 'working' ? '' : ''}`}
        style={{ filter: mood === 'sleeping' ? 'saturate(0.7)' : 'none' }}
      >
        <svg 
          width={width} 
          height={height} 
          viewBox="0 0 100 100"
          className="drop-shadow-lg"
        >
          <defs>
            <linearGradient id={`catGradient-${mood}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.primary} />
              <stop offset="100%" stopColor={colors.accent} />
            </linearGradient>
            <linearGradient id={`catGradientLight-${mood}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.primaryLight} />
              <stop offset="100%" stopColor={colors.primary} />
            </linearGradient>
          </defs>

          {/* Tail */}
          <path 
            d="M75 70 Q90 65, 88 50 Q86 40, 80 42"
            stroke={`url(#catGradient-${mood})`}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          >
            {mood === 'happy' && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 75 70;10 75 70;0 75 70;-10 75 70;0 75 70"
                dur="1s"
                repeatCount="indefinite"
              />
            )}
          </path>

          {/* Body */}
          <ellipse cx="50" cy="68" rx="28" ry="22" fill={`url(#catGradient-${mood})`} />
          
          {/* Belly */}
          <ellipse cx="50" cy="72" rx="18" ry="14" fill="white" opacity="0.3" />

          {/* Head */}
          <circle cx="50" cy="44" r="28" fill={`url(#catGradient-${mood})`} />

          {/* Ears */}
          <path d="M24 28 L32 44 L18 38 Z" fill={`url(#catGradient-${mood})`} />
          <path d="M76 28 L68 44 L82 38 Z" fill={`url(#catGradient-${mood})`} />
          
          {/* Inner ears */}
          <path d="M26 32 L30 42 L22 38 Z" fill={`url(#catGradientLight-${mood})`} />
          <path d="M74 32 L70 42 L78 38 Z" fill={`url(#catGradientLight-${mood})`} />

          {/* Face */}
          <ellipse cx="50" cy="52" rx="16" ry="13" fill="white" />

          {/* Eyes */}
          {renderEyes()}

          {/* Nose */}
          <path d="M47 50 L50 53 L53 50 Z" fill="#f472b6" />
          <ellipse cx="50" cy="51" rx="4" ry="3" fill="#f472b6" />

          {/* Mouth */}
          {renderMouth()}

          {/* Whiskers */}
          <g stroke="#9ca3af" strokeWidth="1.5" opacity="0.6">
            <line x1="30" y1="50" x2="14" y2="46" />
            <line x1="30" y1="53" x2="14" y2="53" />
            <line x1="30" y1="56" x2="14" y2="60" />
            <line x1="70" y1="50" x2="86" y2="46" />
            <line x1="70" y1="53" x2="86" y2="53" />
            <line x1="70" y1="56" x2="86" y2="60" />
          </g>

          {/* Blush */}
          {(mood === 'happy' || mood === 'celebrating' || mood === 'encouraging') && (
            <g opacity="0.4">
              <ellipse cx="32" cy="52" rx="5" ry="3" fill="#f472b6" />
              <ellipse cx="68" cy="52" rx="5" ry="3" fill="#f472b6" />
            </g>
          )}

          {/* Front paws */}
          <ellipse cx="36" cy="88" rx="9" ry="6" fill={`url(#catGradient-${mood})`} />
          <ellipse cx="64" cy="88" rx="9" ry="6" fill={`url(#catGradient-${mood})`} />
          
          {/* Paw details */}
          <g fill="white" opacity="0.5">
            <circle cx="33" cy="88" r="2" />
            <circle cx="37" cy="88" r="2" />
            <circle cx="61" cy="88" r="2" />
            <circle cx="65" cy="88" r="2" />
          </g>

          {/* Sleeping Zs */}
          {mood === 'sleeping' && (
            <g fill={colors.primary} className="animate-pulse">
              <text x="72" y="22" fontSize="10" fontWeight="bold" opacity="0.8">Z</text>
              <text x="80" y="15" fontSize="8" fontWeight="bold" opacity="0.6">z</text>
              <text x="86" y="10" fontSize="6" fontWeight="bold" opacity="0.4">z</text>
            </g>
          )}

          {/* Stars for celebrating */}
          {mood === 'celebrating' && (
            <g className="animate-spin" style={{ transformOrigin: '50px 50px', animationDuration: '4s' }}>
              <polygon points="12,18 14,24 20,24 15,28 17,34 12,30 7,34 9,28 4,24 10,24" fill="#fbbf24" />
              <polygon points="88,14 90,20 96,20 91,24 93,30 88,26 83,30 85,24 80,20 86,20" fill="#fbbf24" />
            </g>
          )}

          {/* Sweat drop for tired */}
          {mood === 'tired' && (
            <g className="animate-pulse">
              <ellipse cx="76" cy="32" rx="4" ry="6" fill="#60a5fa" />
              <ellipse cx="76" cy="30" rx="2" ry="2" fill="white" opacity="0.5" />
            </g>
          )}

          {/* Hearts for encouraging */}
          {mood === 'encouraging' && (
            <g fill="#ec4899" className="animate-heartbeat">
              <path d="M82 28 C82 24, 86 24, 86 28 C86 24, 90 24, 90 28 C90 32, 86 36, 86 36 C86 36, 82 32, 82 28" />
            </g>
          )}

          {/* Working indicator */}
          {mood === 'working' && (
            <g>
              <circle cx="82" cy="20" r="8" fill={colors.primary} className="animate-pulse" />
              <path d="M79 20 L81 22 L85 18" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )}
        </svg>
      </div>

      {/* Message bubble */}
      <div 
        className="mt-3 px-4 py-2 rounded-2xl shadow-lg border-2 animate-fadeIn relative"
        style={{ 
          backgroundColor: `${colors.primary}15`,
          borderColor: `${colors.primary}40`,
        }}
      >
        {/* Bubble pointer */}
        <div 
          className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 border-l-2 border-t-2"
          style={{ 
            backgroundColor: `${colors.primary}15`,
            borderColor: `${colors.primary}40`,
          }}
        />
        <p className="text-sm font-medium text-gray-700 text-center relative z-10">{message}</p>
      </div>

      {/* Progress bar */}
      {progress > 0 && (
        <div className="mt-3 w-full max-w-[120px]">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${progress}%`,
                background: `linear-gradient(to right, ${colors.primary}, ${colors.accent})`,
              }}
            />
          </div>
          <p className="text-xs text-gray-500 text-center mt-1">{Math.round(progress)}% сессии</p>
        </div>
      )}
    </div>
  );
}
