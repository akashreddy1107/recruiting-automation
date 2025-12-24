export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: 'rgb(var(--c-obsidian) / <alpha-value>)',
        charcoal: 'rgb(var(--c-charcoal) / <alpha-value>)',
        graphite: 'rgb(var(--c-graphite) / <alpha-value>)',
        primary: 'rgb(var(--c-text-primary) / <alpha-value>)',
        secondary: 'rgb(var(--c-text-secondary) / <alpha-value>)',
        border: 'rgb(var(--c-border) / <alpha-value>)',
        'accent-blue': '#4285F4',
        'accent-purple': '#A142F4',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
