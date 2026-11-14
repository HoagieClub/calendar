'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

const TEAL = '#1fa8a8';
const DEBOUNCE_MS = 300;

export type SearchFilters = {
	query: string;
	name: string;
	host: string;
	from: string; // YYYY-MM-DD or ''
	to: string; // YYYY-MM-DD or ''
};

export const emptyFilters: SearchFilters = { query: '', name: '', host: '', from: '', to: '' };

type SearchBarProps = {
	/** Debounced. Fires after typing pauses, or immediately on Enter / Search / Clear. */
	onSearch: (filters: SearchFilters) => void;
	placeholder?: string;
};

function clean(f: SearchFilters): SearchFilters {
	return { ...f, query: f.query.trim(), name: f.name.trim(), host: f.host.trim() };
}

export default function SearchBar({ onSearch, placeholder = 'Search events...' }: SearchBarProps) {
	const [filters, setFilters] = useState<SearchFilters>(emptyFilters);
	const [panelOpen, setPanelOpen] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	// Always call the latest onSearch without making it an effect dependency.
	const onSearchRef = useRef(onSearch);
	useEffect(() => {
		onSearchRef.current = onSearch;
	});

	// Last payload actually sent. Prevents duplicate requests.
	const lastSent = useRef(JSON.stringify(emptyFilters));

	const rangeInvalid = Boolean(filters.from && filters.to && filters.from > filters.to);

	function emit(f: SearchFilters) {
		if (f.from && f.to && f.from > f.to) return;
		const cleaned = clean(f);
		const key = JSON.stringify(cleaned);
		if (key === lastSent.current) return;
		lastSent.current = key;
		onSearchRef.current(cleaned);
	}

	// Debounced live emit for every field.
	useEffect(() => {
		const t = setTimeout(() => emit(filters), DEBOUNCE_MS);
		return () => clearTimeout(t);
	}, [filters]);

	function update(patch: Partial<SearchFilters>) {
		setFilters((f) => ({ ...f, ...patch }));
	}

	function handleClearAll() {
		setFilters(emptyFilters);
		emit(emptyFilters);
	}

	function handleCloseX() {
		handleClearAll();
		setPanelOpen(false);
	}

	// Global shortcuts. Handler is stored in a ref so the window listener
	// is bound once but always sees current state.
	const keyHandler = useRef<(e: KeyboardEvent) => void>(() => {});
	useEffect(() => {
		keyHandler.current = (e) => {
			if (e.key === 'Escape') {
				if (panelOpen || Object.values(filters).some(Boolean)) handleCloseX();
				return;
			}
			if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;

			// Don't hijack "/" while typing somewhere else.
			const el = e.target as HTMLElement | null;
			const tag = el?.tagName;
			if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el?.isContentEditable)
				return;

			e.preventDefault(); // otherwise "/" gets typed into the input
			setPanelOpen(true);
			inputRef.current?.focus();
		};
	});

	useEffect(() => {
		const listener = (e: KeyboardEvent) => keyHandler.current(e);
		window.addEventListener('keydown', listener);
		return () => window.removeEventListener('keydown', listener);
	}, []);

	const active = Object.values(filters).some(Boolean);

	return (
		<div
			style={{
				width: '100%',
				maxWidth: 1440,
				fontFamily: "'Inter', sans-serif",
				fontSize: 14,
			}}
		>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 8,
					border: `2px solid ${TEAL}`,
					borderRadius: 10,
					padding: '6px 10px',
					background: '#fff',
				}}
			>
				<span aria-hidden style={{ color: TEAL }}>
					🔍
				</span>
				<input
					ref={inputRef}
					value={filters.query}
					onChange={(e) => update({ query: e.target.value })}
					onKeyDown={(e) => e.key === 'Enter' && emit(filters)}
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

				{panelOpen ? (
					<button
						type='button'
						onClick={handleCloseX}
						aria-label='Close advanced search'
						style={iconButton}
					>
						×
					</button>
				) : (
					<>
						{active && (
							<button
								type='button'
								onClick={handleClearAll}
								aria-label='Clear search'
								style={iconButton}
							>
								×
							</button>
						)}
						<button
							type='button'
							onClick={() => setPanelOpen(true)}
							aria-expanded={false}
							style={{
								border: `1px solid ${TEAL}`,
								background: '#fff',
								color: TEAL,
								borderRadius: 6,
								padding: '2px 8px',
								cursor: 'pointer',
								fontSize: 12,
							}}
						>
							Advanced ▼
						</button>
					</>
				)}
			</div>

			{panelOpen && (
				<form
					onSubmit={(e) => {
						e.preventDefault();
						emit(filters);
					}}
					style={{
						marginTop: 10,
						display: 'grid',
						gridTemplateColumns: '1fr 1fr',
						gap: 12,
						padding: 14,
						border: '1px solid #d9dee3',
						borderRadius: 10,
						background: '#fff',
					}}
				>
					<Field label='Event name'>
						<input
							value={filters.name}
							onChange={(e) => update({ name: e.target.value })}
							placeholder='e.g. Study Group'
							style={inputStyle}
						/>
					</Field>
					<Field label='Host / Organizer'>
						<input
							value={filters.host}
							onChange={(e) => update({ host: e.target.value })}
							placeholder='e.g. Math Club'
							style={inputStyle}
						/>
					</Field>
					<Field label='From'>
						<input
							type='date'
							value={filters.from}
							max={filters.to || undefined}
							onChange={(e) => update({ from: e.target.value })}
							style={inputStyle}
						/>
					</Field>
					<Field label='To'>
						<input
							type='date'
							value={filters.to}
							min={filters.from || undefined}
							onChange={(e) => update({ to: e.target.value })}
							style={inputStyle}
						/>
					</Field>

					<div
						style={{
							gridColumn: '1 / -1',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'flex-end',
							gap: 8,
						}}
					>
						{rangeInvalid && (
							<span
								role='alert'
								style={{ color: '#b91c1c', fontSize: 12, marginRight: 'auto' }}
							>
								&quot;From&quot; must be on or before &quot;To&quot;.
							</span>
						)}
						<button type='button' onClick={handleClearAll} style={secondaryButton}>
							Clear
						</button>
						<button type='submit' style={primaryButton}>
							Search
						</button>
					</div>
				</form>
			)}
		</div>
	);
}

function Field({ label, children }: { label: string; children: ReactNode }) {
	return (
		<label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
			<span
				style={{
					fontSize: 10,
					fontWeight: 600,
					letterSpacing: '0.05em',
					color: '#6b7280',
					textTransform: 'uppercase',
				}}
			>
				{label}
			</span>
			{children}
		</label>
	);
}

const iconButton: CSSProperties = {
	border: 'none',
	background: 'transparent',
	cursor: 'pointer',
	fontSize: 16,
};

const inputStyle: CSSProperties = {
	border: '1px solid #d9dee3',
	borderRadius: 6,
	padding: '6px 8px',
	fontSize: 13,
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

const secondaryButton: CSSProperties = {
	background: '#fff',
	color: '#374151',
	border: '1px solid #d9dee3',
	borderRadius: 6,
	padding: '6px 16px',
	cursor: 'pointer',
};
