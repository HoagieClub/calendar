'use client';

import { useState } from 'react';

import { ChevronLeftIcon, ChevronRightIcon, useTheme } from 'evergreen-ui';

import { getCategoryColorByName, useEvents } from '@/lib/hoagie-ui/useEvents';
import type { CalendarEvent } from '@/types';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MAX_DOTS = 3;
const DAY_SIZE = 28;
// Muted text that still reads at 4.5:1 on white and on the range tint. The theme's gray700
// (#808080) is only 3.9:1 on white.
const MUTED_TEXT = '#6b6b6b';

/** First and last day shown in the main calendar, inclusive. */
export type DateRange = { start: Date; end: Date };

function startOfDay(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dayKey(date: Date): string {
	return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/** Whole weeks (Sunday to Saturday) covering the month, including days from the months around it. */
function getMonthGrid(year: number, month: number): Date[] {
	const leading = new Date(year, month, 1).getDay();
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const total = Math.ceil((leading + daysInMonth) / 7) * 7;
	return Array.from({ length: total }, (_, i) => new Date(year, month, 1 - leading + i));
}

/** Distinct event categories on each day of the grid, in event order. */
function getCategoriesByDay(
	events: CalendarEvent[],
	gridStart: Date,
	gridEnd: Date
): Map<string, string[]> {
	const byDay = new Map<string, string[]>();
	for (const event of events) {
		// The API sends category as a list of IDs (e.g. [1, 3]) while the sample data uses a
		// name, so compare and key on a string instead of the raw value.
		const category = String(event.category);
		const start = new Date(event.start);
		// An event that ends exactly at midnight does not reach into that day.
		const last = new Date(new Date(event.end).getTime() - 1);
		const stop = last > gridEnd ? gridEnd : last;
		let day = startOfDay(start < gridStart ? gridStart : start);
		while (day <= stop) {
			const key = dayKey(day);
			const categories = byDay.get(key) ?? [];
			if (!categories.includes(category)) categories.push(category);
			byDay.set(key, categories);
			day = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
		}
	}
	return byDay;
}

export default function MiniCalendar({
	selectedDate,
	visibleRange,
	onDateChange,
	refreshToken,
}: {
	/** The date the main calendar is on. */
	selectedDate: Date;
	/** The days the main calendar shows. They get a light highlight. */
	visibleRange: DateRange;
	/** Called with the clicked date. */
	onDateChange: (date: Date) => void;
	/** Bump to refetch the event dots (see useEvents). */
	refreshToken?: number;
}) {
	const { colors } = useTheme();
	const teal = (colors as unknown as Record<string, string>)['hoagie-teal'] ?? '#1EA7AE';
	const rangeTint = `color-mix(in srgb, ${teal} 16%, transparent)`;

	// The arrows browse months without moving the main calendar. Browsing remembers the exact
	// selected date it started from (down to the millisecond). Every time the main calendar
	// sets its date again, even pressing Today while already on today, the mini calendar
	// follows it back.
	const selectedTime = selectedDate.getTime();
	const [browsed, setBrowsed] = useState<{ from: number; year: number; month: number } | null>(
		null
	);
	const shown =
		browsed?.from === selectedTime
			? browsed
			: { year: selectedDate.getFullYear(), month: selectedDate.getMonth() };
	const browse = (step: 1 | -1) => {
		const next = new Date(shown.year, shown.month + step, 1);
		setBrowsed({ from: selectedTime, year: next.getFullYear(), month: next.getMonth() });
	};

	const days = getMonthGrid(shown.year, shown.month);
	const gridStart = days[0];
	const lastDay = days[days.length - 1];
	const gridEnd = new Date(
		lastDay.getFullYear(),
		lastDay.getMonth(),
		lastDay.getDate(),
		23,
		59,
		59,
		999
	);
	const { events } = useEvents(gridStart, gridEnd, refreshToken);
	const categoriesByDay = getCategoriesByDay(events, gridStart, gridEnd);

	const today = startOfDay(new Date()).getTime();
	const rangeStart = startOfDay(visibleRange.start).getTime();
	const rangeEnd = startOfDay(visibleRange.end).getTime();
	const isInRange = (day: Date | undefined) =>
		day !== undefined && day.getTime() >= rangeStart && day.getTime() <= rangeEnd;

	const monthLabel = new Date(shown.year, shown.month, 1).toLocaleString('en-US', {
		month: 'long',
		year: 'numeric',
	});
	// No inline background here: an inline style would override the hover class.
	const arrowClass = 'bg-transparent hover:bg-slate-100';
	const arrowStyle = {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		width: 28,
		height: 28,
		borderRadius: 6,
		border: 'none',
		cursor: 'pointer',
	};

	return (
		<div>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					marginBottom: 8,
				}}
			>
				<button
					type='button'
					aria-label='Previous month'
					className={arrowClass}
					style={arrowStyle}
					onClick={() => browse(-1)}
				>
					<ChevronLeftIcon size={14} color={colors.gray700} />
				</button>
				<span
					aria-live='polite'
					style={{ fontSize: 14, fontWeight: 700, color: colors.gray900 }}
				>
					{monthLabel}
				</span>
				<button
					type='button'
					aria-label='Next month'
					className={arrowClass}
					style={arrowStyle}
					onClick={() => browse(1)}
				>
					<ChevronRightIcon size={14} color={colors.gray700} />
				</button>
			</div>

			<div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
				{WEEKDAYS.map((weekday, i) => (
					<div
						key={i}
						aria-hidden
						style={{
							textAlign: 'center',
							fontSize: 10,
							fontWeight: 600,
							color: MUTED_TEXT,
							paddingBottom: 4,
						}}
					>
						{weekday}
					</div>
				))}

				{days.map((day, i) => {
					const column = i % 7;
					const inMonth = day.getMonth() === shown.month;
					const isToday = day.getTime() === today;
					const inRange = isInRange(day);
					const joinsLeft = column > 0 && isInRange(days[i - 1]);
					const joinsRight = column < 6 && isInRange(days[i + 1]);
					const categories = categoriesByDay.get(dayKey(day)) ?? [];
					let textColor = inMonth ? colors.gray900 : MUTED_TEXT;
					if (isToday) textColor = colors.white;
					let fontWeight = inMonth ? 500 : 400;
					if (isToday) fontWeight = 700;
					const dateLabel = day.toLocaleDateString('en-US', {
						weekday: 'long',
						month: 'long',
						day: 'numeric',
						year: 'numeric',
					});
					return (
						<button
							key={dayKey(day)}
							type='button'
							aria-label={inRange ? `${dateLabel}, shown in calendar` : dateLabel}
							aria-current={isToday ? 'date' : undefined}
							onClick={() => onDateChange(day)}
							style={{
								position: 'relative',
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								height: DAY_SIZE + 10,
								padding: 0,
								border: 'none',
								background: 'transparent',
								cursor: 'pointer',
							}}
						>
							{inRange && (
								<span
									aria-hidden
									style={{
										position: 'absolute',
										top: 0,
										left: joinsLeft ? 0 : 2,
										right: joinsRight ? 0 : 2,
										height: DAY_SIZE,
										background: rangeTint,
										borderTopLeftRadius: joinsLeft ? 0 : DAY_SIZE / 2,
										borderBottomLeftRadius: joinsLeft ? 0 : DAY_SIZE / 2,
										borderTopRightRadius: joinsRight ? 0 : DAY_SIZE / 2,
										borderBottomRightRadius: joinsRight ? 0 : DAY_SIZE / 2,
									}}
								/>
							)}
							<span
								className={isToday ? undefined : 'hover:bg-slate-200/70'}
								style={{
									position: 'relative',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									width: DAY_SIZE,
									height: DAY_SIZE,
									borderRadius: '50%',
									fontSize: 12,
									fontWeight,
									color: textColor,
									...(isToday && { background: teal }),
								}}
							>
								{day.getDate()}
							</span>
							<span
								aria-hidden
								style={{ display: 'flex', gap: 2, height: 5, marginTop: 3 }}
							>
								{categories.slice(0, MAX_DOTS).map((category) => (
									<span
										key={category}
										style={{
											width: 5,
											height: 5,
											borderRadius: '50%',
											background: getCategoryColorByName(category).border,
										}}
									/>
								))}
							</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}
