/**
 * PrepWise "Warm Editorial Tech" Design System Tokens
 */
export const theme = {
  colors: {
    light: {
      canvas: '#F7F5F0',
      surface: '#EFECE6',
      surfaceAlt: '#EAE6DF',
      primaryText: '#111111',
      secondaryText: '#5E5B56',
      border: '1px solid rgba(0,0,0,0.08)',
      badgeBg: '#EFECE6',
      badgeBorder: 'rgba(0,0,0,0.08)',
      badgeText: '#C85232',
      secondaryBtnBg: '#EAE6DF',
      secondaryBtnBorder: '1px solid rgba(0,0,0,0.15)',
      secondaryBtnText: '#111111',
    },
    dark: {
      canvas: '#121212',
      canvasSecondary: '#161616',
      surface: '#1E1E1E',
      surfaceContainer: '#242424',
      primaryText: '#FFFFFF',
      secondaryText: '#A0A0A0',
      border: '1px solid rgba(255,255,255,0.12)',
      badgeBg: '#242424',
      badgeBorder: 'rgba(255,255,255,0.12)',
      badgeText: '#D9603B',
      secondaryBtnBg: '#242424',
      secondaryBtnBorder: '1px solid rgba(255,255,255,0.15)',
      secondaryBtnText: '#FFFFFF',
    },
    brand: {
      primaryCta: '#C85232', // Rust Terracotta
      hover: '#A43A1E',      // Deep Copper
      secondaryAccent: '#D9603B', // Badges, tags
    },
  },
  typography: {
    fonts: {
      body: "'Inter', 'Plus Jakarta Sans', 'Geist', system-ui, -apple-system, sans-serif",
      heading: "'Instrument Sans', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      mono: "'JetBrains Mono', 'Geist Mono', monospace",
    },
    h1: {
      fontSize: '48px',
      fontWeight: '700',
      letterSpacing: '-0.025em',
      lineHeight: '1.15',
    },
    h2: {
      fontSize: '32px',
      fontWeight: '700',
      letterSpacing: '-0.02em',
      lineHeight: '1.2',
    },
    h3: {
      fontSize: '22px',
      fontWeight: '700',
      letterSpacing: '-0.015em',
      lineHeight: '1.3',
    },
    bodyLarge: {
      fontSize: '18px',
      lineHeight: '1.6',
    },
    body: {
      fontSize: '16px',
      lineHeight: '1.55',
    },
    small: {
      fontSize: '14px',
      lineHeight: '1.4',
    },
  },
  radius: {
    smallControls: '8px',
    cards: '14px',
    pills: '9999px',
  },
  shadows: {
    card: 'none',
    floating: '0 12px 32px -4px rgba(0,0,0,0.25)',
  },
  spacing: [8, 16, 24, 32, 48, 64, 80, 112],
};

export default theme;
