export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        navy: { 900: '#0a0e27', 800: '#111638', 700: '#1a1f3a' },
        accent: { 500: '#6366f1', 600: '#8b5cf6' },
      },
    },
  },
  plugins: [],
}
