/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'Courier New', 'monospace'],
            },
            colors: {
                primary: {
                    50: '#ecfdf5',
                    100: '#d1fae5',
                    200: '#a7f3d0',
                    300: '#6ee7b7',
                    400: '#34d399',
                    500: '#10b981',
                    600: '#059669',
                    700: '#047857',
                    800: '#065f46',
                    900: '#064e3b',
                },
                accent: {
                    blue: '#3b82f6',
                    purple: '#8b5cf6',
                    amber: '#f59e0b',
                    red: '#ef4444',
                    orange: '#f97316',
                },
            },
            boxShadow: {
                'card': '0 1px 4px 0 rgba(0,0,0,0.07)',
                'card-hover': '0 4px 16px 0 rgba(0,0,0,0.10)',
                'card-elevated': '0 8px 24px 0 rgba(0,0,0,0.10)',
                'navbar': '0 1px 0 0 rgba(0,0,0,0.06)',
            },
            borderRadius: {
                'xl': '12px',
                '2xl': '16px',
                '3xl': '24px',
            },
            fontSize: {
                '2xs': ['10px', '14px'],
            },
        },
    },
    plugins: [],
}
