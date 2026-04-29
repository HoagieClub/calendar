'use client';

import { useEffect, useRef, useState } from 'react';

import { Heading, Pane, Text, useTheme } from 'evergreen-ui';

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

const CATEGORY_STYLES: Record<
	EventCategory,
	{ background: string; border: string; color: string; label: string }
> = {
	'Social Events': {
		background: '#fff3f1',
		border: '#ef6b61',
		color: '#c2473d',
		label: 'SOCIAL EVENTS',
	},
	Academic: {
		background: '#f2f7ff',
		border: '#5b87ff',
		color: '#446fd9',
		label: 'ACADEMIC',
	},
	'Free Food': {
		background: '#fff6eb',
		border: '#ef9b3d',
		color: '#cf7a1f',
		label: 'FREE FOOD',
	},
	'Arts & Culture': {
		background: '#f7f0ff',
		border: '#9b6cff',
		color: '#7d55da',
		label: 'ARTS & CULTURE',
	},
	'Sports & Fitness': {
		background: '#edf9f1',
		border: '#66c78d',
		color: '#439965',
		label: 'SPORTS & FITNESS',
	},
	Career: {
		background: '#f3f0ff',
		border: '#7266f0',
		color: '#5b50cc',
		label: 'CAREER',
	},
	'Housing & Sales': {
		background: '#fff1f3',
		border: '#eb5f78',
		color: '#c94f64',
		label: 'HOUSING & SALES',
	},
	Other: {
		background: '#f4f5f7',
		border: '#9aa3b2',
		color: '#5f6773',
		label: 'OTHER',
	},
};

export type CalendarEvent = {
	id: number;
	name: string;
	startHour: number;
	endHour: number;
	location: string;
	host: string;
	attendees: number;
	category?: EventCategory;
	description?: string;
};

type EventProps = {
	event: CalendarEvent;
	top: number;
	left: string;
	width: string;
	height: number;
};

export function formatEventTime(startHour: number, endHour: number): string {
	const toLabel = (value: number) => {
		const hours = Math.floor(value);
		const minutes = Math.round((value - hours) * 60);
		const period = hours < 12 ? 'AM' : 'PM';
		const normalizedHour = hours % 12 === 0 ? 12 : hours % 12;
		const minuteLabel = minutes === 0 ? '' : `:${String(minutes).padStart(2, '0')}`;
		return `${normalizedHour}${minuteLabel} ${period}`;
	};

	return `${toLabel(startHour)} - ${toLabel(endHour)}`;
}

export function Event({ event, top, left, width, height }: EventProps) {
	const { colors } = useTheme();
	const showExpandedDetails = height >= 120;
	const showLocation = height >= 80;
	const titleLineClamp = height >= 120 ? 2 : 1;
	const categoryStyle = event.category
		? CATEGORY_STYLES[event.category]
		: CATEGORY_STYLES['Other'];
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
						{cardWidth >= 130 ? (
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
