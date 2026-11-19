'use client';

import type { ReactNode } from 'react';

import { useTheme } from 'evergreen-ui';

import MiniCalendar, { type DateRange } from '@/components/sidebar/MiniCalendar';

export const SIDEBAR_WIDTH = 260;

export default function CalendarSidebar({
	selectedDate,
	visibleRange,
	onDateChange,
	refreshToken,
	filters,
}: {
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

	return (
		<aside
			aria-label='Calendar sidebar'
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
		</aside>
	);
}
