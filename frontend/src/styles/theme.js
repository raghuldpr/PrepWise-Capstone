export const theme = {
  colors: {
    light: {
      canvas: '#F7F5F0',
      surface: '#EFECE6',
      surfaceAlt: '#EAE6DF',
      primaryText: '#111111',
      secondaryText: '#5E5B56',
      border: '1px solid rgba(0,0,0,0.08)',
    },
    dark: {
      canvas: '#121212',
      canvasSecondary: '#161616',
      surface: '#1E1E1E',
      surfaceContainer: '#242424',
      primaryText: '#FFFFFF',
      secondaryText: '#A0A0A0',
      border: '1px solid rgba(255,255,255,0.12)',
    },
    brand: {
      primaryCta: '#C85232',
      hover: '#A43A1E',
      secondaryAccent: '#D9603B',
    },
  },
  typography: {
    fonts: {
      body: "'Inter', 'Plus Jakarta Sans', 'Geist', system-ui, sans-serif",
      heading: "'Instrument Sans', 'Plus Jakarta Sans', system-ui, sans-serif",
      mono: "'JetBrains Mono', 'Geist Mono', monospace",
    },
    h1: { fontSize: '60px', fontWeight: '750', letterSpacing: '-0.025em', lineHeight: '1.1' },
    h2: { fontSize: '40px', fontWeight: '700', letterSpacing: '-0.02em', lineHeight: '1.2' },
    h3: { fontSize: '22px', fontWeight: '600', lineHeight: '1.3' },
    bodyLarge: { fontSize: '18px', lineHeight: '1.6' },
    body: { fontSize: '16px', lineHeight: '1.55' },
    small: { fontSize: '14px', lineHeight: '1.4' },
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
