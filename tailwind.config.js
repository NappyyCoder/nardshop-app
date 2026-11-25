/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  corePlugins: {
    // Prevent Tailwind's base reset from fighting the project's existing CSS
    preflight: false,
  },
};

