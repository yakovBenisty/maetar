import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0d1117',
        card: '#161b22',
        surface: '#21262d',
        border: '#30363d',
        sidebar: '#010409',
        red: '#f85149',
        green: '#3fb950',
        orange: '#d29922',
        blue: '#4493f8',
        purple: '#bc8cff',
        text: '#e6edf3',
        muted: '#8b949e',
      },
    },
  },
  plugins: [],
} satisfies Config;
