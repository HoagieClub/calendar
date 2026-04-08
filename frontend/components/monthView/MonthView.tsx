'use client';

import { useTheme } from 'evergreen-ui';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getMonthMatrix(year: number, month: number): (Date | null)[][] {
	const firstDay = new Date(year, month, 1).getDay();
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const cells: (Date | null)[] = [
		...Array(firstDay).fill(null),
		...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
	];
	// Pad to full weeks
	while (cells.length % 7 !== 0) cells.push(null);
	const weeks: (Date | null)[][] = [];
	for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
	return weeks;
}

interface MonthViewProps {
	month?: number; // 0-indexed
	year?: number;
}

export default function MonthView({ month, year }: MonthViewProps) {
	const { colors } = useTheme();
	const themeColors = colors as unknown as Record<string, string>;

	const now = new Date();
	const displayMonth = month !== undefined ? month : now.getMonth();
	const displayYear = year !== undefined ? year : now.getFullYear();

	const weeks = getMonthMatrix(displayYear, displayMonth);

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
				color: themeColors.gray800,
				border: `1px solid ${themeColors.gray400}`,
				borderRadius: 16,
			}}
		>
			{/* ── Day name header row ── */}
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(7, 1fr)',
					borderBottom: `1px solid ${themeColors.gray400}`,
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
							color: themeColors.gray700,
							textTransform: 'uppercase',
							borderLeft: `1px solid ${themeColors.gray400}`,
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
								wi < weeks.length - 1 ? `1px solid ${themeColors.gray400}` : 'none',
						}}
					>
						{week.map((date, di) => {
							const isToday =
								date !== null &&
								date.getDate() === now.getDate() &&
								date.getMonth() === now.getMonth() &&
								date.getFullYear() === now.getFullYear();

							return (
								<div
									key={di}
									style={{
										minHeight: 110,
										padding: '8px 10px',
										borderLeft: `1px solid ${themeColors.gray400}`,
										background:
											date === null ? themeColors.gray100 : colors.white,
										boxSizing: 'border-box',
										position: 'relative',
									}}
								>
									{date !== null && (
										<div
											style={{
												display: 'inline-flex',
												alignItems: 'center',
												justifyContent: 'center',
												width: 28,
												height: 28,
												borderRadius: '50%',
												background: isToday
													? themeColors['hoagie-teal']
													: 'transparent',
												color: isToday
													? themeColors.white
													: themeColors.gray900,
												fontSize: 13,
												fontWeight: isToday ? 700 : 400,
											}}
										>
											{date.getDate()}
										</div>
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
