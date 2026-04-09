'use client';

import { useTheme } from 'evergreen-ui';

import { useEvents, getCategoryColor } from '@/lib/hoagie-ui/useEvents';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MAX_VISIBLE_EVENTS = 3;

function getMonthMatrix(year: number, month: number): (Date | null)[][] {
	const firstDay = new Date(year, month, 1).getDay();
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const cells: (Date | null)[] = [
		...Array(firstDay).fill(null),
		...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
	];
	while (cells.length % 7 !== 0) cells.push(null);
	const weeks: (Date | null)[][] = [];
	for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
	return weeks;
}

function isSameDay(a: Date, b: Date): boolean {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

function formatEventTime(iso: string): string {
	const d = new Date(iso);
	const h = d.getHours();
	const min = d.getMinutes();
	const suffix = h >= 12 ? 'p' : 'a';
	const hour = h % 12 === 0 ? 12 : h % 12;
	return min === 0 ? `${hour}${suffix}` : `${hour}:${String(min).padStart(2, '0')}${suffix}`;
}

interface MonthViewProps {
	month?: number; // 0-indexed
	year?: number;
}

export default function MonthView({ month, year }: MonthViewProps) {
	const { colors } = useTheme();

	const now = new Date();
	const displayMonth = month !== undefined ? month : now.getMonth();
	const displayYear = year !== undefined ? year : now.getFullYear();

	const weeks = getMonthMatrix(displayYear, displayMonth);

	const startTime = new Date(displayYear, displayMonth, 1);
	const endTime = new Date(displayYear, displayMonth + 1, 0, 23, 59, 59);
	const { events } = useEvents(startTime, endTime);

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				overflow: 'hidden',
				background: colors.white,
				fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
				fontSize: 14,
				color: colors.gray800,
				border: `1px solid ${colors.gray400}`,
				borderRadius: 16,
			}}
		>
			{/* ── Day name header row ── */}
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(7, 1fr)',
					borderBottom: `1px solid ${colors.gray400}`,
					background: colors.gray200,
					flexShrink: 0,
					zIndex: 10,
				}}
			>
				{DAYS.map((day) => (
					<div
						key={day}
						style={{
							textAlign: 'center',
							padding: '10px 0 8px',
							fontSize: 10,
							fontWeight: 500,
							letterSpacing: '0.04em',
							color: colors.gray700,
							textTransform: 'uppercase',
							borderLeft: `1px solid ${colors.gray400}`,
						}}
					>
						{day}
					</div>
				))}
			</div>

			{/* ── Calendar rows ── */}
			<div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
				{weeks.map((week, wi) => (
					<div
						key={wi}
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(7, 1fr)',
							flex: 1,
							borderBottom:
								wi < weeks.length - 1 ? `1px solid ${colors.gray400}` : 'none',
						}}
					>
						{week.map((date, di) => {
							const isToday =
								date !== null &&
								date.getDate() === now.getDate() &&
								date.getMonth() === now.getMonth() &&
								date.getFullYear() === now.getFullYear();

							const dayEvents = date
								? events.filter((e) => isSameDay(new Date(e.start), date))
								: [];
							const visibleEvents = dayEvents.slice(0, MAX_VISIBLE_EVENTS);
							const overflow = dayEvents.length - MAX_VISIBLE_EVENTS;

							return (
								<div
									key={di}
									style={{
										minHeight: 110,
										padding: '6px',
										borderLeft: `1px solid ${colors.gray400}`,
										background: date === null ? colors.gray100 : colors.white,
										boxSizing: 'border-box',
										position: 'relative',
										overflow: 'hidden',
									}}
								>
									{date !== null && (
										<>
											{/* Date number */}
											<div
												style={{
													display: 'inline-flex',
													alignItems: 'center',
													justifyContent: 'center',
													width: 28,
													height: 28,
													borderRadius: '50%',
													background: isToday
														? colors.selected
														: 'transparent',
													color: isToday ? colors.white : colors.gray900,
													fontSize: 13,
													fontWeight: isToday ? 700 : 400,
													marginBottom: 3,
												}}
											>
												{date.getDate()}
											</div>

											{/* Event pills */}
											<div
												style={{
													display: 'flex',
													flexDirection: 'column',
													gap: 2,
												}}
											>
												{visibleEvents.map((event) => {
													const color = getCategoryColor(event.category);
													return (
														<div
															key={event.id}
															title={event.name}
															style={{
																background: color.bg,
																color: color.text,
																borderRadius: 4,
																padding: '2px 5px',
																fontSize: 11,
																fontWeight: 500,
																whiteSpace: 'nowrap',
																overflow: 'hidden',
																textOverflow: 'ellipsis',
																cursor: 'pointer',
															}}
														>
															{formatEventTime(event.start)}{' '}
															{event.name}
														</div>
													);
												})}

												{overflow > 0 && (
													<div
														style={{
															fontSize: 11,
															color: colors.gray600,
															paddingLeft: 2,
															cursor: 'pointer',
														}}
													>
														+{overflow} more
													</div>
												)}
											</div>
										</>
									)}
								</div>
							);
						})}
					</div>
				))}
			</div>
		</div>
	);
}
