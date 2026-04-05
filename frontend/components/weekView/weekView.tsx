'use client';

import { useEffect, useRef } from 'react';

import { useTheme } from 'evergreen-ui';

const HOUR_HEIGHT = 60;
const TIME_COL_WIDTH = 56;
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

export default function WeekView() {
	const { colors } = useTheme();
	const themeColors = colors as unknown as Record<string, string>;
	const scrollRef = useRef<HTMLDivElement>(null);
	const now = new Date();
	const weekDates = getWeekDates(now);
	const todayIndex = now.getDay();
	const currentMinuteOffset = (now.getHours() * 60 + now.getMinutes()) * (HOUR_HEIGHT / 60);

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
				color: themeColors.gray800,
				border: `1px solid ${themeColors.gray400}`,
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
				{/* Corner spacer */}
				<div
					style={{
						width: TIME_COL_WIDTH,
						flexShrink: 0,
						borderRight: `1px solid ${colors.gray400}`,
					}}
				/>

				{weekDates.map((date, i) => {
					const isToday = i === todayIndex;
					const dayNum = date.getDate();
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
							{/* Day name */}
							<div
								style={{
									fontSize: 10,
									fontWeight: 500,
									letterSpacing: '0.04em',
									color: isToday
										? themeColors['hoagie-teal']
										: themeColors.gray700,
									textTransform: 'uppercase',
									marginBottom: 4,
								}}
							>
								{DAYS[i]}
							</div>

							{/* Date circle */}
							<div
								style={{
									display: 'inline-flex',
									alignItems: 'center',
									justifyContent: 'center',
									width: 32,
									height: 32,
									borderRadius: '50%',
									background: isToday
										? themeColors['hoagie-teal']
										: 'transparent',
									color: isToday ? themeColors.white : themeColors.gray900,
									fontSize: 16,
									fontWeight: isToday ? 600 : 400,
								}}
							>
								{dayNum}
							</div>
						</div>
					);
				})}
			</div>

			{/* ── Scrollable grid body ── */}
			<div
				ref={scrollRef}
				style={{
					flex: 1,
					overflowY: 'scroll',
					overflowX: 'hidden',
					position: 'relative',
				}}
			>
				<div
					style={{
						display: 'flex',
						position: 'relative',
						height: 24 * HOUR_HEIGHT,
					}}
				>
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
									color: themeColors.gray700,
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
						{weekDates.map((_, colIdx) => (
							<div
								key={colIdx}
								style={{
									flex: 1,
									borderLeft: `1px solid ${colors.gray400}`,
									position: 'relative',
								}}
							>
								{/* Alternating hour rows */}
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
												hour === 0 ? 'none' : `1px solid ${colors.gray400}`,
										}}
									>
										{/* Half-hour line */}
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
							</div>
						))}

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
								style={{
									height: 2,
									background: colors.red500,
									borderRadius: 1,
								}}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
