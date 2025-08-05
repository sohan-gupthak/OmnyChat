/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				background: 'var(--color-background)',
				'secondary-background': 'var(--color-secondary-background)',
				foreground: 'var(--color-foreground)',
				'main-foreground': 'var(--color-main-foreground)',
				main: 'var(--color-main)',
				border: 'var(--color-border)',
				ring: 'var(--color-ring)',
				overlay: 'var(--color-overlay)',
				'chart-1': 'var(--color-chart-1)',
				'chart-2': 'var(--color-chart-2)',
				'chart-3': 'var(--color-chart-3)',
				'chart-4': 'var(--color-chart-4)',
				'chart-5': 'var(--color-chart-5)'
			},
			fontFamily: {
				base: ['Inter', 'sans-serif'],
				heading: ['Inter', 'sans-serif']
			},
			fontWeight: {
				base: 'var(--font-weight-base)',
				heading: 'var(--font-weight-heading)'
			},
			borderRadius: {
				base: 'var(--radius-base)'
			},
			boxShadow: {
				neobrutalism: 'var(--shadow-shadow)',
				'neobrutalism-hover': '6px 6px 0px 0px var(--color-border)'
			}
		},
	},
	plugins: [],
};
