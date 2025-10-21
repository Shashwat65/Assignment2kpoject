/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        canvasBg: '#0b1020',
        panel: '#0f172a',
        panelAccent: '#1e293b',
        primary: '#38bdf8',
        primaryMuted: '#7dd3fc',
        textSoft: '#cbd5e1',
      }
    },
  },
  plugins: [],
}
