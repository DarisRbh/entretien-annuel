import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
      },
      colors: {
        bg: {
          DEFAULT: '#0f1117',
          2: '#161b27',
          3: '#1e2535',
        },
        accent: {
          DEFAULT: '#3b82f6',
          2: '#6366f1',
        },
        border: 'rgba(255,255,255,0.07)',
      },
    },
  },
  plugins: [],
}
export default config
