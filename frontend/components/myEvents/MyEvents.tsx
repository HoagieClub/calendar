'use client';

import React, { useState, useRef, useEffect } from 'react';

import { useTheme } from 'evergreen-ui';

// ── Types ─────────────────────────────────────────────────────

type Tab = 'All' | 'Saved' | 'Created';
type SortOption = 'Date (soonest)' | 'Date (latest)' | 'Recently added';

type Category = 'SPORTS' | 'ACADEMIC' | 'SOCIAL' | 'FOOD' | 'ARTS' | 'CAREER' | 'HOUSING' | 'OTHER';

const ALL_CATEGORIES: Category[] = [
	'SPORTS',
	'ACADEMIC',
	'SOCIAL',
	'FOOD',
	'ARTS',
	'CAREER',
	'HOUSING',
	'OTHER',
];

const CATEGORY_COLORS: Record<Category, { bg: string; text: string }> = {
	SPORTS: { bg: '#E8F5E9', text: '#2E7D32' },
	ACADEMIC: { bg: '#E3F2FD', text: '#1565C0' },
	SOCIAL: { bg: '#F3E5F5', text: '#6A1B9A' },
	FOOD: { bg: '#FFF3E0', text: '#E65100' },
	ARTS: { bg: '#FCE4EC', text: '#AD1457' },
	CAREER: { bg: '#E8EAF6', text: '#283593' },
	HOUSING: { bg: '#E0F2F1', text: '#00695C' },
	OTHER: { bg: '#F5F5F5', text: '#424242' },
};

interface Event {
	id: string;
	title: string;
	dateISO: string;
	displayDate: string;
	timeRange: string;
	location: string;
	description: string;
	interested: number;
	category: Category;
	tab: Tab[];
	isStarred?: boolean;
	isOwned?: boolean;
}

// ── Mock Data ─────────────────────────────────────────────────

const EVENTS: Event[] = [
	{
		id: '1',
		title: 'Mock Interview Night',
		dateISO: '2026-04-06',
		displayDate: 'MON, APR 6',
		timeRange: '6 PM – 8 PM',
		location: 'Robertson Hall',
		description:
			'Practice behavioral and technical interviews with alumni volunteers from top tech and finance firms. Sign up for ...',
		interested: 29,
		category: 'CAREER',
		tab: ['All', 'Saved'],
		isStarred: true,
	},
	{
		id: '2',
		title: 'AI at Princeton: LLM Fine-Tuning Workshop',
		dateISO: '2026-04-07',
		displayDate: 'TUE, APR 7',
		timeRange: '6 PM – 8 PM',
		location: 'COS Building Room 302',
		description:
			'Hands-on workshop on fine-tuning large language models using LoRA and QLoRA. Bring your laptop with ...',
		interested: 118,
		category: 'ACADEMIC',
		tab: ['All', 'Saved'],
		isStarred: true,
	},
	{
		id: '3',
		title: 'Preview Day',
		dateISO: '2026-04-08',
		displayDate: 'WED, APR 8',
		timeRange: '',
		location: 'University-wide',
		description:
			'Princeton Preview Day for admitted students. Campus tours, info sessions, and class visits across all...',
		interested: 0,
		category: 'SOCIAL',
		tab: ['All', 'Saved'],
		isStarred: true,
	},
	{
		id: '4',
		title: 'Campus YMCA Yoga',
		dateISO: '2026-04-10',
		displayDate: 'FRI, APR 10',
		timeRange: '4:30 PM – 5:30 PM',
		location: 'Dillon Gymnasium',
		description: 'All-level yoga class. No experience needed — just bring a mat!',
		interested: 45,
		category: 'SPORTS',
		tab: ['All', 'Created'],
		isOwned: true,
	},
	{
		id: '5',
		title: 'Spring Fling Food Festival',
		dateISO: '2026-04-12',
		displayDate: 'SUN, APR 12',
		timeRange: '12 PM – 4 PM',
		location: 'Prospect Garden',
		description:
			'Student-run food fair with dishes from 20+ cuisines. Live music and lawn games included.',
		interested: 203,
		category: 'FOOD',
		tab: ['All', 'Created'],
		isOwned: true,
	},
	{
		id: '6',
		title: 'A Cappella Showcase',
		dateISO: '2026-04-15',
		displayDate: 'WED, APR 15',
		timeRange: '7 PM – 9 PM',
		location: 'Richardson Auditorium',
		description: 'Six Princeton a cappella groups perform in this semester-end showcase.',
		interested: 87,
		category: 'ARTS',
		tab: ['All', 'Created'],
		isOwned: true,
	},
];

// ── Sort Options ──────────────────────────────────────────────

const SORT_OPTIONS: SortOption[] = ['Date (soonest)', 'Date (latest)', 'Recently added'];

// ── Dropdown Hook ─────────────────────────────────────────────

function useClickOutside(ref: React.RefObject<HTMLElement>, cb: () => void) {
	useEffect(() => {
		function handler(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) cb();
		}
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, [ref, cb]);
}

// ── Component ─────────────────────────────────────────────────

export default function MyEvents() {
	const { colors } = useTheme();
	const themeColors = colors as any;

	const TEAL = themeColors['hoagie-teal'] ?? '#00897B';

	const [activeTab, setActiveTab] = useState<Tab>('All');
	const [search, setSearch] = useState('');
	const [sort, setSort] = useState<SortOption>('Date (soonest)');
	const [sortOpen, setSortOpen] = useState(false);
	const [categoryOpen, setCategoryOpen] = useState(false);
	const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

	const sortRef = useRef<HTMLDivElement>(null!);
	const categoryRef = useRef<HTMLDivElement>(null!);

	useClickOutside(sortRef, () => setSortOpen(false));
	useClickOutside(categoryRef, () => setCategoryOpen(false));

	const tabCounts = {
		All: EVENTS.length,
		Saved: EVENTS.filter((e) => e.tab.includes('Saved')).length,
		Created: EVENTS.filter((e) => e.tab.includes('Created')).length,
	};

	const query = search.trim().toLowerCase();

	const filtered = EVENTS.filter((e) => {
		if (!e.tab.includes(activeTab)) return false;
		if (query && !e.title.toLowerCase().includes(query)) return false;
		if (selectedCategories.length > 0 && !selectedCategories.includes(e.category)) return false;
		return true;
	}).sort((a, b) => {
		if (sort === 'Date (soonest)')
			return new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime();
		if (sort === 'Date (latest)')
			return new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime();
		if (sort === 'Recently added') return Number(b.id) - Number(a.id);
		return 0;
	});

	function toggleCategory(cat: Category) {
		setSelectedCategories((prev) =>
			prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
		);
	}

	const categoryLabel =
		selectedCategories.length === 0
			? 'Category'
			: selectedCategories.length === 1
				? selectedCategories[0]
				: `${selectedCategories.length} categories`;

	return (
		<div style={{ padding: 32, background: colors.white, minHeight: '100%' }}>
			{/* Header */}
			<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
				<h1
					style={{ fontSize: 22, fontWeight: 700, color: themeColors.gray900, margin: 0 }}
				>
					My Events
				</h1>
			</div>

			{/* Tabs */}
			<div
				style={{
					display: 'flex',
					gap: 24,
					marginTop: 16,
					borderBottom: `1px solid ${themeColors.gray200}`,
				}}
			>
				{(['All', 'Saved', 'Created'] as Tab[]).map((tab) => (
					<button
						key={tab}
						onClick={() => setActiveTab(tab)}
						style={{
							border: 'none',
							background: 'none',
							cursor: 'pointer',
							fontSize: 14,
							fontWeight: activeTab === tab ? 600 : 400,
							color: activeTab === tab ? TEAL : themeColors.gray600,
							borderBottom:
								activeTab === tab ? `2px solid ${TEAL}` : '2px solid transparent',
							paddingBottom: 10,
							marginBottom: -1,
							transition: 'color 0.15s, border-color 0.15s',
						}}
					>
						{tab} ({tabCounts[tab]})
					</button>
				))}
			</div>

			{/* Search + Filters */}
			<div style={{ display: 'flex', gap: 10, marginTop: 16, alignItems: 'center' }}>
				{/* Search */}
				<div style={{ flex: 1, position: 'relative' }}>
					<svg
						width={15}
						height={15}
						viewBox='0 0 24 24'
						fill='none'
						stroke={themeColors.gray400}
						strokeWidth={2.2}
						style={{
							position: 'absolute',
							left: 10,
							top: '50%',
							transform: 'translateY(-50%)',
							pointerEvents: 'none',
						}}
					>
						<circle cx='11' cy='11' r='8' />
						<line x1='21' y1='21' x2='16.65' y2='16.65' />
					</svg>
					<input
						placeholder='Search my events...'
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						style={{
							width: '100%',
							padding: '8px 10px 8px 32px',
							border: `1px solid ${themeColors.gray300}`,
							borderRadius: 6,
							fontSize: 13,
							background: colors.white,
							color: themeColors.gray800,
							outline: 'none',
							boxSizing: 'border-box',
						}}
					/>
				</div>

				{/* Sort Dropdown */}
				<div ref={sortRef} style={{ position: 'relative' }}>
					<button
						onClick={() => {
							setSortOpen((o) => !o);
							setCategoryOpen(false);
						}}
						style={dropdownButtonStyle(themeColors, colors, sortOpen, TEAL)}
					>
						<svg
							width={13}
							height={13}
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth={2}
							style={{ marginRight: 5 }}
						>
							<line x1='8' y1='6' x2='21' y2='6' />
							<line x1='8' y1='12' x2='21' y2='12' />
							<line x1='8' y1='18' x2='21' y2='18' />
							<line x1='3' y1='6' x2='3.01' y2='6' />
							<line x1='3' y1='12' x2='3.01' y2='12' />
							<line x1='3' y1='18' x2='3.01' y2='18' />
						</svg>
						{sort}
						<span style={{ marginLeft: 5, opacity: 0.5, fontSize: 10 }}>▾</span>
					</button>
					{sortOpen && (
						<DropdownMenu>
							{SORT_OPTIONS.map((opt) => (
								<DropdownItem
									key={opt}
									label={opt}
									selected={sort === opt}
									themeColors={themeColors}
									teal={TEAL}
									onClick={() => {
										setSort(opt);
										setSortOpen(false);
									}}
								/>
							))}
						</DropdownMenu>
					)}
				</div>

				{/* Category Dropdown */}
				<div ref={categoryRef} style={{ position: 'relative' }}>
					<button
						onClick={() => {
							setCategoryOpen((o) => !o);
							setSortOpen(false);
						}}
						style={dropdownButtonStyle(
							themeColors,
							colors,
							categoryOpen,
							TEAL,
							selectedCategories.length > 0
						)}
					>
						<svg
							width={13}
							height={13}
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth={2}
							style={{ marginRight: 5 }}
						>
							<polygon points='22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3' />
						</svg>
						{categoryLabel}
						{selectedCategories.length > 0 && (
							<span
								style={{
									marginLeft: 6,
									background: TEAL,
									color: '#fff',
									borderRadius: '50%',
									width: 16,
									height: 16,
									fontSize: 10,
									display: 'inline-flex',
									alignItems: 'center',
									justifyContent: 'center',
									fontWeight: 700,
								}}
							>
								{selectedCategories.length}
							</span>
						)}
						<span style={{ marginLeft: 5, opacity: 0.5, fontSize: 10 }}>▾</span>
					</button>
					{categoryOpen && (
						<DropdownMenu minWidth={200}>
							{selectedCategories.length > 0 && (
								<div
									onClick={() => setSelectedCategories([])}
									style={{
										padding: '8px 12px',
										fontSize: 12,
										cursor: 'pointer',
										color: TEAL,
										fontWeight: 600,
										borderBottom: `1px solid #f0f0f0`,
									}}
								>
									Clear all
								</div>
							)}
							{ALL_CATEGORIES.map((cat) => {
								const isSelected = selectedCategories.includes(cat);
								const style = CATEGORY_COLORS[cat];
								return (
									<div
										key={cat}
										onClick={() => toggleCategory(cat)}
										style={{
											padding: '8px 12px',
											cursor: 'pointer',
											display: 'flex',
											alignItems: 'center',
											gap: 8,
											background: isSelected ? '#f9f9f9' : 'transparent',
										}}
									>
										<span
											style={{
												display: 'inline-block',
												width: 8,
												height: 8,
												borderRadius: '50%',
												background: style.text,
												flexShrink: 0,
											}}
										/>
										<span
											style={{
												fontSize: 12,
												fontWeight: 600,
												background: style.bg,
												color: style.text,
												padding: '2px 7px',
												borderRadius: 4,
												letterSpacing: '0.03em',
											}}
										>
											{cat}
										</span>
										{isSelected && (
											<svg
												width={13}
												height={13}
												viewBox='0 0 24 24'
												fill='none'
												stroke={TEAL}
												strokeWidth={2.5}
												style={{ marginLeft: 'auto' }}
											>
												<polyline points='20 6 9 17 4 12' />
											</svg>
										)}
									</div>
								);
							})}
						</DropdownMenu>
					)}
				</div>
			</div>

			{/* Active category chips */}
			{selectedCategories.length > 0 && (
				<div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
					{selectedCategories.map((cat) => {
						const s = CATEGORY_COLORS[cat];
						return (
							<span
								key={cat}
								onClick={() => toggleCategory(cat)}
								style={{
									display: 'inline-flex',
									alignItems: 'center',
									gap: 4,
									fontSize: 11,
									fontWeight: 600,
									background: s.bg,
									color: s.text,
									padding: '3px 8px',
									borderRadius: 20,
									cursor: 'pointer',
									letterSpacing: '0.03em',
								}}
							>
								{cat}
								<svg
									width={9}
									height={9}
									viewBox='0 0 24 24'
									fill='none'
									stroke={s.text}
									strokeWidth={3}
								>
									<line x1='18' y1='6' x2='6' y2='18' />
									<line x1='6' y1='6' x2='18' y2='18' />
								</svg>
							</span>
						);
					})}
				</div>
			)}

			{/* Grid */}
			{filtered.length === 0 ? (
				<div
					style={{
						marginTop: 60,
						textAlign: 'center',
						color: themeColors.gray500,
						fontSize: 14,
					}}
				>
					No events match your filters.
				</div>
			) : (
				<div
					style={{
						marginTop: 20,
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
						gap: 16,
					}}
				>
					{filtered.map((event) => (
						<EventCard
							key={event.id}
							event={event}
							themeColors={themeColors}
							colors={colors}
							teal={TEAL}
						/>
					))}
				</div>
			)}
		</div>
	);
}

// ── Dropdown helpers ──────────────────────────────────────────

function dropdownButtonStyle(
	themeColors: any,
	colors: any,
	isOpen: boolean,
	teal: string,
	hasActive = false
) {
	return {
		padding: '7px 12px',
		border: `1px solid ${hasActive || isOpen ? teal : themeColors.gray300}`,
		borderRadius: 6,
		background: hasActive ? `${teal}10` : colors.white,
		cursor: 'pointer',
		color: hasActive ? teal : themeColors.gray700,
		fontSize: 13,
		fontWeight: hasActive ? 600 : 400,
		display: 'flex',
		alignItems: 'center',
		whiteSpace: 'nowrap' as const,
		transition: 'border-color 0.15s, background 0.15s',
	};
}

function DropdownMenu({
	children,
	minWidth = 160,
}: {
	children: React.ReactNode;
	minWidth?: number;
}) {
	return (
		<div
			style={{
				position: 'absolute',
				right: 0,
				top: 'calc(100% + 6px)',
				background: '#fff',
				border: '1px solid #e5e7eb',
				borderRadius: 8,
				minWidth,
				zIndex: 50,
				boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
				overflow: 'hidden',
			}}
		>
			{children}
		</div>
	);
}

function DropdownItem({
	label,
	selected,
	themeColors,
	teal,
	onClick,
}: {
	label: string;
	selected: boolean;
	themeColors: any;
	teal: string;
	onClick: () => void;
}) {
	return (
		<div
			onClick={onClick}
			style={{
				padding: '9px 14px',
				cursor: 'pointer',
				fontSize: 13,
				color: selected ? teal : themeColors.gray800,
				fontWeight: selected ? 600 : 400,
				background: selected ? `${teal}08` : 'transparent',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
			}}
		>
			{label}
			{selected && (
				<svg
					width={13}
					height={13}
					viewBox='0 0 24 24'
					fill='none'
					stroke={teal}
					strokeWidth={2.5}
				>
					<polyline points='20 6 9 17 4 12' />
				</svg>
			)}
		</div>
	);
}

// ── Event Card ────────────────────────────────────────────────

function EventCard({
	event,
	themeColors,
	colors,
}: {
	event: Event;
	themeColors: any;
	colors: any;
	teal: string;
}) {
	const catStyle = CATEGORY_COLORS[event.category];

	return (
		<div
			style={{
				border: `1px solid ${themeColors.gray200}`,
				borderRadius: 10,
				overflow: 'hidden',
				background: colors.white,
				display: 'flex',
				flexDirection: 'column',
				transition: 'box-shadow 0.15s, border-color 0.15s',
				cursor: 'pointer',
			}}
			onMouseEnter={(e) => {
				(e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.09)';
				(e.currentTarget as HTMLDivElement).style.borderColor = themeColors.gray300;
			}}
			onMouseLeave={(e) => {
				(e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
				(e.currentTarget as HTMLDivElement).style.borderColor = themeColors.gray200;
			}}
		>
			<div style={{ padding: '14px 14px 12px' }}>
				{/* Date + Category + Star */}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						marginBottom: 6,
					}}
				>
					<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
						<span
							style={{
								fontSize: 11,
								color: themeColors.gray700,
								fontWeight: 500,
								letterSpacing: '0.04em',
							}}
						>
							{event.displayDate}
						</span>
						<span
							style={{
								fontSize: 10,
								fontWeight: 700,
								letterSpacing: '0.05em',
								background: catStyle.bg,
								color: catStyle.text,
								padding: '2px 7px',
								borderRadius: 4,
							}}
						>
							{event.category}
						</span>
					</div>
					{event.isStarred && (
						<svg
							width={15}
							height={15}
							viewBox='0 0 24 24'
							fill='#F6C744'
							stroke='#F6C744'
							strokeWidth={1.5}
						>
							<polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' />
						</svg>
					)}
				</div>

				{/* Title */}
				<div
					style={{
						fontWeight: 700,
						fontSize: 15,
						color: themeColors.gray900,
						lineHeight: 1.3,
					}}
				>
					{event.title}
				</div>

				{/* Time + Location */}
				{(event.timeRange || event.location) && (
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: 6,
							marginTop: 6,
							fontSize: 12,
							color: themeColors.gray700,
						}}
					>
						{event.timeRange && (
							<>
								<svg
									width={11}
									height={11}
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth={2}
								>
									<circle cx='12' cy='12' r='10' />
									<polyline points='12 6 12 12 16 14' />
								</svg>
								<span>{event.timeRange}</span>
							</>
						)}
						{event.location && (
							<>
								<span style={{ opacity: 0.4 }}>•</span>
								<svg
									width={11}
									height={11}
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth={2}
								>
									<path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' />
									<circle cx='12' cy='10' r='3' />
								</svg>
								<span>{event.location}</span>
							</>
						)}
					</div>
				)}

				{/* Description */}
				{event.description && (
					<div
						style={{
							fontSize: 12,
							marginTop: 8,
							color: themeColors.gray900,
							lineHeight: 1.5,
							display: '-webkit-box',
							WebkitLineClamp: 2,
							WebkitBoxOrient: 'vertical',
							overflow: 'hidden',
						}}
					>
						{event.description}
					</div>
				)}
			</div>

			{/* Footer */}
			<div
				style={{
					marginTop: 'auto',
					borderTop: `1px solid ${themeColors.gray100}`,
					padding: '8px 14px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
				}}
			>
				{event.interested > 0 ? (
					<span style={{ fontSize: 12, color: themeColors.gray600 }}>
						<b style={{ color: themeColors.gray700 }}>{event.interested}</b> interested
					</span>
				) : (
					<span />
				)}
				{event.isOwned && (
					<button
						onClick={(e) => e.stopPropagation()}
						style={{
							fontSize: 12,
							padding: '4px 10px',
							border: `1px solid ${themeColors.gray300}`,
							borderRadius: 5,
							background: colors.white,
							cursor: 'pointer',
							color: themeColors.gray700,
							fontWeight: 500,
						}}
					>
						Edit
					</button>
				)}
			</div>
		</div>
	);
}
