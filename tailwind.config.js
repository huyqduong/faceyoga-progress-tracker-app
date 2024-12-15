/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        mint: {
          50: '#f0f9f6',
          100: '#d7f0e9',
          200: '#b3e5d9',
          300: '#84d1c4',
          400: '#5cb8ae',
          500: '#3a9e95',
          600: '#2d7f7a',
        },
        teal: {
          50: '#f0f9f9',
          100: '#d7f1f3',
          200: '#b3e5e9',
          300: '#84d1d9',
          400: '#5cb8c4',
          500: '#3a9ea9',
          600: '#2d7f89',
        },
      },
      backgroundImage: {
        'pattern': "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='50' cy='50' r='40' fill='none' stroke='%233a9e9520' stroke-width='1'/%3E%3C/svg%3E\")",
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.800'),
            a: {
              color: theme('colors.mint.600'),
              '&:hover': {
                color: theme('colors.mint.700'),
              },
            },
            'h1, h2, h3, h4': {
              color: theme('colors.gray.900'),
              fontWeight: theme('fontWeight.bold'),
            },
            ul: {
              li: {
                '&::marker': {
                  color: theme('colors.mint.500'),
                },
              },
            },
            ol: {
              li: {
                '&::marker': {
                  color: theme('colors.mint.500'),
                },
              },
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/typography'),
  ],
};