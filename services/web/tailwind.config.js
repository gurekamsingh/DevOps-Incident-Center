/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors for incident severity
        'critical': '#dc2626',    // red-600
        'warning': '#d97706',     // amber-600
        'info': '#2563eb',        // blue-600
        'success': '#16a34a',     // green-600
      }
    },
  },
  plugins: [],
}
