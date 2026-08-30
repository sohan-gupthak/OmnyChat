import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement> & {
	name: IconName;
	size?: number | string;
};

export type IconName =
	| 'arrow-left'
	| 'arrow-right'
	| 'arrow-up'
	| 'check'
	| 'check-double'
	| 'check-circle'
	| 'x'
	| 'plus'
	| 'search'
	| 'send'
	| 'lock'
	| 'shield'
	| 'user-plus'
	| 'users'
	| 'user'
	| 'logout'
	| 'menu'
	| 'bell'
	| 'info'
	| 'warning'
	| 'error'
	| 'spinner'
	| 'comment'
	| 'message'
	| 'pencil'
	| 'trash'
	| 'globe'
	| 'eye'
	| 'wifi';

const PATHS: Record<IconName, React.ReactNode> = {
	'arrow-left': <path d="M19 12H5M12 19l-7-7 7-7" />,
	'arrow-right': <path d="M5 12h14M12 5l7 7-7 7" />,
	'arrow-up': <path d="M12 19V5M5 12l7-7 7 7" />,
	check: <path d="M20 6L9 17l-5-5" />,
	'check-double': (
		<>
			<path d="M18 6L7 17l-4-4" />
			<path d="M22 10L13 19l-2-2" />
		</>
	),
	'check-circle': (
		<>
			<circle cx="12" cy="12" r="10" />
			<path d="M9 12l2 2 4-4" />
		</>
	),
	x: (
		<>
			<line x1="18" y1="6" x2="6" y2="18" />
			<line x1="6" y1="6" x2="18" y2="18" />
		</>
	),
	plus: <path d="M12 5v14M5 12h14" />,
	search: (
		<>
			<circle cx="11" cy="11" r="8" />
			<line x1="21" y1="21" x2="16.65" y2="16.65" />
		</>
	),
	send: <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />,
	lock: (
		<>
			<rect x="3" y="11" width="18" height="11" rx="2" />
			<path d="M7 11V7a5 5 0 0110 0v4" />
		</>
	),
	shield: <path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z" />,
	'user-plus': (
		<>
			<path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
			<circle cx="9" cy="7" r="4" />
			<line x1="19" y1="8" x2="19" y2="14" />
			<line x1="22" y1="11" x2="16" y2="11" />
		</>
	),
	users: (
		<>
			<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
			<circle cx="9" cy="7" r="4" />
			<path d="M23 21v-2a4 4 0 00-3-3.87" />
			<path d="M16 3.13a4 4 0 010 7.75" />
		</>
	),
	user: (
		<>
			<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
			<circle cx="12" cy="7" r="4" />
		</>
	),
	logout: (
		<>
			<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
			<polyline points="16 17 21 12 16 7" />
			<line x1="21" y1="12" x2="9" y2="12" />
		</>
	),
	menu: (
		<>
			<line x1="3" y1="6" x2="21" y2="6" />
			<line x1="3" y1="12" x2="21" y2="12" />
			<line x1="3" y1="18" x2="21" y2="18" />
		</>
	),
	bell: (
		<>
			<path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
			<path d="M13.73 21a2 2 0 01-3.46 0" />
		</>
	),
	info: (
		<>
			<circle cx="12" cy="12" r="10" />
			<line x1="12" y1="16" x2="12" y2="12" />
			<line x1="12" y1="8" x2="12" y2="8" />
		</>
	),
	warning: (
		<>
			<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
			<line x1="12" y1="9" x2="12" y2="13" />
			<line x1="12" y1="17" x2="12" y2="17" />
		</>
	),
	error: (
		<>
			<circle cx="12" cy="12" r="10" />
			<line x1="15" y1="9" x2="9" y2="15" />
			<line x1="9" y1="9" x2="15" y2="15" />
		</>
	),
	spinner: (
		<>
			<path d="M21 12a9 9 0 11-6.219-8.56" />
		</>
	),
	comment: <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />,
	message: (
		<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
	),
	pencil: (
		<>
			<path d="M12 20h9" />
			<path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4z" />
		</>
	),
	trash: (
		<>
			<polyline points="3 6 5 6 21 6" />
			<path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
		</>
	),
	globe: (
		<>
			<circle cx="12" cy="12" r="10" />
			<line x1="2" y1="12" x2="22" y2="12" />
			<path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
		</>
	),
	eye: (
		<>
			<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
			<circle cx="12" cy="12" r="3" />
		</>
	),
	wifi: (
		<>
			<path d="M5 12.55a11 11 0 0114 0" />
			<path d="M1.42 9a16 16 0 0121.16 0" />
			<path d="M8.53 16.11a6 6 0 016.95 0" />
			<circle cx="12" cy="20" r="1" />
		</>
	),
};

export const Icon: React.FC<IconProps> = ({
	name,
	size = 16,
	strokeWidth = 1.75,
	...rest
}) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={strokeWidth}
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
		{...rest}
	>
		{PATHS[name]}
	</svg>
);

export const Spinner: React.FC<{ size?: number }> = ({ size = 16 }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
		style={{ animation: 'om-spin 0.8s linear infinite' }}
	>
		<path d="M21 12a9 9 0 11-6.219-8.56" />
	</svg>
);

export const Avatar: React.FC<{
	name: string;
	online?: boolean;
	size?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({ name, online, size = 'md' }) => {
	const cls =
		size === 'sm'
			? 'om-avatar'
			: size === 'lg'
				? 'om-avatar om-avatar--lg'
				: size === 'xl'
					? 'om-avatar om-avatar--xl'
					: 'om-avatar';
	const initial = (name || '?').trim().charAt(0).toUpperCase();
	return (
		<span className={cls} aria-hidden="true">
			{initial}
			{online !== undefined && (
				<span
					className={`om-status-dot ${online ? 'om-status-dot--online' : ''}`}
					aria-hidden="true"
				/>
			)}
		</span>
	);
};