'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';

const TEAL = '#1fa8a8';

type SearchBarProps = {
	/** Fires on Enter or the Search button only, with a trimmed non-empty query. */
	onSearch: (query: string) => void;
	/** Fires on Esc or the X. Parent returns to the calendar. */
	onClear: () => void;
	placeholder?: string;
};

export default function SearchBar({
	onSearch,
	onClear,
	placeholder = 'Search events...',
}: SearchBarProps) {
	const [query, setQuery] = useState('');
	const inputRef = useRef<HTMLInputElement>(null);

	function clear() {
		setQuery('');
		onClear();
	}

	// Global shortcuts. The handler lives in a ref so the listener is bound once
	// but always sees current props/state.
	const keyHandler = useRef<(e: KeyboardEvent) => void>(() => {});
	keyHandler.current = (e) => {
		if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;

		const el = e.target as HTMLElement | null;
		const tag = el?.tagName;
		if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el?.isContentEditable)
			return;

		e.preventDefault(); // don't type the "/" into the input
		inputRef.current?.focus();
	};

	useEffect(() => {
		function onKeyDown(e: KeyboardEvent) {
			if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
			const el = e.target as HTMLElement | null;
			const tag = el?.tagName;
			if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el?.isContentEditable)
				return;
			e.preventDefault();
			inputRef.current?.focus();
		}
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, []);

	function submit() {
		const q = query.trim();
		if (!q) return; // backend returns 400 without q, so never send an empty search
		onSearch(q);
	}

	return (
		<form
			role='search'
			onKeyDown={(e) => {
				if (e.key === 'Escape') clear();
			}}
			onSubmit={(e) => {
				e.preventDefault();
				submit();
			}}
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: 8,
				width: '100%',
				maxWidth: 1440,
				border: `2px solid ${TEAL}`,
				borderRadius: 10,
				padding: '6px 10px',
				background: '#fff',
				fontFamily: "'Inter', sans-serif",
				fontSize: 14,
			}}
		>
			<span aria-hidden style={{ color: TEAL }}>
				🔍
			</span>
			<input
				ref={inputRef}
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				placeholder={placeholder}
				aria-label='Search events'
				style={{
					flex: 1,
					border: 'none',
					outline: 'none',
					fontSize: 14,
					background: 'transparent',
				}}
			/>
			{query && (
				<button type='button' onClick={clear} aria-label='Clear search' style={iconButton}>
					×
				</button>
			)}
			<button type='submit' style={primaryButton}>
				Search
			</button>
		</form>
	);
}

const iconButton: React.CSSProperties = {
	border: 'none',
	background: 'transparent',
	cursor: 'pointer',
	fontSize: 18,
};

const primaryButton: React.CSSProperties = {
	background: TEAL,
	color: '#fff',
	border: 'none',
	borderRadius: 6,
	padding: '6px 16px',
	cursor: 'pointer',
	fontWeight: 600,
};
