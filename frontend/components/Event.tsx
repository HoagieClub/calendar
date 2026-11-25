'use client';

import { useEffect, useRef, useState } from 'react';

import { Heading, Pane, Text, useTheme } from 'evergreen-ui';

import { colorsFor } from '@/lib/categories';
import { formatEventTime } from '@/lib/formatEventTime';

export { formatEventTime };

export const EVENT_CATEGORIES = [
	'Social Events',
	'Academic',
	'Free Food',
	'Arts & Culture',
	'Sports & Fitness',
	'Career',
	'Housing & Sales',
	'Other',
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export type CalendarEvent = {
	id: number | string;
	name: string;
	startHour: number;
	endHour: number;
	location: string;
	host: string;
	attendees?: number;
	category?: string;
	description?: string;
};

type EventProps = {
	event: CalendarEvent;
	top: number;
	left: string;
	width: string;
	height: number;
	onClick?: () => void;
};

export function Event({ event, top, left, width, height, onClick }: EventProps) {
	const { colors } = useTheme();
	const showExpandedDetails = height >= 120;
	const showLocation = height >= 80;
	const titleLineClamp = height >= 120 ? 2 : 1;
	const { color, bg } = colorsFor(event.category);
	const categoryStyle = {
		background: bg,
		border: color,
		color,
		label: (event.category ?? 'Other').toUpperCase(),
	};
	const [isHighlighted, setIsHighlighted] = useState(false);
	const cardRef = useRef<HTMLDivElement>(null);
	const [cardWidth, setCardWidth] = useState(999);

	useEffect(() => {
		const el = cardRef.current;
		if (!el) return;
		const observer = new ResizeObserver(([entry]) => {
			setCardWidth(entry.contentRect.width);
		});
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return (
		<Pane
			position='absolute'
			top={top}
			left={left}
			width={width}
			height={height}
			background={categoryStyle.background}
			borderRadius={10}
			paddingTop={10}
			paddingBottom={10}
			paddingX={12}
			boxShadow='0 6px 18px rgba(100, 116, 139, 0.12)'
			border={`1px solid ${categoryStyle.border}22`}
			overflow='hidden'
			textAlign='left'
			onClick={onClick}
			onMouseEnter={() => setIsHighlighted(true)}
			onMouseLeave={() => setIsHighlighted(false)}
			onFocus={() => setIsHighlighted(true)}
			onBlur={() => setIsHighlighted(false)}
			style={{
				transform: isHighlighted
					? 'translateY(-3px) scale(1.01)'
					: 'translateY(0) scale(1)',
				boxShadow: isHighlighted
					? '0 14px 30px rgba(100, 116, 139, 0.2)'
					: '0 6px 18px rgba(100, 116, 139, 0.12)',
				transition: 'transform 140ms ease, box-shadow 140ms ease',
			}}
		>
			<div ref={cardRef} style={{ width: '100%', height: '100%' }}>
				<Pane
					position='absolute'
					top={0}
					left={0}
					bottom={0}
					width={3}
					background={categoryStyle.border}
				/>
				<Pane display='flex' flexDirection='column' height='100%' paddingLeft={2}>
					<Heading
						size={400}
						color={colors.gray800}
						fontWeight={700}
						style={{
							lineHeight: '18px',
							display: '-webkit-box',
							WebkitBoxOrient: 'vertical',
							WebkitLineClamp: titleLineClamp,
							overflow: 'hidden',
							textOverflow: 'ellipsis',
						}}
					>
						{event.name}
					</Heading>
					<Pane display='flex' alignItems='center' gap={15} marginTop={2}>
						<Text
							size={200}
							fontWeight={500}
							fontSize={12}
							color={colors.gray800}
							overflow='hidden'
							textOverflow='ellipsis'
							whiteSpace='nowrap'
						>
							{formatEventTime(event.startHour, event.endHour)}
						</Text>
						{cardWidth >= 130 && event.attendees !== undefined ? (
							<Text
								size={200}
								fontSize={12}
								fontWeight={500}
								color={colors.muted}
								flexShrink={0}
							>
								{`👥 ${event.attendees}`}
							</Text>
						) : null}
					</Pane>
					{showLocation ? (
						<Text
							fontSize='11px'
							color={colors.muted}
							marginTop={6}
							lineHeight='13px'
							whiteSpace='nowrap'
							overflow='hidden'
							textOverflow='ellipsis'
						>
							{`📍 ${event.location}`}
						</Text>
					) : null}
					{showExpandedDetails ? (
						<Pane
							display='flex'
							alignItems='center'
							gap={6}
							marginTop={6}
							minHeight={16}
						>
							<Pane
								display='flex'
								alignItems='center'
								background={categoryStyle.background}
								border={`1px solid ${categoryStyle.border}22`}
								borderRadius={999}
								paddingX={8}
								flexShrink={0}
							>
								<Text fontSize='10px' color={categoryStyle.color} fontWeight={700}>
									{categoryStyle.label}
								</Text>
							</Pane>
							<Text
								fontSize='10px'
								color={colors.gray700}
								lineHeight='13px'
								whiteSpace='nowrap'
								overflow='hidden'
								textOverflow='ellipsis'
							>
								{`via ${event.host}`}
							</Text>
						</Pane>
					) : null}
				</Pane>
			</div>
		</Pane>
	);
}

export default Event;
