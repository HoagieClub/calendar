'use client';

import { useState } from 'react';

import { useTheme } from 'evergreen-ui';

// ── Types ────────────────────────────────────────────────────────────────────

type Tab = 'All' | 'Saved' | 'Going' | 'Created';
type SortOption = 'Date (soonest)' | 'Recently added' | 'Category';
type Category = 'SPORTS' | 'ACADEMIC' | 'SOCIAL' | 'FOOD' | 'ARTS' | 'CAREER' | 'HOUSING' | 'OTHER';

interface SavedEvent {
	id: string;
	title: string;
	date: string; // e.g. "WED, APR 1"
	timeRange: string; // e.g. "4:30 PM – 5:30 PM"
	location: string;
	description: string;
	interested: number;
	category: Category;
	tab: Tab[]; // which tabs this event appears under
	isStarred?: boolean;
	isOwned?: boolean; // show Edit button
	accentColor: string;
}

// ── Mock data ────────────────────────────────────────────────────────────────

const MOCK_EVENTS: SavedEvent[] = [
	{
		id: '1',
		title: 'Campus YMCA Yoga',
		date: 'WED, APR 1',
		timeRange: '4:30 PM – 5:30 PM',
		location: 'Dillon Gymnasium Dance Studio',
		description:
			'All-levels yoga class open to all Princeton students, staff, and faculty. Mats provided. Wear comfortable clothes.',
		interested: 45,
		category: 'SPORTS',
		tab: ['All', 'Saved'],
		isStarred: true,
		accentColor: '#22c55e',
	},
	{
		id: '2',
		title: 'Debate Club Practice',
		date: 'WED, APR 1',
		timeRange: '4:30 PM – 6 PM',
		location: '1879 Hall',
		description:
			'Princeton Debate Panel weekly practice session. Open to all levels — beginners welcome. Practice British Parliamentary...',
		interested: 18,
		category: 'ACADEMIC',
		tab: ['All', 'Saved'],
		isStarred: true,
		accentColor: '#3b82f6',
	},
	{
		id: '3',
		title: 'Midnight Coding Marathon',
		date: 'THU, APR 2',
		timeRange: '11 PM – 2 AM',
		location: 'CS Building, Room 104',
		description:
			'All-night coding session. Snacks provided! Build something cool from 11 PM to 2 AM.',
		interested: 42,
		category: 'ACADEMIC',
		tab: ['All', 'Going'],
		isStarred: true,
		accentColor: '#3b82f6',
	},
	{
		id: '4',
		title: 'test',
		date: 'THU, APR 2',
		timeRange: '12 PM – 1 PM',
		location: '',
		description: '',
		interested: 0,
		category: 'SOCIAL',
		tab: ['All', 'Created'],
		isOwned: true,
		accentColor: '#ef4444',
	},
	{
		id: '5',
		title: 'Volleyball Championship',
		date: 'SAT, APR 4',
		timeRange: '2 PM – 5 PM',
		location: 'Dillon Gymnasium',
		description: 'Intramural volleyball championship finals. Come cheer on your fellow Tigers!',
		interested: 38,
		category: 'SPORTS',
		tab: ['All', 'Going'],
		isStarred: true,
		accentColor: '#22c55e',
	},
];

const CATEGORY_COLORS: Record<Category, string> = {
	SPORTS: '#22c55e',
	ACADEMIC: '#3b82f6',
	SOCIAL: '#ef4444',
	FOOD: '#f97316',
	ARTS: '#a855f7',
	CAREER: '#6b7280',
	HOUSING: '#f59e0b',
	OTHER: '#14b8a6',
};

const SORT_OPTIONS: SortOption[] = ['Date (soonest)', 'Recently added', 'Category'];

// ── Component ────────────────────────────────────────────────────────────────

export default function SavedEvents() {
	const { colors } = useTheme();
	const themeColors = colors as unknown as Record<string, string>;

	const [activeTab, setActiveTab] = useState<Tab>('All');
	const [search, setSearch] = useState('');
	const [sort, setSort] = useState<SortOption>('Date (soonest)');
	const [sortOpen, setSortOpen] = useState(false);

	const tabCounts: Record<Tab, number> = {
		All: MOCK_EVENTS.length,
		Saved: MOCK_EVENTS.filter((e) => e.tab.includes('Saved')).length,
		Going: MOCK_EVENTS.filter((e) => e.tab.includes('Going')).length,
		Created: MOCK_EVENTS.filter((e) => e.tab.includes('Created')).length,
	};

	const filtered = MOCK_EVENTS.filter((e) => {
		const matchesTab = e.tab.includes(activeTab);
		const matchesSearch =
			search === '' ||
			e.title.toLowerCase().includes(search.toLowerCase()) ||
			e.location.toLowerCase().includes(search.toLowerCase());
		return matchesTab && matchesSearch;
	});

	return (
		<div
			style={{
				flex: 1,
				display: 'flex',
				flexDirection: 'column',
				fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
				background: colors.white,
				height: '100%',
				overflow: 'hidden',
			}}
		>
			{/* ── Header ── */}
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					padding: '24px 32px 0',
					flexShrink: 0,
				}}
			>
				<h1
					style={{
						margin: 0,
						fontSize: 24,
						fontWeight: 700,
						color: themeColors.gray900,
					}}
				>
					Saved Events
				</h1>

				{/* Count badge */}
				<div
					style={{
						width: 32,
						height: 32,
						borderRadius: '50%',
						background: themeColors['hoagie-teal'],
						color: '#fff',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontSize: 14,
						fontWeight: 600,
					}}
				>
					{tabCounts[activeTab]}
				</div>
			</div>

			{/* ── Tabs ── */}
			<div
				style={{
					display: 'flex',
					gap: 24,
					padding: '16px 32px 0',
					borderBottom: `1px solid ${themeColors.gray300}`,
					flexShrink: 0,
				}}
			>
				{(['All', 'Saved', 'Going', 'Created'] as Tab[]).map((tab) => (
					<button
						key={tab}
						onClick={() => setActiveTab(tab)}
						style={{
							background: 'none',
							border: 'none',
							padding: '0 0 12px',
							cursor: 'pointer',
							fontSize: 14,
							fontWeight: activeTab === tab ? 600 : 400,
							color:
								activeTab === tab
									? themeColors['hoagie-teal']
									: themeColors.gray600,
							borderBottom:
								activeTab === tab
									? `2px solid ${themeColors['hoagie-teal']}`
									: '2px solid transparent',
							transition: 'color 0.15s',
							whiteSpace: 'nowrap',
						}}
					>
						{tab}{' '}
						<span
							style={{
								fontSize: 12,
								color:
									activeTab === tab
										? themeColors['hoagie-teal']
										: themeColors.gray500,
							}}
						>
							({tabCounts[tab]})
						</span>
					</button>
				))}
			</div>

			{/* ── Search + Sort ── */}
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					padding: '16px 32px',
					gap: 12,
					flexShrink: 0,
				}}
			>
				{/* Search */}
				<div
					style={{
						flex: 1,
						display: 'flex',
						alignItems: 'center',
						gap: 8,
						border: `1px solid ${themeColors.gray300}`,
						borderRadius: 8,
						padding: '8px 12px',
						background: colors.white,
					}}
				>
					<span style={{ color: themeColors.gray500, fontSize: 14 }}>🔍</span>
					<input
						type='text'
						placeholder='Search my events...'
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						style={{
							border: 'none',
							outline: 'none',
							flex: 1,
							fontSize: 14,
							color: themeColors.gray800,
							background: 'transparent',
						}}
					/>
				</div>

				{/* Sort dropdown */}
				<div style={{ position: 'relative' }}>
					<button
						onClick={() => setSortOpen((o) => !o)}
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: 8,
							padding: '8px 14px',
							border: `1px solid ${themeColors.gray300}`,
							borderRadius: 8,
							background: colors.white,
							cursor: 'pointer',
							fontSize: 14,
							color: themeColors.gray800,
							fontWeight: 500,
							whiteSpace: 'nowrap',
						}}
					>
						{sort}
						<span style={{ fontSize: 10, color: themeColors.gray500 }}>▼</span>
					</button>

					{sortOpen && (
						<div
							style={{
								position: 'absolute',
								right: 0,
								top: 'calc(100% + 4px)',
								background: colors.white,
								border: `1px solid ${themeColors.gray300}`,
								borderRadius: 8,
								boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
								zIndex: 50,
								minWidth: 160,
								overflow: 'hidden',
							}}
						>
							{SORT_OPTIONS.map((option) => (
								<button
									key={option}
									onClick={() => {
										setSort(option);
										setSortOpen(false);
									}}
									style={{
										display: 'block',
										width: '100%',
										padding: '10px 16px',
										border: 'none',
										background:
											sort === option
												? themeColors['hoagie-teal']
												: colors.white,
										color: sort === option ? '#fff' : themeColors.gray800,
										cursor: 'pointer',
										fontSize: 14,
										textAlign: 'left',
										fontWeight: sort === option ? 600 : 400,
									}}
								>
									{option}
								</button>
							))}
						</div>
					)}
				</div>
			</div>

			{/* ── Event cards grid ── */}
			<div
				style={{
					flex: 1,
					overflowY: 'auto',
					padding: '0 32px 32px',
				}}
			>
				{filtered.length === 0 ? (
					<div
						style={{
							textAlign: 'center',
							padding: '48px 0',
							color: themeColors.gray500,
							fontSize: 14,
						}}
					>
						No events found.
					</div>
				) : (
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
							gap: 16,
						}}
					>
						{filtered.map((event) => (
							<EventCard
								key={event.id}
								event={event}
								themeColors={themeColors}
								colors={colors}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

// ── EventCard ────────────────────────────────────────────────────────────────

function EventCard({
	event,
	themeColors,
	colors,
}: {
	event: SavedEvent;
	themeColors: Record<string, string>;
	colors: Record<string, any>;
}) {
	const categoryColor = CATEGORY_COLORS[event.category];

	return (
		<div
			style={{
				border: `1px solid ${themeColors.gray200}`,
				borderRadius: 12,
				overflow: 'hidden',
				background: colors.white,
				display: 'flex',
				flexDirection: 'column',
				boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
				position: 'relative',
			}}
		>
			{/* Colored top accent bar */}
			<div
				style={{
					height: 4,
					background: categoryColor,
					flexShrink: 0,
				}}
			/>

			<div
				style={{
					padding: '14px 16px 16px',
					flex: 1,
					display: 'flex',
					flexDirection: 'column',
					gap: 8,
				}}
			>
				{/* Date + category + star row */}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
					}}
				>
					<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
						<span
							style={{
								fontSize: 11,
								fontWeight: 600,
								color: themeColors.gray600,
								letterSpacing: '0.04em',
							}}
						>
							{event.date}
						</span>
						<span
							style={{
								fontSize: 10,
								fontWeight: 700,
								color: categoryColor,
								background: categoryColor + '18',
								padding: '2px 8px',
								borderRadius: 20,
								letterSpacing: '0.05em',
							}}
						>
							{event.category}
						</span>
					</div>

					{event.isOwned ? (
						<button
							style={{
								fontSize: 12,
								fontWeight: 600,
								color: themeColors.gray700,
								border: `1px solid ${themeColors.gray300}`,
								borderRadius: 6,
								padding: '3px 10px',
								background: colors.white,
								cursor: 'pointer',
							}}
						>
							Edit
						</button>
					) : event.isStarred ? (
						<span style={{ fontSize: 16, color: '#f59e0b' }}>★</span>
					) : null}
				</div>

				{/* Title */}
				<div
					style={{
						fontSize: 16,
						fontWeight: 700,
						color: themeColors.gray900,
						lineHeight: 1.3,
					}}
				>
					{event.title}
				</div>

				{/* Time + location */}
				{(event.timeRange || event.location) && (
					<div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
						{event.timeRange && (
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: 6,
									fontSize: 12,
									color: themeColors.gray600,
								}}
							>
								<span>🕐</span>
								{event.timeRange}
								{event.location && (
									<>
										<span style={{ color: themeColors.gray400 }}>·</span>
										<span style={{ color: '#ef4444' }}>📍</span>
										{event.location}
									</>
								)}
							</div>
						)}
					</div>
				)}

				{/* Description */}
				{event.description && (
					<div
						style={{
							fontSize: 13,
							color: themeColors.gray600,
							lineHeight: 1.5,
							display: '-webkit-box',
							WebkitLineClamp: 3,
							WebkitBoxOrient: 'vertical',
							overflow: 'hidden',
						}}
					>
						{event.description}
					</div>
				)}

				{/* Interested count */}
				{event.interested > 0 && (
					<div
						style={{
							fontSize: 12,
							color: themeColors.gray500,
							marginTop: 'auto',
							paddingTop: 4,
						}}
					>
						{event.interested} interested
					</div>
				)}
			</div>
		</div>
	);
}
