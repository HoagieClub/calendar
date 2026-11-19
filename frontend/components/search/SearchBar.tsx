'use client';

import { type CSSProperties, useEffect, useRef, useState } from 'react';

const TEAL = '#1fa8a8';

type SearchBarProps = {
	/** Fires on Enter or the Search button only, with a trimmed non-empty query. */
	onSearch: (query: string) => void;
	/** Fires on Esc (from inside the bar) or the X. Parent returns to the calendar. */
	onClear: () => void;
	placeholder?: string;
	/** Small navbar version: fixed width, no Search button (Enter still searches), X always shown. */
	compact?: boolean;
};

function MagnifierIcon() {
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
			aria-hidden
			style={{ flexShrink: 0, color: '#6b7280' }}
		>
			<circle cx='11' cy='11' r='8' />
			<line x1='21' y1='21' x2='16.65' y2='16.65' />
		</svg>
	);
}

export default function SearchBar({
	onSearch,
	onClear,
	placeholder = 'Search events...',
	compact = false,
}: SearchBarProps) {
	const [query, setQuery] = useState('');
	const inputRef = useRef<HTMLInputElement>(null);

	function clear() {
		setQuery('');
		onClear();
	}

	function submit() {
		const q = query.trim();
		if (!q) return; // backend returns 400 without q, so never send an empty search
		onSearch(q);
	}

	// "/" focuses the search input unless the user is already typing somewhere.
	useEffect(() => {
		function onKeyDown(e: KeyboardEvent) {
			if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;

			const el = e.target as HTMLElement | null;
			const tag = el?.tagName;
			if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el?.isContentEditable)
				return;

			e.preventDefault(); // don't type the "/" into the input
			inputRef.current?.focus();
		}

		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, []);

	return (
		<form
			role='search'
			onSubmit={(e) => {
				e.preventDefault();
				submit();
			}}
			onKeyDown={(e) => {
				if (e.key === 'Escape') clear(); // only when focus is inside the bar
			}}
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: 8,
				width: compact ? 260 : '100%',
				maxWidth: compact ? undefined : 1440,
				flexShrink: 0,
				border: `${compact ? 1.5 : 2}px solid ${TEAL}`,
				borderRadius: compact ? 8 : 10,
				padding: compact ? '4px 8px' : '6px 10px',
				background: '#fff',
				fontFamily: "'Inter', sans-serif",
				fontSize: 14,
			}}
		>
			<MagnifierIcon />
			<input
				ref={inputRef}
				autoFocus
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				placeholder={placeholder}
				aria-label='Search events'
				style={{
					flex: 1,
					minWidth: 0,
					border: 'none',
					outline: 'none',
					fontSize: 14,
					background: 'transparent',
				}}
			/>
			{(compact || query) && (
				<button type='button' onClick={clear} aria-label='Clear search' style={iconButton}>
					×
				</button>
			)}
			{!compact && (
				<button type='submit' style={primaryButton}>
					Search
				</button>
			)}
		</form>
	);
}

const iconButton: CSSProperties = {
	border: 'none',
	background: 'transparent',
	cursor: 'pointer',
	fontSize: 18,
};

const primaryButton: CSSProperties = {
	background: TEAL,
	color: '#fff',
	border: 'none',
	borderRadius: 6,
	padding: '6px 16px',
	cursor: 'pointer',
	fontWeight: 600,
};
