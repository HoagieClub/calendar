'use client';

import type { CSSProperties, ReactNode } from 'react';

function Icon({ children }: { children: ReactNode }) {
	return (
		<svg
			width='16'
			height='16'
			viewBox='0 0 24 24'
			fill='none'
			stroke='currentColor'
			strokeWidth='2'
			strokeLinecap='round'
			strokeLinejoin='round'
		>
			{children}
		</svg>
	);
}

const icons: Record<string, ReactNode> = {
	social: (
		<Icon>
			<path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
			<circle cx='9' cy='7' r='4' />
			<path d='M22 21v-2a4 4 0 0 0-3-3.87' />
			<path d='M16 3.13a4 4 0 0 1 0 7.75' />
		</Icon>
	),
	academic: (
		<Icon>
			<path d='M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z' />
			<path d='M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' />
		</Icon>
	),
	sports: (
		<Icon>
			<circle cx='12' cy='12' r='10' />
			<path d='M2 12h20' />
			<path d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' />
		</Icon>
	),
	food: (
		<Icon>
			<path d='M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2' />
			<path d='M7 2v20' />
			<path d='M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7' />
		</Icon>
	),
	career: (
		<Icon>
			<rect width='20' height='14' x='2' y='7' rx='2' />
			<path d='M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16' />
		</Icon>
	),
	arts: (
		<Icon>
			<circle cx='12' cy='12' r='10' />
			<path d='M8 14s1.5 2 4 2 4-2 4-2' />
			<line x1='9' y1='9' x2='9.01' y2='9' />
			<line x1='15' y1='9' x2='15.01' y2='9' />
		</Icon>
	),
	other: (
		<Icon>
			<rect width='7' height='7' x='3' y='3' rx='1' />
			<rect width='7' height='7' x='14' y='3' rx='1' />
			<rect width='7' height='7' x='3' y='14' rx='1' />
			<rect width='7' height='7' x='14' y='14' rx='1' />
		</Icon>
	),
};

export const CATEGORIES: { value: string; label: string; color: string }[] = [
	{ value: 'social', label: 'Social Events', color: '#8b45e8' },
	{ value: 'academic', label: 'Academic', color: '#3b6fd9' },
	{ value: 'sports', label: 'Sports', color: '#c0463f' },
	{ value: 'food', label: 'Free food', color: '#e0762f' },
	{ value: 'career', label: 'Career', color: '#b8942a' },
	{ value: 'arts', label: 'Arts and Theater', color: '#3f8a4f' },
	{ value: 'other', label: 'Other', color: '#6b7280' },
];

const chip = (color: string): CSSProperties => ({
	display: 'inline-flex',
	alignItems: 'center',
	gap: 6,
	padding: '4px 10px',
	borderRadius: 10,
	border: `2px solid ${color}`,
	background: '#fff',
	color: '#1f2937',
	fontSize: 13,
	fontWeight: 500,
	cursor: 'pointer',
});

export default function CategoryFilter({
	selected,
	onChange,
}: {
	selected: string[];
	onChange: (next: string[]) => void;
}) {
	const toggle = (value: string) =>
		onChange(
			selected.includes(value) ? selected.filter((s) => s !== value) : [...selected, value]
		);
	const chosen = CATEGORIES.filter((c) => selected.includes(c.value));

	return (
		<div>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<span style={{ fontWeight: 700, fontSize: 15 }}>
					Selected{' '}
					<span
						style={{
							background: '#f1f2f4',
							borderRadius: 999,
							padding: '1px 8px',
							fontSize: 12,
						}}
					>
						{chosen.length}
					</span>
				</span>
				<button
					onClick={() => onChange([])}
					style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 13 }}
				>
					Clear all
				</button>
			</div>

			<div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '10px 0' }}>
				{chosen.length === 0 && (
					<span style={{ color: '#6b7280', fontSize: 13 }}>No filters selected.</span>
				)}
				{chosen.map((c) => (
					<button key={c.value} onClick={() => toggle(c.value)} style={chip(c.color)}>
						{icons[c.value]}
						{c.label}
						<span>×</span>
					</button>
				))}
			</div>

			<hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '12px 0' }} />

			<div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Categories</div>
			<div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
				{CATEGORIES.map((c) => (
					<button key={c.value} onClick={() => toggle(c.value)} style={chip(c.color)}>
						{icons[c.value]}
						{c.label}
					</button>
				))}
			</div>
		</div>
	);
}
