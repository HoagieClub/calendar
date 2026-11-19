'use client';

import { useState } from 'react';

import { useTheme } from 'evergreen-ui';

import { AddEventModal } from '@/components/addEvent/AddEventModal';
import DayView from '@/components/DayView';
import MonthView from '@/components/monthView/MonthView';
import CalendarSidebar, { SIDEBAR_ID } from '@/components/sidebar/CalendarSidebar';
import type { DateRange } from '@/components/sidebar/MiniCalendar';
import WeekView from '@/components/weekView/weekView';
import type { CalendarEvent } from '@/types';

type ViewType = 'Day' | 'Week' | 'Month';

/** The days the main calendar shows for a view: one day, Sunday to Saturday, or the month. */
function getVisibleRange(view: ViewType, date: Date): DateRange {
	const year = date.getFullYear();
	const month = date.getMonth();
	if (view === 'Day') return { start: date, end: date };
	if (view === 'Week') {
		const sunday = date.getDate() - date.getDay();
		return { start: new Date(year, month, sunday), end: new Date(year, month, sunday + 6) };
	}
	return { start: new Date(year, month, 1), end: new Date(year, month + 1, 0) };
}

function formatHeaderDate(view: ViewType, date: Date): string {
	const opts: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
	if (view === 'Month') {
		return date.toLocaleString('en-US', opts);
	}
	if (view === 'Day') {
		return date.toLocaleString('en-US', {
			weekday: 'long',
			month: 'long',
			day: 'numeric',
			year: 'numeric',
		});
	}
	// Week: show range
	const sunday = new Date(date);
	sunday.setDate(date.getDate() - date.getDay());
	const saturday = new Date(sunday);
	saturday.setDate(sunday.getDate() + 6);
	const startMonth = sunday.toLocaleString('en-US', { month: 'short' });
	const endMonth = saturday.toLocaleString('en-US', { month: 'short' });
	const year = saturday.getFullYear();
	if (startMonth === endMonth) {
		return `${startMonth} ${sunday.getDate()} – ${saturday.getDate()}, ${year}`;
	}
	return `${startMonth} ${sunday.getDate()} – ${endMonth} ${saturday.getDate()}, ${year}`;
}

function navigate(view: ViewType, date: Date, direction: 1 | -1): Date {
	const next = new Date(date);
	if (view === 'Day') next.setDate(date.getDate() + direction);
	else if (view === 'Week') next.setDate(date.getDate() + direction * 7);
	else {
		next.setDate(1);
		next.setMonth(date.getMonth() + direction);
		const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
		next.setDate(Math.min(date.getDate(), lastDay));
	}
	return next;
}

// Icons as simple SVG components
function SidebarIcon() {
	return (
		<svg
			width='18'
			height='18'
			viewBox='0 0 24 24'
			fill='none'
			stroke='currentColor'
			strokeWidth='2'
			strokeLinecap='round'
			strokeLinejoin='round'
		>
			<rect x='3' y='3' width='18' height='18' rx='2' />
			<line x1='9' y1='3' x2='9' y2='21' />
		</svg>
	);
}

function SearchIcon() {
	return (
		<svg
			width='18'
			height='18'
			viewBox='0 0 24 24'
			fill='none'
			stroke='currentColor'
			strokeWidth='2'
			strokeLinecap='round'
			strokeLinejoin='round'
		>
			<circle cx='11' cy='11' r='8' />
			<line x1='21' y1='21' x2='16.65' y2='16.65' />
		</svg>
	);
}

function HelpIcon() {
	return (
		<svg
			width='18'
			height='18'
			viewBox='0 0 24 24'
			fill='none'
			stroke='currentColor'
			strokeWidth='2'
			strokeLinecap='round'
			strokeLinejoin='round'
		>
			<circle cx='12' cy='12' r='10' />
			<path d='M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' />
			<line x1='12' y1='17' x2='12.01' y2='17' />
		</svg>
	);
}

function SettingsIcon() {
	return (
		<svg
			width='18'
			height='18'
			viewBox='0 0 24 24'
			fill='none'
			stroke='currentColor'
			strokeWidth='2'
			strokeLinecap='round'
			strokeLinejoin='round'
		>
			<circle cx='12' cy='12' r='3' />
			<path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z' />
		</svg>
	);
}

function ChevronLeft() {
	return (
		<svg
			width='16'
			height='16'
			viewBox='0 0 24 24'
			fill='none'
			stroke='currentColor'
			strokeWidth='2.5'
			strokeLinecap='round'
			strokeLinejoin='round'
		>
			<polyline points='15 18 9 12 15 6' />
		</svg>
	);
}

function ChevronRight() {
	return (
		<svg
			width='16'
			height='16'
			viewBox='0 0 24 24'
			fill='none'
			stroke='currentColor'
			strokeWidth='2.5'
			strokeLinecap='round'
			strokeLinejoin='round'
		>
			<polyline points='9 18 15 12 9 6' />
		</svg>
	);
}

export default function CalendarPage({
	onSelect,
	onAddEvent,
}: {
	onSelect?: (event: CalendarEvent) => void;
	/**
	 * Called by the "+ New Event" button and the "Add an event." link in the empty Day and
	 * Week states. Defaults to opening the built-in create modal.
	 */
	onAddEvent?: () => void;
}) {
	const { colors } = useTheme();
	const themeColors = colors as unknown as Record<string, string>;
	const TEAL = themeColors['hoagie-teal'] ?? '#1EA7AE';

	const [view, setView] = useState<ViewType>('Week');
	const [currentDate, setCurrentDate] = useState(new Date());
	const [isAddOpen, setIsAddOpen] = useState(false);
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	// Bumped after a successful create so the visible view refetches without a reload.
	const [eventsVersion, setEventsVersion] = useState(0);

	const openAddEvent = onAddEvent ?? (() => setIsAddOpen(true));

	const goToToday = () => setCurrentDate(new Date());
	const goBack = () => setCurrentDate(navigate(view, currentDate, -1));
	const goForward = () => setCurrentDate(navigate(view, currentDate, 1));

	const iconButtonStyle = {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		width: 34,
		height: 34,
		borderRadius: 8,
		border: 'none',
		background: 'transparent',
		color: colors.gray700,
		cursor: 'pointer',
		transition: 'background 0.15s',
		// eslint-disable-next-line no-undef
	} as React.CSSProperties;

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				height: '100vh',
				background: colors.gray100,
				fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
			}}
		>
			{/* ── Teal accent bar ── */}
			<div style={{ height: 4, background: TEAL, flexShrink: 0 }} />

			{/* ── Top navbar ── */}
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					height: 56,
					paddingLeft: 16,
					paddingRight: 16,
					background: colors.white,
					borderBottom: `1px solid ${colors.gray300}`,
					flexShrink: 0,
					gap: 8,
				}}
			>
				{/* Sidebar toggle. It lives here, not in the sidebar, so it stays put when the sidebar is hidden. */}
				<button
					style={iconButtonStyle}
					onClick={() => setIsSidebarOpen((open) => !open)}
					title={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
					aria-label='Sidebar'
					aria-expanded={isSidebarOpen}
					aria-controls={SIDEBAR_ID}
				>
					<SidebarIcon />
				</button>

				{/* Navigation: back, Today, forward, date label */}
				<button style={iconButtonStyle} onClick={goBack} title='Previous'>
					<ChevronLeft />
				</button>

				<button
					onClick={goToToday}
					style={{
						height: 32,
						padding: '0 14px',
						borderRadius: 8,
						border: `1px solid ${colors.gray400}`,
						background: colors.white,
						color: colors.gray800,
						fontSize: 13,
						fontWeight: 500,
						cursor: 'pointer',
					}}
				>
					Today
				</button>

				<button style={iconButtonStyle} onClick={goForward} title='Next'>
					<ChevronRight />
				</button>

				<span
					style={{ fontSize: 16, fontWeight: 600, color: colors.gray900, marginLeft: 4 }}
				>
					{formatHeaderDate(view, currentDate)}
				</span>

				{/* Spacer */}
				<div style={{ flex: 1 }} />

				{/* Right side: new event, icon buttons, view switcher */}
				<button
					onClick={openAddEvent}
					style={{
						height: 32,
						padding: '0 14px',
						borderRadius: 8,
						border: 'none',
						background: TEAL,
						color: colors.white,
						fontSize: 13,
						fontWeight: 600,
						cursor: 'pointer',
						marginRight: 4,
					}}
				>
					+ New Event
				</button>
				<button style={iconButtonStyle} title='Search'>
					<SearchIcon />
				</button>
				<button style={iconButtonStyle} title='Help'>
					<HelpIcon />
				</button>
				<button style={iconButtonStyle} title='Settings'>
					<SettingsIcon />
				</button>

				{/* View switcher */}
				<div
					style={{
						display: 'flex',
						background: colors.gray200,
						borderRadius: 10,
						padding: 3,
						gap: 2,
						marginLeft: 8,
					}}
				>
					{(['Day', 'Week', 'Month'] as ViewType[]).map((v) => (
						<button
							key={v}
							onClick={() => setView(v)}
							style={{
								height: 28,
								padding: '0 14px',
								borderRadius: 7,
								border: 'none',
								background: view === v ? colors.white : 'transparent',
								color: view === v ? colors.selected : colors.gray600,
								fontSize: 13,
								fontWeight: view === v ? 600 : 400,
								cursor: 'pointer',
								boxShadow: view === v ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
								transition: 'all 0.15s',
							}}
						>
							{v}
						</button>
					))}
				</div>
			</div>

			<div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
				{/* ── Sidebar ── */}
				<CalendarSidebar
					open={isSidebarOpen}
					selectedDate={currentDate}
					visibleRange={getVisibleRange(view, currentDate)}
					onDateChange={setCurrentDate}
					refreshToken={eventsVersion}
				/>

				{/* ── Main content ── */}
				<div style={{ flex: 1, minWidth: 0, overflow: 'hidden', padding: 16 }}>
					{view === 'Day' && (
						<div style={{ height: '100%' }}>
							<DayView
								date={currentDate}
								onSelect={onSelect}
								onAddEvent={openAddEvent}
								refreshToken={eventsVersion}
							/>
						</div>
					)}
					{view === 'Week' && (
						<div style={{ height: '100%' }}>
							<WeekView
								date={currentDate}
								onSelect={onSelect}
								onAddEvent={openAddEvent}
								refreshToken={eventsVersion}
							/>
						</div>
					)}
					{view === 'Month' && (
						<div style={{ height: '100%' }}>
							<MonthView
								month={currentDate.getMonth()}
								year={currentDate.getFullYear()}
								onSelect={onSelect}
								refreshToken={eventsVersion}
							/>
						</div>
					)}
				</div>
			</div>

			<AddEventModal
				open={isAddOpen}
				onClose={() => setIsAddOpen(false)}
				onCreated={() => setEventsVersion((n) => n + 1)}
			/>
		</div>
	);
}
