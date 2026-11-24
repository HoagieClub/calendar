'use client';

import type { ReactNode } from 'react';

import { useTheme } from 'evergreen-ui';

import MiniCalendar, { type DateRange } from '@/components/sidebar/MiniCalendar';

export const SIDEBAR_WIDTH = 260;
/** For the toggle button's aria-controls. */
export const SIDEBAR_ID = 'calendar-sidebar';

export default function CalendarSidebar({
	open = true,
	selectedDate,
	visibleRange,
	onDateChange,
	refreshToken,
	filters,
}: {
	/** False slides the sidebar out of view so the calendar grid gets the room. */
	open?: boolean;
	/** The date the main calendar is on. */
	selectedDate: Date;
	/** The days the main calendar shows. */
	visibleRange: DateRange;
	/** Moves the main calendar to the clicked date. */
	onDateChange: (date: Date) => void;
	/** Bump to refetch the mini calendar's event dots (see useEvents). */
	refreshToken?: number;
	/** Space for the category filters (CALR-39), shown below the mini calendar. */
	filters?: ReactNode;
}) {
	const { colors } = useTheme();

	// The outer box animates its width and clips. The panel inside keeps its full width and
	// sits at the right edge, so it slides out to the left instead of squeezing. The sidebar
	// stays mounted while closed (the mini calendar keeps the month you browsed to), and inert
	// keeps its buttons out of the tab order and away from screen readers.
	return (
		<aside
			id={SIDEBAR_ID}
			aria-label='Calendar sidebar'
			inert={!open}
			className='transition-[width] duration-200 ease-out motion-reduce:transition-none'
			style={{
				display: 'flex',
				justifyContent: 'flex-end',
				width: open ? SIDEBAR_WIDTH : 0,
				flexShrink: 0,
				overflow: 'hidden',
			}}
		>
			<div
				style={{
					width: SIDEBAR_WIDTH,
					flexShrink: 0,
					overflowY: 'auto',
					background: colors.white,
					borderRight: `1px solid ${colors.gray300}`,
				}}
			>
				<div style={{ padding: 16 }}>
					<MiniCalendar
						selectedDate={selectedDate}
						visibleRange={visibleRange}
						onDateChange={onDateChange}
						refreshToken={refreshToken}
					/>
				</div>
				{filters && (
					<section
						aria-label='Category filters'
						style={{ borderTop: `1px solid ${colors.gray300}`, padding: 16 }}
					>
						{filters}
					</section>
				)}
			</div>
		</aside>
	);
}
