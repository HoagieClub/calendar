'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

import { layoutAllDayEvents } from '@/lib/allDayEvents';
import { getCategoryColor } from '@/lib/hoagie-ui/useEvents';
import type { CalendarEvent } from '@/types';

/** Match the non-scrolling strip to the usable width of the hour grid. */
export function useScrollbarWidth(ref: RefObject<HTMLDivElement | null>) {
	const [width, setWidth] = useState(0);
	useEffect(() => {
		const element = ref.current;
		if (!element) return;
		const update = () =>
			setWidth(
				element.offsetWidth -
					element.clientWidth -
					parseFloat(getComputedStyle(element).borderLeftWidth || '0') -
					parseFloat(getComputedStyle(element).borderRightWidth || '0')
			);
		update();
		const observer = new ResizeObserver(update);
		observer.observe(element);
		return () => observer.disconnect();
	}, [ref]);
	return width;
}

export default function AllDayStrip({
	events,
	dates,
	gutter,
	rightInset = 0,
	onSelect,
}: {
	events: CalendarEvent[];
	dates: Date[];
	gutter: number;
	rightInset?: number;
	onSelect?: (event: CalendarEvent) => void;
}) {
	const { bars, hidden } = layoutAllDayEvents(events, dates);
	const laneCount = Math.max(1, ...bars.map((bar) => bar.lane + 1));
	const hasOverflow = hidden.some((items) => items.length > 0);
	const [openDay, setOpenDay] = useState<number | null>(null);
	const root = useRef<HTMLDivElement>(null);
	const range = dates.map((date) => date.toDateString()).join();
	useEffect(() => {
		function dismiss(event: MouseEvent) {
			if (!root.current?.contains(event.target as Node)) setOpenDay(null);
		}
		function escape(event: KeyboardEvent) {
			if (event.key === 'Escape') setOpenDay(null);
		}
		document.addEventListener('mousedown', dismiss);
		document.addEventListener('keydown', escape);
		return () => {
			document.removeEventListener('mousedown', dismiss);
			document.removeEventListener('keydown', escape);
		};
	}, []);
	return (
		<div
			ref={root}
			style={{
				display: 'flex',
				flexShrink: 0,
				borderBottom: '1px solid #cbd5e1',
				paddingRight: rightInset,
				background: '#fff',
				position: 'relative',
				zIndex: 20,
			}}
		>
			<div
				style={{
					width: gutter,
					flexShrink: 0,
					fontSize: 10,
					paddingTop: 8,
					textAlign: 'center',
					color: '#64748b',
				}}
			>
				All-day
			</div>
			<div
				style={{
					flex: 1,
					minWidth: 0,
					display: 'grid',
					gridTemplateColumns: `repeat(${dates.length}, minmax(0, 1fr))`,
					gridTemplateRows: `repeat(${laneCount}, 26px)${hasOverflow ? ' 24px' : ''}`,
					padding: '3px 0',
					position: 'relative',
				}}
			>
				{bars.map(({ event, start, end, lane, continuesBefore, continuesAfter }) => (
					<button
						key={event.id}
						type='button'
						title={event.name}
						onClick={() => onSelect?.(event)}
						style={{
							gridColumn: `${start + 1} / ${end + 2}`,
							gridRow: lane + 1,
							margin: '2px 3px',
							borderRadius: 4,
							border: 0,
							background: getCategoryColor(event.category).border,
							color: 'white',
							display: 'flex',
							alignItems: 'center',
							gap: 4,
							padding: '2px 6px',
							fontSize: 11,
							cursor: 'pointer',
							minWidth: 0,
						}}
					>
						{continuesBefore && <span style={{ flexShrink: 0 }}>← continues</span>}
						<span
							style={{
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
								flex: 1,
								textAlign: 'left',
							}}
						>
							{event.name}
						</span>
						{continuesAfter && <span style={{ flexShrink: 0 }}>continues →</span>}
					</button>
				))}
				{hidden.map(
					(items, day) =>
						items.length > 0 && (
							<div
								key={`${range}-${day}`}
								style={{
									gridColumn: day + 1,
									gridRow: laneCount + 1,
									position: 'relative',
								}}
							>
								<button
									type='button'
									aria-expanded={openDay === day}
									onClick={() => setOpenDay(openDay === day ? null : day)}
									style={{ fontSize: 11, cursor: 'pointer' }}
								>
									+{items.length} more
								</button>
								{openDay === day && (
									<div
										role='dialog'
										aria-label={`More events for ${dates[day].toLocaleDateString()}`}
										style={{
											position: 'absolute',
											top: '100%',
											...(day >= dates.length / 2
												? { right: 0 }
												: { left: 0 }),
											width: 260,
											maxHeight: 240,
											overflowY: 'auto',
											padding: 8,
											background: 'white',
											border: '1px solid #cbd5e1',
											borderRadius: 6,
											boxShadow: '0 4px 16px #0002',
										}}
									>
										{items.map((event) => (
											<button
												key={event.id}
												type='button'
												onClick={() => {
													setOpenDay(null);
													onSelect?.(event);
												}}
												style={{
													display: 'block',
													width: '100%',
													padding: 8,
													textAlign: 'left',
													cursor: 'pointer',
												}}
											>
												{event.name}
												<br />
												<small>
													{new Date(event.start).toLocaleDateString()} –{' '}
													{new Date(event.end).toLocaleDateString()}
												</small>
											</button>
										))}
									</div>
								)}
							</div>
						)
				)}
			</div>
		</div>
	);
}
