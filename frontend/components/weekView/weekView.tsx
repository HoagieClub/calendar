'use client';

import { useEffect, useRef } from 'react';

import { useTheme } from 'evergreen-ui';

import { useEvents, getCategoryColor } from '@/lib/hoagie-ui/useEvents';
import type { CalendarEvent } from '@/types';

const HOUR_HEIGHT = 60;
const TIME_COL_WIDTH = 56;
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MAX_COLUMNS = 3;

function getWeekDates(date: Date): Date[] {
	const sunday = new Date(date);
	sunday.setDate(date.getDate() - date.getDay());
	sunday.setHours(0, 0, 0, 0);
	return Array.from({ length: 7 }, (_, i) => {
		const d = new Date(sunday);
		d.setDate(sunday.getDate() + i);
		return d;
	});
}

function formatHour(hour: number): string {
	if (hour === 0) return '12 AM';
	if (hour < 12) return `${hour} AM`;
	if (hour === 12) return '12 PM';
	return `${hour - 12} PM`;
}

function formatEventTime(iso: string): string {
	const d = new Date(iso);
	const h = d.getHours();
	const min = d.getMinutes();
	const suffix = h >= 12 ? 'PM' : 'AM';
	const hour = h % 12 === 0 ? 12 : h % 12;
	return min === 0 ? `${hour} ${suffix}` : `${hour}:${String(min).padStart(2, '0')} ${suffix}`;
}

function isSameDay(a: Date, b: Date): boolean {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

function isAllDay(event: CalendarEvent): boolean {
	const start = new Date(event.start);
	const end = new Date(event.end);
	return (
		start.getHours() === 0 &&
		start.getMinutes() === 0 &&
		end.getHours() === 23 &&
		end.getMinutes() === 59
	);
}

function minutesFromMidnight(date: Date): number {
	return date.getHours() * 60 + date.getMinutes();
}

interface PositionedEvent {
	event: CalendarEvent;
	top: number;
	height: number;
	colIndex: number; // which column 0..MAX_COLUMNS-1
	numCols: number; // total visible columns in this group
	isLast: boolean; // is this the last visible column?
	overflow: number; // how many hidden events beyond this group
	overflowColors: string[];
}

function layoutEvents(events: CalendarEvent[]): PositionedEvent[] {
	const sorted = [...events].sort(
		(a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
	);

	const result: PositionedEvent[] = [];
	let groupEnd = -Infinity;
	let group: CalendarEvent[] = [];
	let columns: CalendarEvent[][] = [];

	function flushGroup() {
		if (group.length === 0) return;

		const totalCols = columns.length;
		const visibleCols = columns.slice(0, MAX_COLUMNS);
		const hiddenEvents = columns.slice(MAX_COLUMNS).flat();
		const overflow = hiddenEvents.length;
		const overflowColors = hiddenEvents.map((e) => getCategoryColor(e.category).bg).slice(0, 3);
		const numCols = Math.min(totalCols, MAX_COLUMNS);

		for (let c = 0; c < visibleCols.length; c++) {
			const isLast = c === visibleCols.length - 1;
			for (const ev of visibleCols[c]) {
				const start = new Date(ev.start);
				const end = new Date(ev.end);
				const startMin = minutesFromMidnight(start);
				const durationMin = Math.max(30, (end.getTime() - start.getTime()) / 60000);
				result.push({
					event: ev,
					top: startMin * (HOUR_HEIGHT / 60),
					height: durationMin * (HOUR_HEIGHT / 60) - 2,
					colIndex: c,
					numCols,
					isLast,
					overflow: isLast ? overflow : 0,
					overflowColors: isLast ? overflowColors : [],
				});
			}
		}

		group = [];
		columns = [];
		groupEnd = -Infinity;
	}

	for (const ev of sorted) {
		const start = new Date(ev.start);
		const end = new Date(ev.end);
		const startMin = minutesFromMidnight(start);
		const endMin = minutesFromMidnight(end);

		if (startMin >= groupEnd) {
			flushGroup();
		}

		group.push(ev);
		groupEnd = Math.max(groupEnd, endMin);

		let placed = false;
		for (const col of columns) {
			const last = col[col.length - 1];
			const lastEnd = minutesFromMidnight(new Date(last.end));
			if (startMin >= lastEnd) {
				col.push(ev);
				placed = true;
				break;
			}
		}
		if (!placed) {
			columns.push([ev]);
		}
	}

	flushGroup();
	return result;
}

export default function WeekView() {
	const { colors } = useTheme();
	const scrollRef = useRef<HTMLDivElement>(null);
	const now = new Date();
	const weekDates = getWeekDates(now);
	const todayIndex = now.getDay();
	const currentMinuteOffset = (now.getHours() * 60 + now.getMinutes()) * (HOUR_HEIGHT / 60);

	const startTime = weekDates[0];
	const endTime = new Date(weekDates[6]);
	endTime.setHours(23, 59, 59);
	const { events } = useEvents(startTime, endTime);

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = Math.max(0, currentMinuteOffset - 200);
		}
	}, [currentMinuteOffset]);

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
			{/* ── Day header row ── */}
			<div
				style={{
					display: 'flex',
					borderBottom: `1px solid ${colors.gray400}`,
					background: colors.gray200,
					flexShrink: 0,
					zIndex: 10,
				}}
			>
				<div
					style={{
						width: TIME_COL_WIDTH,
						flexShrink: 0,
						borderRight: `1px solid ${colors.gray400}`,
					}}
				/>
				{weekDates.map((date, i) => {
					const isToday = i === todayIndex;
					return (
						<div
							key={i}
							style={{
								flex: 1,
								textAlign: 'center',
								padding: '10px 0 8px',
								borderLeft: `1px solid ${colors.gray400}`,
							}}
						>
							<div
								style={{
									fontSize: 10,
									fontWeight: 500,
									letterSpacing: '0.04em',
									color: isToday ? colors.selected : colors.gray700,
									textTransform: 'uppercase',
									marginBottom: 4,
								}}
							>
								{DAYS[i]}
							</div>
							<div
								style={{
									display: 'inline-flex',
									alignItems: 'center',
									justifyContent: 'center',
									width: 32,
									height: 32,
									borderRadius: '50%',
									background: isToday ? colors.selected : 'transparent',
									color: isToday ? colors.white : colors.gray900,
									fontSize: 16,
									fontWeight: isToday ? 600 : 400,
								}}
							>
								{date.getDate()}
							</div>
						</div>
					);
				})}
			</div>

			{/* ── ALL-DAY row ── */}
			<div
				style={{
					display: 'flex',
					flexShrink: 0,
					borderBottom: `2px solid ${colors.gray400}`,
					minHeight: 32,
				}}
			>
				<div
					style={{
						width: TIME_COL_WIDTH,
						flexShrink: 0,
						borderRight: `1px solid ${colors.gray400}`,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'flex-end',
						paddingRight: 8,
					}}
				>
					<span
						style={{
							fontSize: 10,
							color: colors.gray500,
							letterSpacing: '0.04em',
							textTransform: 'uppercase',
						}}
					>
						All-day
					</span>
				</div>
				{weekDates.map((date, i) => {
					const allDayEvents = events.filter(
						(e) => isSameDay(new Date(e.start), date) && isAllDay(e)
					);
					return (
						<div
							key={i}
							style={{
								flex: 1,
								borderLeft: `1px solid ${colors.gray400}`,
								padding: '3px 3px',
								display: 'flex',
								flexDirection: 'column',
								gap: 2,
							}}
						>
							{allDayEvents.map((event) => {
								const color = getCategoryColor(event.category);
								return (
									<div
										key={event.id}
										title={event.name}
										style={{
											background: color.bg,
											borderLeft: `3px solid ${color.text}`,
											borderRadius: 3,
											padding: '1px 4px',
											fontSize: 11,
											fontWeight: 600,
											color: color.text,
											whiteSpace: 'nowrap',
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											cursor: 'pointer',
										}}
									>
										{event.name}
									</div>
								);
							})}
						</div>
					);
				})}
			</div>

			{/* ── Scrollable grid body ── */}
			<div
				ref={scrollRef}
				style={{ flex: 1, overflowY: 'scroll', overflowX: 'hidden', position: 'relative' }}
			>
				<div style={{ display: 'flex', position: 'relative', height: 24 * HOUR_HEIGHT }}>
					{/* ── Time labels column ── */}
					<div
						style={{
							width: TIME_COL_WIDTH,
							flexShrink: 0,
							position: 'relative',
							background: colors.gray200,
							borderRight: `1px solid ${colors.gray400}`,
						}}
					>
						{Array.from({ length: 24 }, (_, hour) => (
							<div
								key={hour}
								style={{
									position: 'absolute',
									top: hour * HOUR_HEIGHT - 7,
									right: 8,
									height: HOUR_HEIGHT,
									display: 'flex',
									alignItems: 'flex-start',
									color: colors.gray700,
									fontSize: 10,
									fontWeight: 400,
									whiteSpace: 'nowrap',
									userSelect: 'none',
								}}
							>
								{hour === 0 ? '' : formatHour(hour)}
							</div>
						))}
					</div>

					{/* ── Day columns ── */}
					<div style={{ flex: 1, display: 'flex', position: 'relative' }}>
						{weekDates.map((date, colIdx) => {
							const timedEvents = events.filter(
								(e) => isSameDay(new Date(e.start), date) && !isAllDay(e)
							);
							const positioned = layoutEvents(timedEvents);

							return (
								<div
									key={colIdx}
									style={{
										flex: 1,
										borderLeft: `1px solid ${colors.gray400}`,
										position: 'relative',
									}}
								>
									{/* Hour rows */}
									{Array.from({ length: 24 }, (_, hour) => (
										<div
											key={hour}
											style={{
												position: 'absolute',
												top: hour * HOUR_HEIGHT,
												left: 0,
												right: 0,
												height: HOUR_HEIGHT,
												background:
													hour % 2 === 0 ? colors.white : colors.gray100,
												borderTop:
													hour === 0
														? 'none'
														: `1px solid ${colors.gray400}`,
											}}
										>
											<div
												style={{
													position: 'absolute',
													top: HOUR_HEIGHT / 2,
													left: 0,
													right: 0,
													borderTop: `1px solid ${colors.gray400}`,
													opacity: 0.4,
												}}
											/>
										</div>
									))}

									{/* ── Event tiles ── */}
									{positioned.map(
										({
											event,
											top,
											height,
											colIndex,
											numCols,
											isLast,
											overflow,
											overflowColors,
										}) => {
											const color = getCategoryColor(event.category);
											const isNarrow = numCols > 1;
											const leftPct = (colIndex / numCols) * 100;
											const widthPct = (1 / numCols) * 100;

											return (
												<div
													key={event.id}
													title={event.name}
													style={{
														position: 'absolute',
														top: top + 1,
														left: `calc(${leftPct}% + 2px)`,
														width: `calc(${widthPct}% - 4px)`,
														height: height,
														background: color.bg,
														borderLeft: `3px solid ${color.text}`,
														borderRadius: 4,
														padding: '3px 5px',
														overflow: 'hidden',
														cursor: 'pointer',
														zIndex: 2,
														boxSizing: 'border-box',
													}}
												>
													<div
														style={{
															fontSize: isNarrow ? 10 : 11,
															fontWeight: 600,
															color: color.text,
															whiteSpace: 'nowrap',
															overflow: 'hidden',
															textOverflow: 'ellipsis',
														}}
													>
														{event.name}
													</div>
													{height > 36 && !isNarrow && (
														<div
															style={{
																fontSize: 10,
																color: color.text,
																opacity: 0.8,
																whiteSpace: 'nowrap',
																overflow: 'hidden',
																textOverflow: 'ellipsis',
															}}
														>
															{formatEventTime(event.start)} –{' '}
															{formatEventTime(event.end)}
														</div>
													)}

													{/* Overflow pill on the last visible tile */}
													{isLast && overflow > 0 && (
														<div
															style={{
																position: 'absolute',
																top: 4,
																right: 4,
																display: 'flex',
																alignItems: 'center',
																gap: 2,
																background: colors.white,
																border: `1px solid ${colors.gray300}`,
																borderRadius: 10,
																padding: '1px 5px',
																cursor: 'pointer',
																zIndex: 3,
															}}
														>
															{overflowColors.map((c, ci) => (
																<div
																	key={ci}
																	style={{
																		width: 6,
																		height: 6,
																		borderRadius: '50%',
																		background: c,
																	}}
																/>
															))}
															<span
																style={{
																	fontSize: 10,
																	fontWeight: 600,
																	color: colors.gray700,
																	marginLeft: 1,
																}}
															>
																+{overflow}
															</span>
														</div>
													)}
												</div>
											);
										}
									)}
								</div>
							);
						})}

						{/* ── Current time indicator ── */}
						<div
							style={{
								position: 'absolute',
								top: currentMinuteOffset,
								left: `calc(${(100 / 7) * todayIndex}%)`,
								width: `calc(${100 / 7}%)`,
								zIndex: 5,
								pointerEvents: 'none',
							}}
						>
							<div
								style={{
									position: 'absolute',
									left: -4,
									top: -4,
									width: 8,
									height: 8,
									borderRadius: '50%',
									background: colors.red500,
								}}
							/>
							<div
								style={{ height: 2, background: colors.red500, borderRadius: 1 }}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
